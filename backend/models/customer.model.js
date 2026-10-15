

import mongoose from 'mongoose';

// A Mongoose schema defines the shape of a MongoDB document before it is saved.
// Here, each customer stores a profile plus a nested cart and wishlist.
const customerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: [],
  }],
  // Each cart item uses a nested object: product points to a Product document and
  // quantity stores how many units the customer wants.
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
  }],
});
const Customer = mongoose.model('Customer', customerSchema);

export default Customer;
