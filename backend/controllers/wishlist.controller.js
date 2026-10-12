import mongoose from 'mongoose';
import Customer from '../models/customer.model.js';
import Product from '../models/product.model.js';

export const addToWishlist = async (req, res) => {
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

    const alreadyExists = customer.wishlist.some((item) => item.toString() === productId);

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message: 'Product already in wishlist',
      });
    }

    customer.wishlist.push(product._id);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product added to wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist',
    });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: 'wishlist',
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
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
    });
  }
};

export const removeFromWishlist = async (req, res) => {
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

    const exists = customer.wishlist.some((item) => item.toString() === productId);

    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Product not in wishlist',
      });
    }

    customer.wishlist = customer.wishlist.filter((item) => item.toString() !== productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Product removed from wishlist',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist',
    });
  }
};
