import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireDB } from '../middleware/requireDB.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
  validateRegister, validateLogin, validateForgotPassword, validateResetPassword,
} from '../middleware/validateAuth.js';
import {
  register, login, getMe, updateProfile, changePassword,
  forgotPassword, resetPassword, addAddress, updateAddress, deleteAddress,
} from '../controllers/authController.js';

const router = Router();

router.post('/register', requireDB, authLimiter, validateRegister, register);
router.post('/login', requireDB, authLimiter, validateLogin, login);
router.post('/forgot-password', requireDB, validateForgotPassword, forgotPassword);
router.put('/reset-password/:token', validateResetPassword, resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

export default router;
