import mongoose, { Schema, Document } from 'mongoose';

export enum SafiraConversionType {
  INVESTMENT = 'INVESTMENT',
  PURCHASE = 'PURCHASE',
}

export enum SafiraConversionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface ISafiraConversion extends Document {
  conversionType: SafiraConversionType;
  conversionId: string;
  referralCode: string;
  influencerId: mongoose.Types.ObjectId;
  timestamp: Date;
  customer: {
    id: string;
    emailHash: string;
    isNew: boolean;
    signupDate?: Date;
  };
  transaction: {
    amount: number;
    currency: string;
    productValue: number;
    commission: number;
    commissionRate: number;
  };
  product: {
    id: string;
    name: string;
    type: string;
  };
  attribution: {
    firstClick?: Date;
    lastClick?: Date;
    totalVisits: number;
  };
  status: SafiraConversionStatus;
  slotNumber?: number; // Which slot this conversion filled (1-20)
  createdAt: Date;
  updatedAt: Date;
}

const SafiraConversionSchema = new Schema<ISafiraConversion>(
  {
    conversionType: {
      type: String,
      enum: Object.values(SafiraConversionType),
      required: true,
    },
    conversionId: {
      type: String,
      required: true,
      unique: true,
    },
    referralCode: {
      type: String,
      required: true,
      index: true,
    },
    influencerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    customer: {
      id: { type: String, required: true },
      emailHash: String,
      isNew: { type: Boolean, default: true },
      signupDate: Date,
    },
    transaction: {
      amount: { type: Number, required: true },
      currency: { type: String, default: 'USD' },
      productValue: { type: Number, required: true },
      commission: { type: Number, required: true },
      commissionRate: { type: Number, required: true },
    },
    product: {
      id: String,
      name: String,
      type: String,
    },
    attribution: {
      firstClick: Date,
      lastClick: Date,
      totalVisits: { type: Number, default: 1 },
    },
    status: {
      type: String,
      enum: Object.values(SafiraConversionStatus),
      default: SafiraConversionStatus.CONFIRMED,
    },
    slotNumber: {
      type: Number,
      min: 1,
      max: 20,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SafiraConversionSchema.index({ referralCode: 1, status: 1 });
SafiraConversionSchema.index({ influencerId: 1, status: 1 });
SafiraConversionSchema.index({ timestamp: -1 });
SafiraConversionSchema.index({ 'customer.id': 1 });

export const SafiraConversion = mongoose.model<ISafiraConversion>(
  'SafiraConversion',
  SafiraConversionSchema
);
