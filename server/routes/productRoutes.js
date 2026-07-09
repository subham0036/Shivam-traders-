import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { uploadFields } from '../middleware/upload.js';
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  duplicateProduct, adminGetProducts, checkDelivery,
} from '../controllers/productController.js';

const router = Router();

router.get('/', getProducts);
router.get('/delivery/:pincode', checkDelivery);
router.get('/admin/all', protect, authorize('admin', 'staff'), adminGetProducts);
router.get('/:slug', getProduct);
router.post('/', protect, authorize('admin'), uploadFields, createProduct);
router.put('/:id', protect, authorize('admin'), uploadFields, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/duplicate', protect, authorize('admin'), duplicateProduct);

export default router;
