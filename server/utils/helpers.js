import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

export const generateOrderNumber = () => {
  const date = new Date();
  const prefix = `ST${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}${random}`;
};

export const generateInvoiceNumber = () => {
  const date = new Date();
  return `INV${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${Date.now().toString().slice(-6)}`;
};

export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  return { resetToken, hashedToken };
};

export const calcPrices = (items, shipping = {}, coupon = null, giftWrapping = false) => {
  const itemsPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  let discount = 0;
  let couponDiscount = 0;

  if (coupon) {
    if (coupon.type === 'flat') {
      couponDiscount = coupon.value;
    } else {
      couponDiscount = (itemsPrice * coupon.value) / 100;
      if (coupon.maxDiscount) couponDiscount = Math.min(couponDiscount, coupon.maxDiscount);
    }
    couponDiscount = Math.min(couponDiscount, itemsPrice);
  }

  const giftWrappingCharge = giftWrapping ? (shipping.giftWrappingCharge || 50) : 0;
  const subtotal = itemsPrice - couponDiscount;
  const shippingPrice = subtotal >= (shipping.freeShippingThreshold || 2000)
    ? 0
    : (shipping.standardShippingCharge || 99);
  const taxPrice = Math.round((subtotal * (shipping.gstRate || 18)) / 100);
  const totalPrice = subtotal + shippingPrice + taxPrice + giftWrappingCharge;

  return { itemsPrice, discount, couponDiscount, giftWrappingCharge, shippingPrice, taxPrice, totalPrice };
};

export const paginate = (query, page = 1, limit = 12) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  return { query: query.skip(skip).limit(limitNum), page: pageNum, limit: limitNum, skip };
};
