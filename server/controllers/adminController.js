import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Inventory from '../models/Inventory.js';
import Coupon from '../models/Coupon.js';
import Newsletter from '../models/Newsletter.js';
import Settings from '../models/Settings.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';

// @desc    Dashboard stats
// @route   GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayOrders, monthOrders, totalCustomers, totalProducts, pendingOrders, deliveredOrders, cancelledOrders] = await Promise.all([
    Order.find({ createdAt: { $gte: today }, paymentStatus: { $in: ['paid', 'pending'] } }),
    Order.find({ createdAt: { $gte: monthStart }, paymentStatus: 'paid' }),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ status: 'delivered' }),
    Order.countDocuments({ status: 'cancelled' }),
  ]);

  const todaySales = todayOrders.reduce((s, o) => s + o.totalPrice, 0);
  const monthRevenue = monthOrders.reduce((s, o) => s + o.totalPrice, 0);
  const totalRevenue = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, total: { $sum: '$totalPrice' } } },
  ]);

  const topProducts = await Product.find().sort({ soldCount: -1 }).limit(5).select('name soldCount sellingPrice images');
  const lowStock = await Inventory.find({ currentStock: { $lte: 5 } }).populate('product', 'name sku images');

  const salesByMonth = await Order.aggregate([
    { $match: { paymentStatus: 'paid', createdAt: { $gte: new Date(today.getFullYear(), 0, 1) } } },
    { $group: { _id: { $month: '$createdAt' }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  const categorySales = await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $unwind: '$items' },
    { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
    { $unwind: '$product' },
    { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
    { $unwind: '$category' },
    { $group: { _id: '$category.name', count: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
    { $sort: { revenue: -1 } },
    { $limit: 8 },
  ]);

  res.json({
    success: true,
    data: {
      todaySales, monthRevenue,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers, totalProducts,
      pendingOrders, deliveredOrders, cancelledOrders,
      topProducts, lowStock, salesByMonth, categorySales,
    },
  });
};

// @desc    Get all customers
// @route   GET /api/admin/customers
export const getCustomers = async (req, res) => {
  const customers = await User.find({ role: 'customer' }).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: customers });
};

// @desc    Block/unblock customer
// @route   PUT /api/admin/customers/:id/block
export const toggleBlockCustomer = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'Customer not found' });
  user.isBlocked = !user.isBlocked;
  await user.save();
  res.json({ success: true, data: user });
};

// @desc    Create staff user
// @route   POST /api/admin/staff
export const createStaff = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ success: false, message: 'Email exists' });
  const staff = await User.create({ name, email, password, phone, role: 'staff' });
  res.status(201).json({ success: true, data: { _id: staff._id, name: staff.name, email: staff.email, role: staff.role } });
};

// Inventory
export const getInventory = async (req, res) => {
  const filter = {};
  if (req.query.lowStock === 'true') filter.currentStock = { $lte: 5 };
  if (req.query.outOfStock === 'true') filter.currentStock = 0;
  const inventory = await Inventory.find(filter).populate('product', 'name sku images sellingPrice').sort({ updatedAt: -1 });
  res.json({ success: true, data: inventory });
};

export const stockIn = async (req, res) => {
  const { productId, quantity, reason, supplier, purchasePrice } = req.body;
  let inventory = await Inventory.findOne({ product: productId });
  if (!inventory) inventory = await Inventory.create({ product: productId, currentStock: 0 });

  const prev = inventory.currentStock;
  inventory.currentStock += quantity;
  inventory.logs.push({ type: 'stock_in', quantity, previousStock: prev, newStock: inventory.currentStock, reason, supplier, purchasePrice, performedBy: req.user._id });
  inventory.lastRestocked = new Date();
  if (supplier) inventory.supplier = { ...inventory.supplier, name: supplier };
  await inventory.save();
  await Product.findByIdAndUpdate(productId, { stock: inventory.currentStock });
  res.json({ success: true, data: inventory });
};

export const stockOut = async (req, res) => {
  const { productId, quantity, reason } = req.body;
  const inventory = await Inventory.findOne({ product: productId });
  if (!inventory) return res.status(404).json({ success: false, message: 'Inventory not found' });

  const prev = inventory.currentStock;
  inventory.currentStock = Math.max(0, inventory.currentStock - quantity);
  inventory.logs.push({ type: 'stock_out', quantity, previousStock: prev, newStock: inventory.currentStock, reason, performedBy: req.user._id });
  await inventory.save();
  await Product.findByIdAndUpdate(productId, { stock: inventory.currentStock });
  res.json({ success: true, data: inventory });
};

// Coupons
export const getCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
};

export const createCoupon = async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
};

export const updateCoupon = async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: coupon });
};

export const deleteCoupon = async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
};

// Newsletter
export const getNewsletterSubscribers = async (req, res) => {
  const subscribers = await Newsletter.find().sort({ createdAt: -1 });
  res.json({ success: true, data: subscribers });
};

export const subscribeNewsletter = async (req, res) => {
  const { email, name } = req.body;
  const exists = await Newsletter.findOne({ email });
  if (exists) return res.json({ success: true, message: 'Already subscribed' });
  await Newsletter.create({ email, name });
  res.status(201).json({ success: true, message: 'Subscribed successfully' });
};

// Settings
export const getSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, data: settings });
};

export const updateSettings = async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  Object.assign(settings, req.body);
  if (req.file) {
    settings.logo = await uploadToCloudinary(req.file.buffer, 'settings');
  }
  await settings.save();
  res.json({ success: true, data: settings });
};

export const addBanner = async (req, res) => {
  const settings = await Settings.findOne() || await Settings.create({});
  const banner = { ...req.body };
  if (req.file) banner.image = await uploadToCloudinary(req.file.buffer, 'banners');
  settings.banners.push(banner);
  await settings.save();
  res.status(201).json({ success: true, data: settings.banners });
};

// Contact form
export const submitContact = async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const { sendEmail } = await import('../services/emailService.js');
  await sendEmail({
    to: process.env.SMTP_USER || 'info@shivamtraders.com',
    subject: `Contact: ${subject}`,
    html: `<p><strong>${name}</strong> (${email}, ${phone})</p><p>${message}</p>`,
  });
  res.json({ success: true, message: 'Message sent successfully' });
};
