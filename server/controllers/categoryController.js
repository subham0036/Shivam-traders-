import slugify from 'slugify';
import Category from '../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService.js';

// @desc    Get all categories
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true })
    .populate('parent', 'name slug')
    .sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, data: categories });
};

// @desc    Get category by slug
// @route   GET /api/categories/:slug
export const getCategory = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).populate('parent', 'name slug');
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
};

// @desc    Create category (admin)
// @route   POST /api/categories
export const createCategory = async (req, res) => {
  const data = { ...req.body, slug: slugify(req.body.name, { lower: true, strict: true }) };
  if (req.file) {
    data.image = await uploadToCloudinary(req.file.buffer, 'categories');
  }
  const category = await Category.create(data);
  res.status(201).json({ success: true, data: category });
};

// @desc    Update category (admin)
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  const data = { ...req.body };
  if (data.name) data.slug = slugify(data.name, { lower: true, strict: true });
  if (req.file) {
    if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
    data.image = await uploadToCloudinary(req.file.buffer, 'categories');
  }

  const updated = await Category.findByIdAndUpdate(req.params.id, data, { new: true });
  res.json({ success: true, data: updated });
};

// @desc    Delete category (admin)
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
};
