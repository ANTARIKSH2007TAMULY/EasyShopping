
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'https://easy-shopping-phi.vercel.app',
  'https://www.easy-shopping-phi.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin || true);
        return;
      }

      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

const connectMongo = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured.');
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
};

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EasyShopping backend is running.',
    environment: process.env.NODE_ENV || 'development',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Healthy',
  });
});

app.get('/ready', async (req, res) => {
  try {
    await connectMongo();
    return res.status(200).json({
      success: true,
      ready: mongoose.connection.readyState === 1,
      message: 'Database ready',
    });
  } catch (error) {
    return res.status(503).json({
      success: false,
      ready: false,
      message: 'Database unavailable',
    });
  }
});

app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/health' || req.path === '/ready') {
    return next();
  }

  try {
    await connectMongo();
    next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable.',
    });
  }
});

app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

const startServer = async () => {
  try {
    await connectMongo();
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'production') {
  startServer();
}

export default app;
