

import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    // The browser stores the JWT in an HttpOnly cookie, so we can read it from
    // the incoming request without exposing it to JavaScript in the frontend.
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // jwt.verify checks the token signature and returns the payload only if the
    // secret matches. In this app, the payload contains the customer id.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // After verification, we look up the real user in MongoDB so we can attach
    // the user object to req.user for downstream controllers.
    const customer = await Customer.findById(decoded.id).select('-password');

    if (!customer) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    req.user = customer;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized' });
  }
};

export default authMiddleware;
