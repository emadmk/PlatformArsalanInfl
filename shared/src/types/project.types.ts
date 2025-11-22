import { z } from 'zod';

export enum ProjectStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  REJECTED = 'rejected',
  APPROVED = 'approved',
  ACTIVE = 'active',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TaskStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

// Project Schema
export const ProjectSchema = z.object({
  id: z.string(),
  businessId: z.string(),
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  category: z.string(),
  tags: z.array(z.string()),
  budget: z.number().positive(),
  currency: z.string().default('USDT'),
  status: z.nativeEnum(ProjectStatus).default(ProjectStatus.DRAFT),
  requirements: z.object({
    minFollowers: z.number().int().optional(),
    platforms: z.array(z.string()),
    regions: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    contentTypes: z.array(z.string()),
  }),
  deliverables: z.array(z.object({
    title: z.string(),
    description: z.string(),
    quantity: z.number().int().positive(),
    deadline: z.date().optional(),
  })),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
  deadline: z.date(),
  maxInfluencers: z.number().int().positive().optional(),
  appliedInfluencers: z.array(z.string()).default([]),
  acceptedInfluencers: z.array(z.string()).default([]),
  rejectionReason: z.string().optional(),
  adminNotes: z.string().optional(),
  isPublic: z.boolean().default(true),
  invitedInfluencers: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type Project = z.infer<typeof ProjectSchema>;

// Task Schema
export const TaskSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  influencerId: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  amount: z.number().positive(),
  deadline: z.date(),
  deliverables: z.array(z.object({
    title: z.string(),
    description: z.string(),
    status: z.nativeEnum(TaskStatus).default(TaskStatus.PENDING),
    submittedUrl: z.string().optional(),
    submittedAt: z.date().optional(),
    approvedAt: z.date().optional(),
    rejectedAt: z.date().optional(),
    rejectionReason: z.string().optional(),
    screenshot: z.string().optional(),
  })),
  submittedWork: z.object({
    links: z.array(z.string()),
    screenshots: z.array(z.string()),
    notes: z.string().optional(),
    submittedAt: z.date(),
  }).optional(),
  review: z.object({
    approved: z.boolean(),
    rating: z.number().min(1).max(5).optional(),
    feedback: z.string().optional(),
    reviewedBy: z.string(),
    reviewedAt: z.date(),
  }).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
});

export type Task = z.infer<typeof TaskSchema>;

// Project Application Schema
export const ProjectApplicationSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  influencerId: z.string(),
  message: z.string().max(1000).optional(),
  proposedRate: z.number().positive().optional(),
  proposedDeliverables: z.array(z.string()).optional(),
  estimatedDelivery: z.string().optional(),
  status: z.enum(['pending', 'accepted', 'rejected']).default('pending'),
  rejectionReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type ProjectApplication = z.infer<typeof ProjectApplicationSchema>;

// Contract Schema
export const ContractSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  businessId: z.string(),
  influencerId: z.string(),
  terms: z.string(),
  amount: z.number().positive(),
  currency: z.string().default('USDT'),
  status: z.enum(['pending', 'signed', 'active', 'completed', 'terminated']),
  signedByInfluencer: z.boolean().default(false),
  signedByBusiness: z.boolean().default(false),
  influencerSignedAt: z.date().optional(),
  businessSignedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  completedAt: z.date().optional(),
});

export type Contract = z.infer<typeof ContractSchema>;
