import mongoose, { Schema, Document } from 'mongoose';
import { ContentStatus, ContentType } from '@shared/types';

export interface ICMSContent extends Document {
  type: ContentType;
  slug: string;
  title: Record<string, string>;
  content: Record<string, string>;
  excerpt?: Record<string, string>;
  metadata?: Record<string, any>;
  seo?: {
    metaTitle?: Record<string, string>;
    metaDescription?: Record<string, string>;
    keywords?: string[];
    ogImage?: string;
  };
  images?: string[];
  order: number;
  status: ContentStatus;
  isActive: boolean;
  publishedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlatformSettings extends Document {
  general: {
    siteName: Record<string, string>;
    siteDescription: Record<string, string>;
    logo?: string;
    favicon?: string;
    defaultLanguage: string;
    supportedLanguages: string[];
    maintenanceMode: boolean;
  };
  commission: {
    defaultRate: number;
    minimumWithdrawal: number;
    withdrawalFee: number;
  };
  registration: {
    influencerMinFollowers: Record<string, number>;
    requireEmailVerification: boolean;
    requireAdminApproval: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
  security: {
    maxLoginAttempts: number;
    loginAttemptWindow: number;
    sessionTimeout: number;
    require2FA: boolean;
  };
  updatedAt: Date;
  updatedBy: mongoose.Types.ObjectId;
}

const CMSContentSchema = new Schema<ICMSContent>(
  {
    type: {
      type: String,
      enum: Object.values(ContentType),
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: Map,
      of: String,
      required: true,
    },
    content: {
      type: Map,
      of: String,
      required: true,
    },
    excerpt: {
      type: Map,
      of: String,
    },
    metadata: Schema.Types.Mixed,
    seo: {
      metaTitle: {
        type: Map,
        of: String,
      },
      metaDescription: {
        type: Map,
        of: String,
      },
      keywords: [String],
      ogImage: String,
    },
    images: [String],
    order: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(ContentStatus),
      default: ContentStatus.DRAFT,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    publishedAt: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    general: {
      siteName: {
        type: Map,
        of: String,
        required: true,
      },
      siteDescription: {
        type: Map,
        of: String,
      },
      logo: String,
      favicon: String,
      defaultLanguage: {
        type: String,
        default: 'en',
      },
      supportedLanguages: {
        type: [String],
        default: ['en'],
      },
      maintenanceMode: {
        type: Boolean,
        default: false,
      },
    },
    commission: {
      defaultRate: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      minimumWithdrawal: {
        type: Number,
        required: true,
        min: 0,
      },
      withdrawalFee: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    registration: {
      influencerMinFollowers: {
        type: Map,
        of: Number,
        default: {},
      },
      requireEmailVerification: {
        type: Boolean,
        default: true,
      },
      requireAdminApproval: {
        type: Boolean,
        default: false,
      },
    },
    notifications: {
      emailEnabled: {
        type: Boolean,
        default: true,
      },
      pushEnabled: {
        type: Boolean,
        default: true,
      },
      smsEnabled: {
        type: Boolean,
        default: false,
      },
    },
    security: {
      maxLoginAttempts: {
        type: Number,
        default: 5,
      },
      loginAttemptWindow: {
        type: Number,
        default: 900,
      },
      sessionTimeout: {
        type: Number,
        default: 86400,
      },
      require2FA: {
        type: Boolean,
        default: false,
      },
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

// Indexes
CMSContentSchema.index({ slug: 1 });
CMSContentSchema.index({ type: 1 });
CMSContentSchema.index({ status: 1 });
CMSContentSchema.index({ order: 1 });

export const CMSContent = mongoose.model<ICMSContent>('CMSContent', CMSContentSchema);
export const PlatformSettings = mongoose.model<IPlatformSettings>(
  'PlatformSettings',
  PlatformSettingsSchema
);
