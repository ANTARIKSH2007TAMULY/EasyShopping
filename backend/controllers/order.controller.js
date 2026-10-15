import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import stripe from '../utils/stripe.js';

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

    if (!process.env.STRIPE_SECRET_KEY || !stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe test-mode credentials are not configured.',
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

    const clientUrl = req.headers.origin || process.env.CLIENT_URL || 'http://localhost:5173';

    const line_items = orderItems.map((item) => ({
      price_data: {
        currency: 'inr',
        product_data: {
          name: item.name,
          images: item.image && item.image.startsWith('http') ? [item.image] : [],
        },
        unit_amount: Math.round(Number(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      customer_email: customer.email,
      client_reference_id: String(order._id),
      metadata: {
        orderId: String(order._id),
        userId: String(customer._id),
      },
      success_url: `${clientUrl}/order-success/${order._id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/checkout?canceled=true`,
    });

    order.stripeSessionId = session.id;
    await order.save();

    return res.status(200).json({
      success: true,
      shopKartOrderId: String(order._id),
      sessionId: session.id,
      url: session.url,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
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
    const { shopKartOrderId, sessionId } = req.body;

    if (!shopKartOrderId || !sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details.',
      });
    }

    if (!process.env.STRIPE_SECRET_KEY || !stripe) {
      return res.status(500).json({
        success: false,
        message: 'Stripe secret key is not configured.',
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

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({
        success: true,
        message: 'Payment already verified successfully',
        order,
      });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed on Stripe.',
      });
    }

    order.paymentStatus = 'PAID';
    order.status = 'PLACED';
    order.stripeSessionId = session.id;
    order.stripePaymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
    await order.save();

    const customer = await Customer.findById(req.user._id);
    if (customer) {
      customer.cart = [];
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully via Stripe',
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error while verifying payment',
    });
  }
};

export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (!process.env.STRIPE_WEBHOOK_SECRET || !stripe) {
      return res.status(400).send('Webhook secret not configured');
    }
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.client_reference_id || session.metadata?.orderId;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.paymentStatus !== 'PAID') {
        order.paymentStatus = 'PAID';
        order.status = 'PLACED';
        order.stripeSessionId = session.id;
        order.stripePaymentIntentId =
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.payment_intent?.id;
        await order.save();

        if (order.user) {
          const customer = await Customer.findById(order.user);
          if (customer) {
            customer.cart = [];
            await customer.save();
          }
        }
      }
    }
  }

  return res.status(200).json({ received: true });
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
