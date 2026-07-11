import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';

dotenv.config({ path: '.env' });

const updateAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI in server/.env');
    process.exit(1);
  }
  if (!email || !password) {
    console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in server/.env');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error('ADMIN_PASSWORD must be at least 8 characters');
    process.exit(1);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error('ADMIN_EMAIL must be a valid email, e.g. admin@shivamtraders.com');
    process.exit(1);
  }

  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
  });
  console.log('Connected to MongoDB');

  let admin = await User.findOne({ role: 'admin' }).select('+password');

  if (!admin) {
    admin = await User.create({
      name: 'Admin',
      email,
      password,
      role: 'admin',
      phone: process.env.STORE_PHONE || '',
    });
    console.log('Admin account created:', admin.email);
  } else {
    admin.email = email;
    admin.password = password;
    await admin.save();
    console.log('Admin account updated:', admin.email);
  }

  await mongoose.disconnect();
  process.exit(0);
};

updateAdmin().catch((err) => {
  console.error('\n❌ Failed to update admin:', err.message);
  if (err.message.includes('whitelist') || err.message.includes('Could not connect')) {
    console.error('\nFix MongoDB Atlas first:');
    console.error('  1. Open https://cloud.mongodb.com → Network Access');
    console.error('  2. Add IP Address → Add Current IP Address');
    console.error('  3. Wait 1–2 minutes, then run: npm run update-admin\n');
  }
  process.exit(1);
});
