import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { wrapRouter } from './middleware/asyncHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err?.message || err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [process.env.CLIENT_URL, 'http://localhost:5173'].filter(Boolean),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
if (process.env.NODE_ENV !== 'development') {
  app.use(apiLimiter);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[dbState] || 'unknown';
  res.json({
    success: true,
    message: 'Shivam Traders API is running',
    database: dbStatus,
    ...(dbStatus !== 'connected' && {
      hint: 'MongoDB Atlas → Network Access → Add Current IP Address (or 0.0.0.0/0 for development)',
    }),
  });
});

app.use('/api/auth', wrapRouter(authRoutes));
app.use('/api/products', wrapRouter(productRoutes));
app.use('/api/categories', wrapRouter(categoryRoutes));
app.use('/api/orders', wrapRouter(orderRoutes));
app.use('/api/cart', wrapRouter(cartRoutes));
app.use('/api/wishlist', wrapRouter(wishlistRoutes));
app.use('/api/reviews', wrapRouter(reviewRoutes));
app.use('/api/admin', wrapRouter(adminRoutes));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5002;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('   On macOS, port 5000 is often used by AirPlay Receiver.');
    console.error('   Fix: set PORT=5002 in server/.env and restart.\n');
    process.exit(1);
  }
  throw err;
});

export default app;
