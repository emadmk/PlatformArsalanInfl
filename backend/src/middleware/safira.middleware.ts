import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import config from '@/config';
import { AppError } from './error.middleware';
import rateLimit from 'express-rate-limit';

export interface SafiraRequest extends Request {
  safiraPlatformId?: string;
}

/**
 * Verify API key for Safira API read requests (when Safira reads from us)
 * Expects: Authorization: Bearer {SAFIRA_API_KEY}
 *
 * Safira sends: Authorization: Bearer microinfluencer-key-2024
 * We check against: SAFIRA_API_KEY env var
 */
export const verifySafiraApiKey = (
  req: SafiraRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

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

    req.safiraPlatformId = 'safira';
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Verify webhook requests from Safira (when Safira sends data to us)
 * Expects: Authorization: Bearer {SAFIRA_API_KEY}
 *
 * Safira sends: Authorization: Bearer microinfluencer-key-2024
 * We check against: SAFIRA_API_KEY env var
 */
export const verifySafiraWebhookSignature = (
  req: SafiraRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // Check for Bearer token (primary method from Safira)
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const apiKey = authHeader.split(' ')[1];

      if (!config.safira?.apiKey) {
        throw new AppError('Safira API key not configured', 500);
      }

      if (apiKey !== config.safira.apiKey) {
        throw new AppError('Invalid API key', 401);
      }

      req.safiraPlatformId = 'safira';
      return next();
    }

    // Fallback: Check for HMAC signature (X-Webhook-Signature)
    const signature = req.headers['x-webhook-signature'] as string;

    if (signature) {
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

      req.safiraPlatformId = 'safira';
      return next();
    }

    throw new AppError('Missing authorization header or webhook signature', 401);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Webhook verification failed', 401));
    }
  }
};

/**
 * Rate limiter specifically for Safira API endpoints
 * Max 100 requests per minute per API key
 */
export const safiraApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: 'Too many requests from Safira, please try again later.',
    code: 429,
  },
  keyGenerator: (req: SafiraRequest) => {
    return req.headers.authorization || req.ip || 'unknown';
  },
  standardHeaders: true,
  legacyHeaders: false,
});
