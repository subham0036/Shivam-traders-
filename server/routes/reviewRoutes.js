import { Router } from 'express';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getProductReviews, createReview, addQuestion, answerQuestion,
  getAllReviews, moderateReview, deleteReview,
} from '../controllers/reviewController.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.post('/questions', optionalAuth, addQuestion);
router.put('/questions/:productId/:questionId', protect, authorize('admin', 'staff'), answerQuestion);

router.get('/admin/all', protect, authorize('admin', 'staff'), getAllReviews);
router.put('/admin/:id', protect, authorize('admin', 'staff'), moderateReview);
router.delete('/admin/:id', protect, authorize('admin'), deleteReview);

export default router;
