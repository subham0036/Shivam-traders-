import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import { generateOrderNumber, generateInvoiceNumber, calcPrices } from '../utils/helpers.js';
import { verifyRazorpayPayment } from '../services/razorpayService.js';
import { saveLocalFile } from '../services/localUploadService.js';
import {
  notifyOrderPlaced, notifyOrderStatus, notifyPaymentApproved, notifyPaymentRejected,
} from '../services/notificationService.js';

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

const deductStock = async (order) => {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
    const inventory = await Inventory.findOne({ product: item.product });
    if (inventory) {
      inventory.logs.push({
        type: 'sale', quantity: item.quantity,
        previousStock: inventory.currentStock,
        newStock: inventory.currentStock - item.quantity,
        reference: order.orderNumber,
      });
      inventory.currentStock -= item.quantity;
      await inventory.save();
    }
  }
};

const restoreStock = async (order) => {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
    const inventory = await Inventory.findOne({ product: item.product });
    if (inventory) {
      inventory.logs.push({
        type: 'return', quantity: item.quantity,
        previousStock: inventory.currentStock,
        newStock: inventory.currentStock + item.quantity,
        reference: order.orderNumber,
      });
      inventory.currentStock += item.quantity;
      await inventory.save();
    }
  }
};

const finalizePaidOrder = async (order) => {
  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentStatus = 'paid';
  if (order.status === 'pending') order.status = 'confirmed';
  if (!order.invoiceNumber) order.invoiceNumber = generateInvoiceNumber();
  await order.save();
  await deductStock(order);
  if (order.user) {
    await Cart.findOneAndUpdate({ user: order.user }, { items: [], coupon: null });
    const user = await User.findById(order.user);
    if (user) {
      user.totalPurchases += order.totalPrice;
      await user.save();
    }
  }
  if (order.couponCode) {
    await Coupon.findOneAndUpdate({ code: order.couponCode }, { $inc: { usedCount: 1 } });
  }
};

// @desc    Create order
export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, giftWrapping, giftMessage, deliveryInstructions } = req.body;
  if (!items?.length) return res.status(400).json({ success: false, message: 'No order items' });
  if (!['upi'].includes(paymentMethod)) {
    return res.status(400).json({ success: false, message: 'Only UPI payment is available right now' });
  }

  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const orderItems = [];
  let hasStockIssue = false;

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.product);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    if (product.stock < item.quantity) hasStockIssue = true;
    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url,
      sku: product.sku,
      price: product.sellingPrice,
      quantity: item.quantity,
      gst: product.gst,
    });
  }
  if (hasStockIssue) return res.status(400).json({ success: false, message: 'Insufficient stock for some items' });

  const settings = await getSettings();
  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!coupon || (coupon.validUntil && coupon.validUntil < new Date())) {
      return res.status(400).json({ success: false, message: 'Invalid or expired coupon' });
    }
  }

  const prices = calcPrices(orderItems, settings.shipping, coupon, giftWrapping);
  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    user: req.user?._id,
    guestEmail: req.body.guestEmail,
    guestPhone: req.body.guestPhone,
    items: orderItems,
    shippingAddress,
    deliveryInstructions,
    paymentMethod,
    couponCode: coupon?.code,
    couponDiscount: prices.couponDiscount,
    giftWrapping,
    giftMessage,
    giftWrappingCharge: prices.giftWrappingCharge,
    itemsPrice: prices.itemsPrice,
    shippingPrice: prices.shippingPrice,
    taxPrice: prices.taxPrice,
    totalPrice: prices.totalPrice,
    estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
    paymentVerificationHistory: paymentMethod === 'upi' ? [] : undefined,
  });

  if (paymentMethod === 'upi') {
    if (req.user) await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });
    await notifyOrderPlaced(order);
  }

  res.status(201).json({ success: true, data: order });
};

export const verifyPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const isValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) return res.status(400).json({ success: false, message: 'Payment verification failed' });

  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  order.statusHistory.push({ status: 'confirmed', note: 'Razorpay payment received' });
  await finalizePaidOrder(order);
  await notifyPaymentApproved(order);

  res.json({ success: true, data: order });
};

