import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { requireDB } from '../middleware/requireDB.js';
import { upload } from '../middleware/upload.js';
import {
  getCategories, getCategory, createCategory, updateCategory, deleteCategory,
} from '../controllers/categoryController.js';

const router = Router();

router.use(requireDB);

router.get('/', getCategories);
router.get('/:slug', getCategory);
router.post('/', protect, authorize('admin'), upload.single('image'), createCategory);
router.put('/:id', protect, authorize('admin'), upload.single('image'), updateCategory);
router.delete('/:id', protect, authorize('admin'), deleteCategory);

export default router;
