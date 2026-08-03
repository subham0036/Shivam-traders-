import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { requireDB } from '../middleware/requireDB.js';
import { handleUpload } from '../middleware/upload.js';
import {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct,
  duplicateProduct, adminGetProducts, checkDelivery,
} from '../controllers/productController.js';

const router = Router();

router.use(requireDB);

router.get('/', getProducts);
router.get('/delivery/:pincode', checkDelivery);
router.get('/admin/all', protect, authorize('admin', 'staff'), adminGetProducts);
router.get('/:slug', getProduct);
router.post('/', protect, authorize('admin'), handleUpload, createProduct);
router.put('/:id', protect, authorize('admin'), handleUpload, updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/duplicate', protect, authorize('admin'), duplicateProduct);

export default router;