export const uploadUpiPayment = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.paymentMethod !== 'upi') {
    return res.status(400).json({ success: false, message: 'Not a UPI order' });
  }

  const { upiTransactionId } = req.body;
  if (!upiTransactionId) {
    return res.status(400).json({ success: false, message: 'UPI transaction ID is required' });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Payment screenshot is required' });
  }

  order.upiTransactionId = upiTransactionId;
  order.paymentScreenshot = await saveLocalFile(req.file, 'payments');
  order.paymentVerificationHistory.push({ action: 'submitted', note: 'Customer uploaded payment proof' });
  await order.save();
  res.json({ success: true, data: order, message: 'Payment proof submitted. Awaiting admin verification.' });
};

export const approvePayment = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (order.paymentStatus === 'paid') {
    return res.status(400).json({ success: false, message: 'Payment already approved' });
  }

  order.paymentVerificationHistory.push({
    action: 'approved',
    note: req.body.note || 'Payment verified by admin',
    admin: req.user._id,
  });
  order.statusHistory.push({ status: 'confirmed', note: req.body.note || 'Payment approved', updatedBy: req.user._id });
  await finalizePaidOrder(order);
  res.json({ success: true, data: order });
  notifyPaymentApproved(order, req.body.note).catch((err) => console.error('Email error:', err.message));
};

export const rejectPayment = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.paymentStatus = 'failed';
  order.paymentVerificationHistory.push({
    action: 'rejected',
    note: req.body.note || 'Payment rejected',
    admin: req.user._id,
  });
  await order.save();
  res.json({ success: true, data: order });
  notifyPaymentRejected(order, req.body.note).catch((err) => console.error('Email error:', err.message));
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
};

export const trackOrder = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
};

export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .select('-razorpaySignature')
    .lean();
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (req.user.role === 'customer' && order.user?._id?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, data: order });
};

export const getOrders = async (req, res) => {
  const filter = {};
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
  const skip = (page - 1) * limit;

  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
  if (req.query.search) {
    const q = req.query.search.trim();
    filter.$or = [
      { orderNumber: new RegExp(q, 'i') },
      { guestEmail: new RegExp(q, 'i') },
      { guestPhone: new RegExp(q, 'i') },
      { upiTransactionId: new RegExp(q, 'i') },
    ];
  }
  if (req.query.from || req.query.to) {
    filter.createdAt = {};
    if (req.query.from) filter.createdAt.$gte = new Date(req.query.from);
    if (req.query.to) filter.createdAt.$lte = new Date(req.query.to);
  }

  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({ success: true, data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const { status, note, trackingNumber, courierName, shippingDate, estimatedDelivery, adminNotes } = req.body;
  if (status) order.status = status;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (courierName !== undefined) order.courierName = courierName;
  if (shippingDate) order.shippingDate = new Date(shippingDate);
  if (estimatedDelivery) order.estimatedDelivery = new Date(estimatedDelivery);
  if (adminNotes !== undefined) order.adminNotes = adminNotes;

  if (status) {
    order.statusHistory.push({ status, note: note || `Status changed to ${status}`, updatedBy: req.user._id });
  }

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  if (status === 'cancelled' || status === 'refunded') {
    if (order.isPaid) {
      order.paymentStatus = status === 'refunded' ? 'refunded' : order.paymentStatus;
      await restoreStock(order);
    }
  }

  await order.save();
  res.json({ success: true, data: order });
  if (status) notifyOrderStatus(order, note).catch((err) => console.error('Email error:', err.message));
};

// @desc    Get invoice data
export const getInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  const isOwner = order.user?._id?.toString() === req.user._id.toString();
  const isStaff = ['admin', 'staff'].includes(req.user.role);
  if (!isOwner && !isStaff) return res.status(403).json({ success: false, message: 'Not authorized' });
  if (!order.invoiceNumber) order.invoiceNumber = generateInvoiceNumber();
  await order.save();
  const settings = await getSettings();
  res.json({ success: true, data: { order, settings } });
};
