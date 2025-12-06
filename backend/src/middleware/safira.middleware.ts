import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import config from '@/config';
import { AppError } from './error.middleware';

export interface SafiraRequest extends Request {
  safiraPlatformId?: string;
}

/**
 * Verify API key for Safira requests
 * Expects: Authorization: Bearer {SAFIRA_API_KEY}
 *          X-Platform-ID: safira
 */
export const verifySafiraApiKey = (
  req: SafiraRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const platformId = req.headers['x-platform-id'] as string;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid authorization header', 401);
    }

    const apiKey = authHeader.split(' ')[1];

    if (!config.safira?.apiKey) {
      throw new AppError('Safira API key not configured', 500);
    }

    if (apiKey !== config.safira.apiKey) {
      throw new AppError('Invalid API key', 401);
    }

    if (platformId !== 'safira') {
      throw new AppError('Invalid platform ID', 401);
    }

    req.safiraPlatformId = platformId;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify webhook signature for Safira webhooks
 * Expects: X-Webhook-Signature: {HMAC-SHA256 signature}
 */
export const verifySafiraWebhookSignature = (
  req: SafiraRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const platformId = req.headers['x-platform-id'] as string;

    if (!signature) {
      throw new AppError('Missing webhook signature', 401);
    }

    if (!config.safira?.webhookSecret) {
      throw new AppError('Safira webhook secret not configured', 500);
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', config.safira.webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // Use timing-safe comparison to prevent timing attacks
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      throw new AppError('Invalid webhook signature', 401);
    }

    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      throw new AppError('Invalid webhook signature', 401);
    }

    if (platformId !== 'safira') {
      throw new AppError('Invalid platform ID', 401);
    }

    req.safiraPlatformId = platformId;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Webhook signature verification failed', 401));
    }
  }
};

/**
 * Rate limiter specifically for Safira API endpoints
 * Max 100 requests per minute per API key
 */
import rateLimit from 'express-rate-limit';

export const safiraApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Too many requests from Safira, please try again later.',
    code: 429,
  },
  keyGenerator: (req: SafiraRequest) => {
    return req.headers['x-platform-id'] as string || req.ip || 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
});
