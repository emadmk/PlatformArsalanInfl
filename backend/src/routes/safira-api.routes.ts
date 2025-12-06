import { Router, Response } from 'express';
import {
  verifySafiraApiKey,
  SafiraRequest,
  safiraApiLimiter,
} from '@/middleware/safira.middleware';
import safiraService from '@/services/safira/safira.service';
import logger from '@/config/logger';

const router = Router();

// Apply rate limiting and API key verification to all routes
router.use(safiraApiLimiter);
router.use(verifySafiraApiKey);

/**
 * GET /influencers/:referralCode
 * Get influencer details by referral code
 * Called by Safira for verification
 */
router.get('/influencers/:referralCode', async (req: SafiraRequest, res: Response) => {
  try {
    const { referralCode } = req.params;

    logger.info(`Safira API: Get influencer by referral code: ${referralCode}`);

    const influencer = await safiraService.getInfluencerByReferralCode(referralCode);

    res.json({
      success: true,
      data: influencer,
    });
  } catch (error: any) {
    logger.error('Error getting influencer for Safira:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * GET /influencers/active
 * Get all active influencers
 * Called by Safira for syncing sellers list
 */
router.get('/influencers/active', async (req: SafiraRequest, res: Response) => {
  try {
    logger.info('Safira API: Get all active influencers');

    const result = await safiraService.getActiveInfluencers();

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('Error getting active influencers for Safira:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
