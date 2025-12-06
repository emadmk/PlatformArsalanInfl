import { Router } from 'express';
import { AuthController } from '@/controllers/auth.controller';
import { authLimiter } from '@/middleware/rateLimit.middleware';
import { authenticateToken } from '@/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/register', authLimiter, authController.register);
router.post('/register/influencer', authLimiter, authController.registerInfluencer);
router.post('/register/business', authLimiter, authController.registerBusiness);
router.post('/login', authLimiter, authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/verify-2fa', authLimiter, authController.verifyTwoFactor);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Protected routes
router.post('/setup-2fa', authenticateToken, authController.setupTwoFactor);
router.post('/enable-2fa', authenticateToken, authController.enableTwoFactor);
router.post('/disable-2fa', authenticateToken, authController.disableTwoFactor);
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout', authenticateToken, authController.logout);

export default router;
