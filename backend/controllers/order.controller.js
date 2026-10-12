import crypto from 'crypto';
import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import razorpay from '../utils/razorpay.js';

const parseAddress = (shippingAddress = {}) => {
  const fullName = String(shippingAddress.fullName || '').trim();
  const phone = String(shippingAddress.phone || '').trim();
  const addressLine1 = String(shippingAddress.addressLine1 || '').trim();
  const city = String(shippingAddress.city || '').trim();
  const state = String(shippingAddress.state || '').trim();
  const pincode = String(shippingAddress.pincode || '').trim();

  return {
    fullName,
    phone,
    addressLine1,
    city,
    state,
    pincode,
  };
};

const isValidPhone = (phone) => /^(\+?\d{10,15})$/.test(phone);

export const createPaymentOrder = async (req, res) => {
  try {
    const shippingAddress = parseAddress(req.body.shippingAddress || {});

    const requiredFields = ['fullName', 'phone', 'addressLine1', 'city', 'state', 'pincode'];
    const missingField = requiredFields.find((field) => !shippingAddress[field] || !String(shippingAddress[field]).trim());

    if (missingField) {
      return res.status(400).json({
        success: false,
        message: 'Please complete all shipping details.',
      });
    }

    if (!/^[0-9]{6}$/.test(shippingAddress.pincode)) {
      return res.status(400).json({
        success: false,
        message: 'Pincode must contain exactly 6 digits.',
      });
    }

    if (!isValidPhone(shippingAddress.phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid phone number.',
      });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay credentials are not configured yet.',
      });
    }

    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: '_id name price image stock',
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty.',
      });
    }

    const productIds = customer.cart.map((item) => item.product?._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });

    const productMap = new Map(products.map((product) => [product._id.toString(), product]));

    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of customer.cart) {
      const product = productMap.get(cartItem.product?._id?.toString());

      if (!product) {
        return res.status(400).json({
          success: false,
          message: 'One or more products are no longer available.',
        });
      }

      if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cart quantity.',
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `${product.name} does not have enough stock available.`,
        });
      }

      const itemTotal = Number(product.price) * Number(cartItem.quantity);
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
        image: product.image,
      });
    }

    const order = await Order.create({
      user: customer._id,
      items: orderItems,
      shippingAddress,
      totalAmount,
      paymentStatus: 'PENDING',
      status: 'PENDING_PAYMENT',
    });

    const amountInPaise = Math.round(totalAmount * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: String(order._id),
    });

    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    return res.status(200).json({
      success: true,
      shopKartOrderId: String(order._id),
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating payment order',
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details.',
      });
    }

    if (!process.env.RAZORPAY_KEY_SECRET || !razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay secret is not configured.',
      });
    }

    const order = await Order.findOne({
      _id: shopKartOrderId,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    if (order.razorpayOrderId !== razorpay_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    const body = `${order.razorpayOrderId}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature);
    const receivedBuffer = Buffer.from(razorpay_signature);

    const isValidSignature =
      expectedBuffer.length === receivedBuffer.length &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while verifying payment',
    });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not allowed to access this order',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
    });
  }
};
