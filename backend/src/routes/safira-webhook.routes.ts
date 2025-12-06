import { Router, Request, Response } from 'express';
import {
  verifySafiraWebhookSignature,
  SafiraRequest,
  safiraApiLimiter,
} from '@/middleware/safira.middleware';
import safiraService from '@/services/safira/safira.service';
import logger from '@/config/logger';

const router = Router();

// Apply rate limiting to all webhook routes
router.use(safiraApiLimiter);

/**
 * POST /webhooks/safira-tracking
 * Receive tracking events from Safira (page views, clicks, signups)
 */
router.post(
  '/safira-tracking',
  verifySafiraWebhookSignature,
  async (req: SafiraRequest, res: Response) => {
    try {
      const eventData = req.body;

      logger.info(`Received Safira tracking event: ${eventData.event_type}`, {
        eventId: eventData.event_id,
        referralCode: eventData.referral_code || eventData.utm_source,
      });

      const trackingEvent = await safiraService.processTrackingEvent(eventData);

      res.json({
        success: true,
        message: 'Event received',
        event_id: trackingEvent.eventId,
      });
    } catch (error: any) {
      logger.error('Error processing Safira tracking event:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * POST /webhooks/safira-conversion
 * Receive conversion notifications from Safira (investments, purchases)
 */
router.post(
  '/safira-conversion',
  verifySafiraWebhookSignature,
  async (req: SafiraRequest, res: Response) => {
    try {
      const conversionData = req.body;

      logger.info(`Received Safira conversion: ${conversionData.conversion_type}`, {
        conversionId: conversionData.conversion_id,
        referralCode: conversionData.referral_code,
        amount: conversionData.transaction?.amount,
      });

      const result = await safiraService.processConversion(conversionData);

      res.json({
        success: true,
        message: 'Conversion received',
        conversion_id: result.conversion.conversionId,
        slot_filled: result.slotFilled,
        slot_number: result.slotNumber,
      });
    } catch (error: any) {
      logger.error('Error processing Safira conversion:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * POST /webhooks/safira-daily-stats
 * Receive daily summary stats from Safira
 */
router.post(
  '/safira-daily-stats',
  verifySafiraWebhookSignature,
  async (req: SafiraRequest, res: Response) => {
    try {
      const statsData = req.body;

      logger.info(`Received Safira daily stats for: ${statsData.date}`, {
        sellersCount: statsData.sellers?.length,
        totalVisits: statsData.totals?.total_visits,
      });

      await safiraService.processDailyStats(statsData);

      res.json({
        success: true,
        message: 'Daily stats received',
        date: statsData.date,
        sellers_processed: statsData.sellers?.length || 0,
      });
    } catch (error: any) {
      logger.error('Error processing Safira daily stats:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

export default router;
