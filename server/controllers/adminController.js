import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import Category from '../models/Category.js';
import Inventory from '../models/Inventory.js';
import Coupon from '../models/Coupon.js';
import Newsletter from '../models/Newsletter.js';
import Settings from '../models/Settings.js';
import { uploadToCloudinary } from '../services/cloudinaryService.js';
import { saveLocalFile } from '../services/localUploadService.js';

// @desc    Dashboard stats
// @route   GET /api/admin/dashboard
export const getDashboard = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const [todayOrders, monthOrders, totalCustomers, totalProducts, pendingOrders, pendingPayments, packingOrders, shippedOrders, deliveredOrders, cancelledOrders, recentOrders, latestCustomers] = await Promise.all([
    Order.find({ createdAt: { $gte: today } }),
    Order.find({ createdAt: { $gte: monthStart }, paymentStatus: 'paid' }),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({ paymentStatus: 'pending', paymentMethod: 'upi' }),
    Order.countDocuments({ status: { $in: ['packing', 'packed'] } }),
    Order.countDocuments({ status: { $in: ['shipped', 'out_for_delivery'] } }),
    Order.countDocuments({ status: 'delivered' }),
    Order.countDocuments({ status: 'cancelled' }),
    Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(8),
    User.find({ role: 'customer' }).select('name email createdAt').sort({ createdAt: -1 }).limit(5),
  ]);

  const todaySales = todayOrders.filter((o) => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalPrice, 0);
  const todayOrderCount = todayOrders.length;
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
      todaySales, todayOrderCount, monthRevenue,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalCustomers, totalProducts,
      pendingOrders, pendingPayments, packingOrders, shippedOrders,
      deliveredOrders, cancelledOrders,
      topProducts, lowStock, salesByMonth, categorySales,
      recentOrders, latestCustomers,
    },
  });
};

export const getStaffUsers = async (req, res) => {
  const staff = await User.find({ role: { $in: ['admin', 'staff'] } }).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: staff });
};

export const getAnalytics = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [dailySales, paidOrders, totalOrders, topCustomers] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.countDocuments({ paymentStatus: 'paid' }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { paymentStatus: 'paid', user: { $ne: null } } },
      { $group: { _id: '$user', total: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
    ]),
  ]);

  const avgOrderValue = paidOrders ? (await Order.aggregate([
    { $match: { paymentStatus: 'paid' } },
    { $group: { _id: null, avg: { $avg: '$totalPrice' } } },
  ]))[0]?.avg || 0 : 0;

  res.json({
    success: true,
    data: {
      dailySales,
      paidOrders,
      totalOrders,
      conversionRate: totalOrders ? ((paidOrders / totalOrders) * 100).toFixed(1) : 0,
      avgOrderValue,
      topCustomers,
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

  const body = { ...req.body };
  if (typeof body.payment === 'string') {
    try { body.payment = JSON.parse(body.payment); } catch { /* keep string */ }
  }
  if (typeof body.contact === 'string') {
    try { body.contact = JSON.parse(body.contact); } catch { /* keep string */ }
  }
  if (typeof body.shipping === 'string') {
    try { body.shipping = JSON.parse(body.shipping); } catch { /* keep string */ }
  }
  if (typeof body.invoice === 'string') {
    try { body.invoice = JSON.parse(body.invoice); } catch { /* keep string */ }
  }

  const nestedKeys = ['contact', 'social', 'shipping', 'seo', 'payment', 'invoice', 'policies', 'analytics', 'flashSale', 'exitIntentCoupon'];
  for (const [key, val] of Object.entries(body)) {
    if (nestedKeys.includes(key) && val && typeof val === 'object') {
      settings[key] = { ...(settings[key]?.toObject?.() || settings[key] || {}), ...val };
      settings.markModified(key);
    } else if (key !== 'banners') {
      settings[key] = val;
    }
  }
  if (req.files?.image?.[0]) {
    try {
      settings.logo = await uploadToCloudinary(req.files.image[0].buffer, 'settings');
    } catch {
      settings.logo = await saveLocalFile(req.files.image[0], 'settings');
    }
  }
  if (req.files?.qrCode?.[0]) {
    settings.payment = { ...(settings.payment?.toObject?.() || settings.payment || {}) };
    settings.payment.upiQrCode = await saveLocalFile(req.files.qrCode[0], 'settings');
    settings.markModified('payment');
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
