import { Router } from 'express';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import {
  createOrder, verifyPayment, getMyOrders, trackOrder, getOrder,
  getOrders, updateOrderStatus, getInvoice,
} from '../controllers/orderController.js';

const router = Router();

router.post('/', optionalAuth, createOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/track/:orderNumber', trackOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id/invoice', protect, getInvoice);
router.get('/:id', protect, getOrder);
router.get('/', protect, authorize('admin', 'staff'), getOrders);
router.put('/:id/status', protect, authorize('admin', 'staff'), updateOrderStatus);

export default router;
