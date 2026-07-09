import { Router } from 'express';
import { optionalAuth } from '../middleware/auth.js';
import {
  getCart, addToCart, updateCartItem, removeFromCart,
  applyCoupon, updateGiftWrapping, clearCart,
} from '../controllers/cartController.js';

const router = Router();

router.get('/', optionalAuth, getCart);
router.post('/', optionalAuth, addToCart);
router.put('/gift', optionalAuth, updateGiftWrapping);
router.post('/coupon', optionalAuth, applyCoupon);
router.put('/:productId', optionalAuth, updateCartItem);
router.delete('/:productId', optionalAuth, removeFromCart);
router.delete('/', optionalAuth, clearCart);

export default router;
