import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Application
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000'),
  apiPrefix: '/api/v1',

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // 2FA
  twoFactor: {
    secret: process.env.TWO_FACTOR_SECRET || 'your-2fa-secret',
    issuer: 'MicroInfluencer',
  },

  // Social Media APIs
  social: {
    instagram: {
      appId: process.env.INSTAGRAM_APP_ID,
      appSecret: process.env.INSTAGRAM_APP_SECRET,
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
    },
    twitter: {
      apiKey: process.env.TWITTER_API_KEY,
      apiSecret: process.env.TWITTER_API_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
    },
    youtube: {
      apiKey: process.env.YOUTUBE_API_KEY,
    },
    tiktok: {
      clientKey: process.env.TIKTOK_CLIENT_KEY,
      clientSecret: process.env.TIKTOK_CLIENT_SECRET,
    },
  },

  // Crypto/Blockchain
  blockchain: {
    ethereum: {
      providerUrl: process.env.WEB3_PROVIDER_URL_ETH,
      usdtContract: process.env.USDT_CONTRACT_ADDRESS_ETH,
    },
    bsc: {
      providerUrl: process.env.WEB3_PROVIDER_URL_BSC,
      usdtContract: process.env.USDT_CONTRACT_ADDRESS_BSC,
    },
    tron: {
      providerUrl: process.env.WEB3_PROVIDER_URL_TRON,
      usdtContract: process.env.USDT_CONTRACT_ADDRESS_TRON,
    },
    platformWallet: {
      address: process.env.PLATFORM_WALLET_ADDRESS,
      privateKey: process.env.PLATFORM_WALLET_PRIVATE_KEY,
    },
  },

  // OneSignal
  oneSignal: {
    appId: process.env.ONESIGNAL_APP_ID,
    restApiKey: process.env.ONESIGNAL_REST_API_KEY,
  },

  // Email
  email: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.EMAIL_FROM || 'noreply@microinfluencer.com',
  },

  // Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    maxFiles: parseInt(process.env.MAX_FILES_PER_UPLOAD || '10'),
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedFileTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },

  // Commission
  commission: {
    defaultRate: parseFloat(process.env.DEFAULT_COMMISSION_RATE || '20'),
  },

  // Minimum followers for auto-approval
  minFollowers: {
    instagram: parseInt(process.env.MIN_INSTAGRAM_FOLLOWERS || '1000'),
    facebook: parseInt(process.env.MIN_FACEBOOK_FOLLOWERS || '1000'),
    twitter: parseInt(process.env.MIN_TWITTER_FOLLOWERS || '1000'),
    youtube: parseInt(process.env.MIN_YOUTUBE_SUBSCRIBERS || '1000'),
    tiktok: parseInt(process.env.MIN_TIKTOK_FOLLOWERS || '1000'),
  },

  // Frontend URL
  frontendUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: true,
  },

  // Safira Integration
  safira: {
    apiKey: process.env.SAFIRA_API_KEY,
    webhookSecret: process.env.SAFIRA_WEBHOOK_SECRET,
    apiUrl: process.env.SAFIRA_API_URL || 'https://safiralux.com/api/v1/external',
    baseReferralUrl: process.env.SAFIRA_REFERRAL_URL || 'https://safiralux.com/invest',
    // Slot configuration
    totalSlots: parseInt(process.env.SAFIRA_TOTAL_SLOTS || '20'),
    amountPerSlot: parseFloat(process.env.SAFIRA_AMOUNT_PER_SLOT || '40'),
    totalLockedAmount: parseFloat(process.env.SAFIRA_TOTAL_LOCKED_AMOUNT || '800'),
  },
};

export default config;
