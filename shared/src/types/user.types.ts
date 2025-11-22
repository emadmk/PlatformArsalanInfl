import { z } from 'zod';

// Enums
export enum UserRole {
  INFLUENCER = 'influencer',
  BUSINESS = 'business',
  ADMIN = 'admin',
}

export enum AdminRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  SUPPORT = 'support',
  FINANCIAL = 'financial',
}

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
}

export enum ContentType {
  VIDEO = 'video',
  PHOTO = 'photo',
  STORY = 'story',
  REEL = 'reel',
  POST = 'post',
  PODCAST = 'podcast',
  INTERVIEW = 'interview',
  COMEDY = 'comedy',
  REVIEW = 'review',
  TUTORIAL = 'tutorial',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

// Social Account Schema
export const SocialAccountSchema = z.object({
  platform: z.nativeEnum(SocialPlatform),
  username: z.string(),
  profileUrl: z.string().url(),
  followersCount: z.number().int().min(0),
  postsCount: z.number().int().min(0),
  engagementRate: z.number().min(0).max(100),
  verified: z.boolean().default(false),
  verificationStatus: z.nativeEnum(VerificationStatus).default(VerificationStatus.PENDING),
  lastSynced: z.date().optional(),
  metadata: z.record(z.any()).optional(),
});

export type SocialAccount = z.infer<typeof SocialAccountSchema>;

// Influencer Profile Schema
export const InfluencerProfileSchema = z.object({
  bio: z.string().max(500),
  category: z.string(),
  skills: z.array(z.string()),
  languages: z.array(z.string()),
  regions: z.array(z.string()),
  contentTypes: z.array(z.nativeEnum(ContentType)),
  capabilities: z.array(z.string()),
  socialAccounts: z.array(SocialAccountSchema),
  portfolio: z.array(z.string()).optional(),
  rates: z.array(z.object({
    title: z.string(),
    description: z.string(),
    price: z.number().positive(),
    deliverables: z.array(z.string()),
    duration: z.string(),
  })),
  verified: z.boolean().default(false),
  rating: z.number().min(0).max(5).default(0),
  totalProjects: z.number().int().min(0).default(0),
  successRate: z.number().min(0).max(100).default(0),
});

export type InfluencerProfile = z.infer<typeof InfluencerProfileSchema>;

// Business Profile Schema
export const BusinessProfileSchema = z.object({
  companyName: z.string(),
  industry: z.string(),
  description: z.string().max(1000),
  website: z.string().url().optional(),
  productType: z.enum(['product', 'service', 'both']),
  categories: z.array(z.string()),
  regions: z.array(z.string()),
  hasShipping: z.boolean().default(false),
  socialAccounts: z.array(z.object({
    platform: z.nativeEnum(SocialPlatform),
    url: z.string().url(),
  })).optional(),
  logo: z.string().optional(),
  productImages: z.array(z.string()).optional(),
  goals: z.array(z.string()),
  targetAudience: z.object({
    ageRange: z.string().optional(),
    gender: z.string().optional(),
    interests: z.array(z.string()).optional(),
    locations: z.array(z.string()).optional(),
  }).optional(),
  verified: z.boolean().default(false),
  rating: z.number().min(0).max(5).default(0),
  totalProjects: z.number().int().min(0).default(0),
});

export type BusinessProfile = z.infer<typeof BusinessProfileSchema>;

// User Schema
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  adminRole: z.nativeEnum(AdminRole).optional(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  profile: z.union([InfluencerProfileSchema, BusinessProfileSchema]).optional(),
  wallet: z.object({
    balance: z.number().default(0),
    lockedBalance: z.number().default(0),
    address: z.string().optional(),
  }).optional(),
  twoFactorEnabled: z.boolean().default(false),
  twoFactorSecret: z.string().optional(),
  emailVerified: z.boolean().default(false),
  isActive: z.boolean().default(true),
  isBanned: z.boolean().default(false),
  banReason: z.string().optional(),
  lastLogin: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Registration schemas
export const InfluencerRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  profile: InfluencerProfileSchema.partial().extend({
    bio: z.string().max(500),
    category: z.string(),
  }),
});

export const BusinessRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  phone: z.string().optional(),
  profile: BusinessProfileSchema.partial().extend({
    companyName: z.string(),
    industry: z.string(),
    description: z.string().max(1000),
  }),
});

export type InfluencerRegistration = z.infer<typeof InfluencerRegistrationSchema>;
export type BusinessRegistration = z.infer<typeof BusinessRegistrationSchema>;
