import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { upload, uploadFields } from '../middleware/upload.js';
import {
  getDashboard, getCustomers, toggleBlockCustomer, createStaff, getStaffUsers, getAnalytics,
  getInventory, stockIn, stockOut, getCoupons, createCoupon,
  updateCoupon, deleteCoupon, getNewsletterSubscribers, subscribeNewsletter,
  getSettings, updateSettings, addBanner, submitContact,
} from '../controllers/adminController.js';

const router = Router();

router.get('/settings', getSettings);
router.post('/newsletter', subscribeNewsletter);
router.post('/contact', submitContact);

router.get('/dashboard', protect, authorize('admin'), getDashboard);
router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/customers', protect, authorize('admin', 'staff'), getCustomers);
router.put('/customers/:id/block', protect, authorize('admin'), toggleBlockCustomer);
router.post('/staff', protect, authorize('admin'), createStaff);
router.get('/staff', protect, authorize('admin'), getStaffUsers);

router.get('/inventory', protect, authorize('admin', 'staff'), getInventory);
router.post('/inventory/stock-in', protect, authorize('admin', 'staff'), stockIn);
router.post('/inventory/stock-out', protect, authorize('admin', 'staff'), stockOut);

router.get('/coupons', protect, authorize('admin'), getCoupons);
router.post('/coupons', protect, authorize('admin'), createCoupon);
router.put('/coupons/:id', protect, authorize('admin'), updateCoupon);
router.delete('/coupons/:id', protect, authorize('admin'), deleteCoupon);

router.get('/newsletter', protect, authorize('admin'), getNewsletterSubscribers);
router.put('/settings', protect, authorize('admin'), uploadFields, updateSettings);
router.post('/banners', protect, authorize('admin'), upload.single('image'), addBanner);

export default router;
