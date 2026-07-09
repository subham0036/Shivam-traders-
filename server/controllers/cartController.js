import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Settings from '../models/Settings.js';
import { calcPrices } from '../utils/helpers.js';

const getOrCreateCart = async (userId, sessionId) => {
  let cart = userId
    ? await Cart.findOne({ user: userId })
    : await Cart.findOne({ sessionId });
  if (!cart) {
    cart = await Cart.create({ user: userId || undefined, sessionId: sessionId || undefined, items: [] });
  }
  return cart;
};

// @desc    Get cart
// @route   GET /api/cart
export const getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user?._id, req.query.sessionId);
  await cart.populate({ path: 'items.product', select: 'name slug sellingPrice mrp images stock discount' });
  await cart.populate('coupon');

  let settings = await Settings.findOne() || await Settings.create({});
  const items = cart.items.map((i) => ({
    product: i.product,
    quantity: i.quantity,
    price: i.product.sellingPrice,
  }));
  const prices = calcPrices(items, settings.shipping, cart.coupon, cart.giftWrapping);

  res.json({ success: true, data: { cart, prices, settings: settings.shipping } });
};

// @desc    Add to cart
// @route   POST /api/cart
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) return res.status(404).json({ success: false, message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ success: false, message: 'Insufficient stock' });

  const cart = await getOrCreateCart(req.user?._id, req.body.sessionId);
  const existing = cart.items.find((i) => i.product.toString() === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }
  await cart.save();
  await cart.populate('items.product', 'name slug sellingPrice mrp images stock');
  res.json({ success: true, data: cart });
};

// @desc    Update cart item
// @route   PUT /api/cart/:productId
export const updateCartItem = async (req, res) => {
  const cart = await getOrCreateCart(req.user?._id, req.body.sessionId);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' });

  if (req.body.quantity <= 0) {
    cart.items.pull(item._id);
  } else {
    item.quantity = req.body.quantity;
  }
  await cart.save();
  await cart.populate('items.product', 'name slug sellingPrice mrp images stock');
  res.json({ success: true, data: cart });
};

// @desc    Remove from cart
// @route   DELETE /api/cart/:productId
export const removeFromCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user?._id, req.query.sessionId);
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json({ success: true, data: cart });
};

// @desc    Apply coupon
// @route   POST /api/cart/coupon
export const applyCoupon = async (req, res) => {
  const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase(), isActive: true });
  if (!coupon) return res.status(400).json({ success: false, message: 'Invalid coupon code' });
  if (coupon.validUntil && coupon.validUntil < new Date()) {
    return res.status(400).json({ success: false, message: 'Coupon expired' });
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
  }

  const cart = await getOrCreateCart(req.user?._id, req.body.sessionId);
  cart.coupon = coupon._id;
  await cart.save();
  res.json({ success: true, data: coupon, message: 'Coupon applied' });
};

// @desc    Update gift wrapping
// @route   PUT /api/cart/gift
export const updateGiftWrapping = async (req, res) => {
  const cart = await getOrCreateCart(req.user?._id, req.body.sessionId);
  cart.giftWrapping = req.body.giftWrapping;
  cart.giftMessage = req.body.giftMessage || '';
  await cart.save();
  res.json({ success: true, data: cart });
};

// @desc    Clear cart
// @route   DELETE /api/cart
export const clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user?._id, req.query.sessionId);
  cart.items = [];
  cart.coupon = null;
  await cart.save();
  res.json({ success: true, message: 'Cart cleared' });
};
