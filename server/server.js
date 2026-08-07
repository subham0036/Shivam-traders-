import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import mongoose from 'mongoose';
import { migrateMediaUrls } from './utils/migrateMediaUrls.js';
import { getUploadsRoot } from './services/localUploadService.js';
import { streamGridFSFile } from './services/gridfsUploadService.js';
import { getUploadStorageMode } from './utils/uploadHelper.js';
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

mongoose.connection.once('open', () => {
  console.log(`Upload storage mode: ${getUploadStorageMode()}`);
  migrateMediaUrls().catch((err) => {
    console.error('Media URL migration skipped:', err.message);
  });
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

await fs.mkdir(getUploadsRoot(), { recursive: true });

const app = express();

// Render/Vercel sit behind a reverse proxy — required for express-rate-limit client IPs
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const normalizeOrigin = (origin) => (origin || '').replace(/\/$/, '');

const clientUrls = (process.env.CLIENT_URL || '')
  .split(',')
  .map((url) => normalizeOrigin(url.trim()))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...clientUrls,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]);

const isLocalDevOrigin = (origin) =>
  /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

const isVercelOrigin = (origin) =>
  /^https:\/\/[\w.-]+\.vercel\.app$/i.test(origin);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.has(normalized)) return true;
  if (isVercelOrigin(normalized)) return true;
  if (process.env.NODE_ENV !== 'production' && isLocalDevOrigin(normalized)) return true;
  return false;
};

const corsOptions = {
  origin: (origin, callback) => callback(null, isAllowedOrigin(origin)),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(xss());
if (process.env.NODE_ENV !== 'development') {
  app.use((req, res, next) => {
    if (req.method === 'OPTIONS') return next();
    return apiLimiter(req, res, next);
  });
}

app.use('/uploads', async (req, res, next) => {
  if (req.method !== 'GET') return next();
  const relativePath = req.path.replace(/^\//, '');
  if (!relativePath || mongoose.connection.readyState !== 1) return next();
  try {
    const served = await streamGridFSFile(relativePath, res);
    if (served) return;
  } catch (err) {
    console.error('GridFS serve error:', err.message);
  }
  next();
});
app.use('/uploads', express.static(getUploadsRoot()));

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[dbState] || 'unknown';
  res.json({
    success: true,
    message: 'Shivam Traders API is running',
    database: dbStatus,
    uploadStorage: getUploadStorageMode(),
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
