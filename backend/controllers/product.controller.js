import mongoose from 'mongoose';
import Product from '../models/product.model.js';

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    if (!name || !description || !price || !category || !image || stock === undefined || stock === null) {
      return res.status(400).json({
        success: false,
        message: 'All product fields are required',
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be greater than 0',
      });
    }

    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative',
      });
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      price: parsedPrice,
      category: category.trim(),
      image: image.trim(),
      stock: parsedStock,
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating product',
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;
    const query = {};

    if (search && String(search).trim()) {
      query.name = {
        $regex: String(search).trim(),
        $options: 'i',
      };
    }

    if (category && String(category).trim()) {
      query.category = String(category).trim();
    }

    const products = await Product.find(query);

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
    });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product',
    });
  }
};
