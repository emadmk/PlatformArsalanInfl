import mongoose, { Schema, Document } from 'mongoose';

export enum OfferStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
  EXPIRED = 'expired'
}

export interface IHotOffer extends Document {
  influencerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  targetCategories: string[];
  targetBrands?: string[];
  equipment: string[];
  languages: string[];
  scenarioSummary: string;
  contentTypes: string[];
  platforms: string[];
  price: number;
  currency: string;
  deliveryTime: number; // in days
  status: OfferStatus;
  viewCount: number;
  interestedBusinesses: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

const HotOfferSchema = new Schema<IHotOffer>(
  {
    influencerId: {
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
      maxlength: 2000,
    },
    targetCategories: {
      type: [String],
      required: true,
    },
    targetBrands: [String],
    equipment: {
      type: [String],
      default: [],
    },
    languages: {
      type: [String],
      required: true,
    },
    scenarioSummary: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    contentTypes: {
      type: [String],
      required: true,
    },
    platforms: {
      type: [String],
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USDT',
    },
    deliveryTime: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: Object.values(OfferStatus),
      default: OfferStatus.ACTIVE,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    interestedBusinesses: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    expiresAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
HotOfferSchema.index({ influencerId: 1 });
HotOfferSchema.index({ status: 1 });
HotOfferSchema.index({ targetCategories: 1 });
HotOfferSchema.index({ price: 1 });
HotOfferSchema.index({ createdAt: -1 });
HotOfferSchema.index({ platforms: 1 });

export const HotOffer = mongoose.model<IHotOffer>('HotOffer', HotOfferSchema);
