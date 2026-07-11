import mongoose from 'mongoose';

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const requireDB = (req, res, next) => {
  if (isDbConnected()) return next();

  return res.status(503).json({
    success: false,
    message: 'Database is not connected. Add your current IP in MongoDB Atlas → Network Access → Add IP Address, then try again.',
    database: { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' }[mongoose.connection.readyState] || 'unknown',
  });
};
