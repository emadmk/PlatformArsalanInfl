import mongoose, { Schema, Document } from 'mongoose';
import { ProjectStatus } from 'shared';

export interface IProject extends Document {
  businessId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  tags: string[];
  budget: number;
  currency: string;
  status: ProjectStatus;
  requirements: {
    minFollowers?: number;
    platforms: string[];
    regions?: string[];
    languages?: string[];
    contentTypes: string[];
  };
  deliverables: Array<{
    title: string;
    description: string;
    quantity: number;
    deadline?: Date;
  }>;
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  deadline: Date;
  maxInfluencers?: number;
  appliedInfluencers: mongoose.Types.ObjectId[];
  acceptedInfluencers: mongoose.Types.ObjectId[];
  rejectionReason?: string;
  adminNotes?: string;
  isPublic: boolean;
  invitedInfluencers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 5000,
    },
    category: {
      type: String,
      required: true,
    },
    tags: [String],
    budget: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USDT',
    },
    status: {
      type: String,
      enum: Object.values(ProjectStatus),
      default: ProjectStatus.DRAFT,
    },
    requirements: {
      minFollowers: Number,
      platforms: [String],
      regions: [String],
      languages: [String],
      contentTypes: [String],
    },
    deliverables: [
      {
        title: String,
        description: String,
        quantity: Number,
        deadline: Date,
      },
    ],
    attachments: [
      {
        name: String,
        url: String,
        type: String,
        size: Number,
      },
    ],
    deadline: {
      type: Date,
      required: true,
    },
    maxInfluencers: Number,
    appliedInfluencers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    acceptedInfluencers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    rejectionReason: String,
    adminNotes: String,
    isPublic: {
      type: Boolean,
      default: true,
    },
    invitedInfluencers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
ProjectSchema.index({ businessId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ deadline: 1 });
ProjectSchema.index({ 'requirements.platforms': 1 });

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
