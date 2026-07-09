import { Router } from 'express';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getProductReviews, createReview, addQuestion, answerQuestion,
} from '../controllers/reviewController.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);
router.post('/questions', optionalAuth, addQuestion);
router.put('/questions/:productId/:questionId', protect, authorize('admin', 'staff'), answerQuestion);

export default router;
