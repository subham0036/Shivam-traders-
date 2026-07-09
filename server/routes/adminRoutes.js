import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { upload, uploadFields } from '../middleware/upload.js';
import {
  getDashboard, getCustomers, toggleBlockCustomer, createStaff,
  getInventory, stockIn, stockOut, getCoupons, createCoupon,
  updateCoupon, deleteCoupon, getNewsletterSubscribers, subscribeNewsletter,
  getSettings, updateSettings, addBanner, submitContact,
} from '../controllers/adminController.js';

const router = Router();

// Public
router.get('/settings', getSettings);
router.post('/newsletter', subscribeNewsletter);
router.post('/contact', submitContact);

// Admin only
router.get('/dashboard', protect, authorize('admin'), getDashboard);
router.get('/customers', protect, authorize('admin', 'staff'), getCustomers);
router.put('/customers/:id/block', protect, authorize('admin'), toggleBlockCustomer);
router.post('/staff', protect, authorize('admin'), createStaff);

router.get('/inventory', protect, authorize('admin', 'staff'), getInventory);
router.post('/inventory/stock-in', protect, authorize('admin', 'staff'), stockIn);
router.post('/inventory/stock-out', protect, authorize('admin', 'staff'), stockOut);

router.get('/coupons', protect, authorize('admin'), getCoupons);
router.post('/coupons', protect, authorize('admin'), createCoupon);
router.put('/coupons/:id', protect, authorize('admin'), updateCoupon);
router.delete('/coupons/:id', protect, authorize('admin'), deleteCoupon);

router.get('/newsletter', protect, authorize('admin'), getNewsletterSubscribers);
router.put('/settings', protect, authorize('admin'), upload.single('image'), updateSettings);
router.post('/banners', protect, authorize('admin'), upload.single('image'), addBanner);

export default router;
