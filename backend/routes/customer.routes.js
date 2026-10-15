
import express from 'express';
import {
  registerCustomer,
  loginCustomer,
  getCurrentCustomer,
  logoutCustomer,
  changePassword,
} from '../controllers/customer.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerCustomer);
router.post('/login', loginCustomer);
router.get('/me', authMiddleware, getCurrentCustomer);
router.post('/logout', logoutCustomer);
router.patch('/change-password', authMiddleware, changePassword);

export default router;
