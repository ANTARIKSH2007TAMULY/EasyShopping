import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
  handleStripeWebhook,
} from '../controllers/order.controller.js';

const router = express.Router();

router.post('/create-payment-order', authMiddleware, createPaymentOrder);
router.post('/verify-payment', authMiddleware, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
router.get('/', authMiddleware, getOrders);
router.get('/:id', authMiddleware, getOrderById);

export default router;
