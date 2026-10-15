import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

// `req.params.productId` comes from a dynamic route like /cart/:productId.
// This controller checks that the ID is valid and prevents the user from adding
// a product that does not exist or is out of stock.
export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // `find()` returns the first matching cart item for this product. If it is
    // already present, we increase its quantity; otherwise we create a new entry.
    const existingItem = customer.cart.find((item) => item.product.toString() === productId);

    if (existingItem) {
      if (existingItem.quantity + 1 > product.stock) {
        return res.status(400).json({
          success: false,
          message: 'Stock unavailable for this quantity',
        });
      }

      existingItem.quantity += 1;
    } else {
      if (product.stock < 1) {
        return res.status(400).json({
          success: false,
          message: 'Stock unavailable',
        });
      }

      customer.cart.push({ product: product._id, quantity: 1 });
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to cart',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while adding to cart',
    });
  }
};

// .populate() replaces the stored ObjectId references with the actual product
// documents, which lets the frontend render product name, price, and image.
export const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'cart.product',
      select: 'name description price category image stock',
    });

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    return res.status(200).json({
      success: true,
      count: customer.cart.reduce((total, item) => total + item.quantity, 0),
      cart: customer.cart,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching cart',
    });
  }
};

// This route updates the quantity in the nested cart array and performs a stock check
// before saving. The request body is validated before the database is written.
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const cartItem = customer.cart.find((item) => item.product.toString() === productId);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: 'Quantity exceeds available stock',
      });
    }

    cartItem.quantity = quantity;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while updating cart',
    });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const customer = await Customer.findById(req.user._id);

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const exists = customer.cart.some((item) => item.product.toString() === productId);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in cart',
      });
    }

    customer.cart = customer.cart.filter((item) => item.product.toString() !== productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from cart',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while removing from cart',
    });
  }
};
