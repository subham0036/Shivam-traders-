import slugify from 'slugify';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import { paginate } from '../utils/helpers.js';
import { uploadMultiple, deleteFromCloudinary, uploadToCloudinary } from '../services/cloudinaryService.js';

const buildProductFilter = (query) => {
  const filter = { isActive: true };
  if (query.category) filter.category = query.category;
  if (query.subcategory) filter.subcategory = query.subcategory;
  if (query.god) filter.godName = { $regex: query.god, $options: 'i' };
  if (query.material) filter.material = query.material;
  if (query.search) filter.$text = { $search: query.search };
  if (query.minPrice || query.maxPrice) {
    filter.sellingPrice = {};
    if (query.minPrice) filter.sellingPrice.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.sellingPrice.$lte = Number(query.maxPrice);
  }
  if (query.minHeight || query.maxHeight) {
    filter.height = {};
    if (query.minHeight) filter.height.$gte = Number(query.minHeight);
    if (query.maxHeight) filter.height.$lte = Number(query.maxHeight);
  }
  if (query.inStock === 'true') filter.stock = { $gt: 0 };
  if (query.featured === 'true') filter.isFeatured = true;
  if (query.trending === 'true') filter.isTrending = true;
  if (query.bestSeller === 'true') filter.isBestSeller = true;
  if (query.newArrival === 'true') filter.isNewArrival = true;
  if (query.premium === 'true') filter.isPremium = true;
  return filter;
};

const getSortOption = (sort) => {
  const sorts = {
    newest: { createdAt: -1 },
    'price-low': { sellingPrice: 1 },
    'price-high': { sellingPrice: -1 },
    'best-selling': { soldCount: -1 },
    rating: { rating: -1 },
  };
  return sorts[sort] || { createdAt: -1 };
};

// @desc    Get all products (public)
// @route   GET /api/products
export const getProducts = async (req, res) => {
  const filter = buildProductFilter(req.query);
  const sort = getSortOption(req.query.sort);
  const total = await Product.countDocuments(filter);
  const { query, page, limit } = paginate(Product.find(filter).populate('category', 'name slug'), req.query.page, req.query.limit);
  const products = await query.sort(sort).select('-reviews -questions');

  res.json({
    success: true,
    data: products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

// @desc    Get single product
// @route   GET /api/products/:slug
export const getProduct = async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('category', 'name slug')
    .populate('subcategory', 'name slug')
    .populate('relatedProducts', 'name slug sellingPrice mrp images rating')
    .populate('frequentlyBoughtTogether', 'name slug sellingPrice mrp images');

  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const related = await Product.find({
    _id: { $ne: product._id },
    isActive: true,
    $or: [{ category: product.category }, { godName: product.godName }],
  }).limit(8).select('name slug sellingPrice mrp images rating discount stock');

  res.json({ success: true, data: { ...product.toObject(), suggestedRelated: related } });
};

// @desc    Create product (admin)
// @route   POST /api/products
export const createProduct = async (req, res) => {
  const data = JSON.parse(req.body.data || '{}');
  data.slug = slugify(data.name, { lower: true, strict: true });
  data.sku = data.sku || `SKU-${Date.now()}`;

  if (req.files?.images) {
    data.images = await uploadMultiple(req.files.images, 'products');
  }
  if (req.files?.video?.[0]) {
    data.video = await uploadToCloudinary(req.files.video[0].buffer, 'products/videos');
  }

  const product = await Product.create(data);
  await Inventory.create({ product: product._id, currentStock: product.stock });

  res.status(201).json({ success: true, data: product });
};

// @desc    Update product (admin)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  const data = JSON.parse(req.body.data || '{}');
  if (data.name) data.slug = slugify(data.name, { lower: true, strict: true });

  if (req.files?.images) {
    const newImages = await uploadMultiple(req.files.images, 'products');
    data.images = [...(product.images || []), ...newImages];
  }
  if (req.files?.video?.[0]) {
    if (product.video?.publicId) await deleteFromCloudinary(product.video.publicId);
    data.video = await uploadToCloudinary(req.files.video[0].buffer, 'products/videos');
  }

  product = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });

  const inventory = await Inventory.findOne({ product: product._id });
  if (inventory && data.stock !== undefined) {
    inventory.currentStock = data.stock;
    await inventory.save();
  }

  res.json({ success: true, data: product });
};

// @desc    Delete product (admin)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  for (const img of product.images || []) {
    await deleteFromCloudinary(img.publicId);
  }
  if (product.video?.publicId) await deleteFromCloudinary(product.video.publicId);

  await Product.findByIdAndDelete(req.params.id);
  await Inventory.findOneAndDelete({ product: req.params.id });
  res.json({ success: true, message: 'Product deleted' });
};

// @desc    Duplicate product (admin)
// @route   POST /api/products/:id/duplicate
export const duplicateProduct = async (req, res) => {
  const original = await Product.findById(req.params.id).lean();
  if (!original) return res.status(404).json({ success: false, message: 'Product not found' });

  delete original._id;
  original.name = `${original.name} (Copy)`;
  original.slug = `${original.slug}-copy-${Date.now()}`;
  original.sku = `SKU-${Date.now()}`;
  original.soldCount = 0;
  original.reviews = [];
  original.questions = [];

  const product = await Product.create(original);
  await Inventory.create({ product: product._id, currentStock: product.stock });
  res.status(201).json({ success: true, data: product });
};

// @desc    Admin get all products
// @route   GET /api/products/admin/all
export const adminGetProducts = async (req, res) => {
  const filter = {};
  if (req.query.search) filter.name = { $regex: req.query.search, $options: 'i' };
  const total = await Product.countDocuments(filter);
  const { query, page, limit } = paginate(Product.find(filter).populate('category', 'name'), req.query.page, req.query.limit || 20);
  const products = await query.sort({ createdAt: -1 });
  res.json({ success: true, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

// @desc    Check pincode delivery
// @route   GET /api/products/delivery/:pincode
export const checkDelivery = async (req, res) => {
  const pincode = req.params.pincode;
  const isValid = /^[1-9][0-9]{5}$/.test(pincode);
  if (!isValid) return res.status(400).json({ success: false, message: 'Invalid pincode' });

  const days = parseInt(pincode[0]) <= 4 ? 5 : 7;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + days);

  res.json({
    success: true,
    data: { available: true, estimatedDays: days, estimatedDelivery: deliveryDate, codAvailable: true },
  });
};
