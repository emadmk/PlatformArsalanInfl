import { z } from 'zod';

export enum AuditAction {
  USER_CREATED = 'user_created',
  USER_UPDATED = 'user_updated',
  USER_DELETED = 'user_deleted',
  USER_BANNED = 'user_banned',
  USER_UNBANNED = 'user_unbanned',
  PROJECT_APPROVED = 'project_approved',
  PROJECT_REJECTED = 'project_rejected',
  PROJECT_DELETED = 'project_deleted',
  TASK_APPROVED = 'task_approved',
  TASK_REJECTED = 'task_rejected',
  WITHDRAWAL_APPROVED = 'withdrawal_approved',
  WITHDRAWAL_REJECTED = 'withdrawal_rejected',
  SETTINGS_UPDATED = 'settings_updated',
  CMS_UPDATED = 'cms_updated',
}

export enum EntityType {
  USER = 'user',
  PROJECT = 'project',
  TASK = 'task',
  TRANSACTION = 'transaction',
  WITHDRAWAL = 'withdrawal',
  CMS_CONTENT = 'cms_content',
  SETTINGS = 'settings',
}

// Audit Log Schema
export const AuditLogSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  adminId: z.string().optional(),
  action: z.nativeEnum(AuditAction),
  entityType: z.nativeEnum(EntityType).optional(),
  entityId: z.string().optional(),
  changes: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  status: z.string().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.date(),
});

export type AuditLog = z.infer<typeof AuditLogSchema>;

// Analytics Event Schema
export const AnalyticsEventSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  eventType: z.string(),
  eventName: z.string(),
  pageUrl: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  ipAddress: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
});

export type AnalyticsEvent = z.infer<typeof AnalyticsEventSchema>;

// User Session Schema
export const UserSessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  sessionToken: z.string(),
  refreshToken: z.string().optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  lastActivity: z.date(),
  expiresAt: z.date(),
  createdAt: z.date(),
  isActive: z.boolean().default(true),
});

export type UserSession = z.infer<typeof UserSessionSchema>;

// Platform Statistics Schema
export const PlatformStatisticsSchema = z.object({
  totalUsers: z.number().int().min(0),
  totalInfluencers: z.number().int().min(0),
  totalBusinesses: z.number().int().min(0),
  totalProjects: z.number().int().min(0),
  totalTasks: z.number().int().min(0),
  totalRevenue: z.number().min(0),
  activeUsers: z.number().int().min(0),
  activeProjects: z.number().int().min(0),
  completedProjects: z.number().int().min(0),
  totalCommission: z.number().min(0),
  averageProjectValue: z.number().min(0),
  averageCompletionTime: z.number().min(0),
});

export type PlatformStatistics = z.infer<typeof PlatformStatisticsSchema>;

// Dashboard Metrics Schema
export const DashboardMetricsSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year', 'all']),
  users: z.object({
    total: z.number().int(),
    new: z.number().int(),
    active: z.number().int(),
    growth: z.number(),
  }),
  projects: z.object({
    total: z.number().int(),
    pending: z.number().int(),
    active: z.number().int(),
    completed: z.number().int(),
    growth: z.number(),
  }),
  revenue: z.object({
    total: z.number(),
    commission: z.number(),
    growth: z.number(),
  }),
  engagement: z.object({
    pageViews: z.number().int(),
    sessions: z.number().int(),
    averageSessionDuration: z.number(),
    bounceRate: z.number(),
  }),
});

export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;
