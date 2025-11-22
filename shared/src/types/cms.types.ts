import { z } from 'zod';

export enum ContentStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum CMSContentType {
  PAGE = 'page',
  SECTION = 'section',
  BANNER = 'banner',
  TESTIMONIAL = 'testimonial',
  FAQ = 'faq',
  BLOG_POST = 'blog_post',
}

// CMS Content Schema
export const CMSContentSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(CMSContentType),
  slug: z.string(),
  title: z.record(z.string()), // { en: 'Title', fa: 'عنوان', ... }
  content: z.record(z.string()), // { en: 'Content', fa: 'محتوا', ... }
  excerpt: z.record(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
  seo: z.object({
    metaTitle: z.record(z.string()).optional(),
    metaDescription: z.record(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
  }).optional(),
  images: z.array(z.string()).optional(),
  order: z.number().int().default(0),
  status: z.nativeEnum(ContentStatus).default(ContentStatus.DRAFT),
  isActive: z.boolean().default(true),
  publishedAt: z.date().optional(),
  createdBy: z.string(),
  updatedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CMSContent = z.infer<typeof CMSContentSchema>;

// Landing Page Content Schema
export const LandingPageContentSchema = z.object({
  hero: z.object({
    title: z.record(z.string()),
    subtitle: z.record(z.string()),
    ctaText: z.record(z.string()),
    backgroundImage: z.string().optional(),
    videoUrl: z.string().optional(),
  }),
  statistics: z.object({
    users: z.number().int(),
    projects: z.number().int(),
    earnings: z.number(),
    multiplier: z.number().default(1.5), // To show inflated numbers
  }),
  features: z.array(z.object({
    icon: z.string(),
    title: z.record(z.string()),
    description: z.record(z.string()),
  })),
  howItWorks: z.array(z.object({
    step: z.number().int(),
    title: z.record(z.string()),
    description: z.record(z.string()),
    image: z.string().optional(),
  })),
  testimonials: z.array(z.object({
    name: z.string(),
    role: z.string(),
    avatar: z.string().optional(),
    rating: z.number().min(1).max(5),
    comment: z.record(z.string()),
  })),
  faq: z.array(z.object({
    question: z.record(z.string()),
    answer: z.record(z.string()),
  })),
  footer: z.object({
    about: z.record(z.string()),
    socialLinks: z.array(z.object({
      platform: z.string(),
      url: z.string(),
    })),
    contact: z.object({
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.record(z.string()).optional(),
    }),
  }),
});

export type LandingPageContent = z.infer<typeof LandingPageContentSchema>;

// Settings Schema
export const PlatformSettingsSchema = z.object({
  id: z.string(),
  general: z.object({
    siteName: z.record(z.string()),
    siteDescription: z.record(z.string()),
    logo: z.string().optional(),
    favicon: z.string().optional(),
    defaultLanguage: z.string().default('en'),
    supportedLanguages: z.array(z.string()).default(['en']),
    maintenanceMode: z.boolean().default(false),
  }),
  commission: z.object({
    defaultRate: z.number().min(0).max(100),
    minimumWithdrawal: z.number().positive(),
    withdrawalFee: z.number().min(0),
  }),
  registration: z.object({
    influencerMinFollowers: z.record(z.number()),
    requireEmailVerification: z.boolean().default(true),
    requireAdminApproval: z.boolean().default(false),
  }),
  notifications: z.object({
    emailEnabled: z.boolean().default(true),
    pushEnabled: z.boolean().default(true),
    smsEnabled: z.boolean().default(false),
  }),
  security: z.object({
    maxLoginAttempts: z.number().int().default(5),
    loginAttemptWindow: z.number().int().default(900), // seconds
    sessionTimeout: z.number().int().default(86400), // seconds
    require2FA: z.boolean().default(false),
  }),
  updatedAt: z.date(),
  updatedBy: z.string(),
});

export type PlatformSettings = z.infer<typeof PlatformSettingsSchema>;
