import mongoose, { Schema, Document } from 'mongoose';
import { TaskStatus, TaskPriority } from '@shared/types';

export interface ITask extends Document {
  projectId: mongoose.Types.ObjectId;
  influencerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  amount: number;
  deadline: Date;
  deliverables: Array<{
    title: string;
    description: string;
    status: TaskStatus;
    submittedUrl?: string;
    submittedAt?: Date;
    approvedAt?: Date;
    rejectedAt?: Date;
    rejectionReason?: string;
    screenshot?: string;
  }>;
  submittedWork?: {
    links: string[];
    screenshots: string[];
    notes?: string;
    submittedAt: Date;
  };
  review?: {
    approved: boolean;
    rating?: number;
    feedback?: string;
    reviewedBy: mongoose.Types.ObjectId;
    reviewedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    influencerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.PENDING,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    deadline: {
      type: Date,
      required: true,
    },
    deliverables: [
      {
        title: String,
        description: String,
        status: {
          type: String,
          enum: Object.values(TaskStatus),
          default: TaskStatus.PENDING,
        },
        submittedUrl: String,
        submittedAt: Date,
        approvedAt: Date,
        rejectedAt: Date,
        rejectionReason: String,
        screenshot: String,
      },
    ],
    submittedWork: {
      links: [String],
      screenshots: [String],
      notes: String,
      submittedAt: Date,
    },
    review: {
      approved: Boolean,
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      feedback: String,
      reviewedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      reviewedAt: Date,
    },
    startedAt: Date,
    completedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ influencerId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ deadline: 1 });
TaskSchema.index({ createdAt: -1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
