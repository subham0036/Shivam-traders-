import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Inventory from '../models/Inventory.js';
import Cart from '../models/Cart.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import { generateOrderNumber, generateInvoiceNumber, calcPrices } from '../utils/helpers.js';
import { createRazorpayOrder, verifyRazorpayPayment } from '../services/razorpayService.js';
import { sendEmail, orderConfirmationEmail } from '../services/emailService.js';

const getSettings = async () => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  return settings;
};

// @desc    Create order
// @route   POST /api/orders
export const createOrder = async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, giftWrapping, giftMessage, deliveryInstructions } = req.body;
  if (!items?.length) return res.status(400).json({ success: false, message: 'No order items' });

  const productIds = items.map((i) => i.product);
  const products = await Product.find({ _id: { $in: productIds } });
  const orderItems = [];
  let hasStockIssue = false;

  for (const item of items) {
    const product = products.find((p) => p._id.toString() === item.product);
    if (!product) return res.status(404).json({ success: false, message: `Product not found` });
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
  });

  if (paymentMethod === 'razorpay') {
    const razorpayOrder = await createRazorpayOrder(prices.totalPrice, orderNumber);
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();
    return res.status(201).json({
      success: true,
      data: { order, razorpayOrderId: razorpayOrder.id, amount: razorpayOrder.amount, key: process.env.RAZORPAY_KEY_ID },
    });
  }

  if (paymentMethod === 'cod') {
    await deductStock(order);
    if (req.user) {
      await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null });
    }
    const email = req.user?.email || req.body.guestEmail;
    if (email) await sendEmail(orderConfirmationEmail(order, email));
  }

  res.status(201).json({ success: true, data: order });
};

const deductStock = async (order) => {
  for (const item of order.items) {
    const product = await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    }, { new: true });
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

// @desc    Verify Razorpay payment
// @route   POST /api/orders/verify-payment
export const verifyPayment = async (req, res) => {
  const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const isValid = verifyRazorpayPayment(razorpayOrderId, razorpayPaymentId, razorpaySignature);
  if (!isValid) return res.status(400).json({ success: false, message: 'Payment verification failed' });

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpayPaymentId;
  order.razorpaySignature = razorpaySignature;
  order.status = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', note: 'Payment received' });
  order.invoiceNumber = generateInvoiceNumber();
  await order.save();
  await deductStock(order);

  if (order.user) {
    await Cart.findOneAndUpdate({ user: order.user }, { items: [], coupon: null });
    const user = await User.findById(order.user);
    if (user) {
      user.totalPurchases += order.totalPrice;
      await user.save();
      await sendEmail(orderConfirmationEmail(order, user.email));
    }
  }

  res.json({ success: true, data: order });
};

// @desc    Get my orders
// @route   GET /api/orders/my
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
};

// @desc    Track order
// @route   GET /api/orders/track/:orderNumber
export const trackOrder = async (req, res) => {
  const order = await Order.findOne({ orderNumber: req.params.orderNumber });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, data: order });
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
export const getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (req.user.role === 'customer' && order.user?._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }
  res.json({ success: true, data: order });
};

// @desc    Admin get all orders
// @route   GET /api/orders
export const getOrders = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  const orders = await Order.find(filter).populate('user', 'name email').sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: orders });
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.status = req.body.status;
  order.statusHistory.push({ status: req.body.status, note: req.body.note, updatedBy: req.user._id });
  if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
  if (req.body.status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }
  await order.save();
  res.json({ success: true, data: order });
};

// @desc    Get invoice data
// @route   GET /api/orders/:id/invoice
export const getInvoice = async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  if (!order.invoiceNumber) order.invoiceNumber = generateInvoiceNumber();
  await order.save();
  const settings = await getSettings();
  res.json({ success: true, data: { order, settings } });
};
