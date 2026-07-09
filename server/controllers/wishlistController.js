import Wishlist from '../models/Wishlist.js';

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) wishlist = await Wishlist.create({ user: userId, products: [] });
  return wishlist;
};

// @desc    Get wishlist
// @route   GET /api/wishlist
export const getWishlist = async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  await wishlist.populate('products', 'name slug sellingPrice mrp images stock discount rating');
  res.json({ success: true, data: wishlist });
};

// @desc    Add to wishlist
// @route   POST /api/wishlist
export const addToWishlist = async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  if (!wishlist.products.includes(req.body.productId)) {
    wishlist.products.push(req.body.productId);
    await wishlist.save();
  }
  await wishlist.populate('products', 'name slug sellingPrice mrp images stock');
  res.json({ success: true, data: wishlist });
};

// @desc    Remove from wishlist
// @route   DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.products = wishlist.products.filter((p) => p.toString() !== req.params.productId);
  await wishlist.save();
  res.json({ success: true, data: wishlist });
};
