import mongoose, { Schema, Document } from 'mongoose';

// Event types from Safira
export enum SafiraEventType {
  PAGE_VIEW = 'PAGE_VIEW',
  SESSION_START = 'SESSION_START',
  CLICK = 'CLICK',
  SIGNUP = 'SIGNUP',
  INVESTMENT = 'INVESTMENT',
  PURCHASE = 'PURCHASE',
  LOGIN_CLICK = 'LOGIN_CLICK',
  PAYMENT_CLICK = 'PAYMENT_CLICK',
}

export interface ISafiraTrackingEvent extends Document {
  eventType: SafiraEventType;
  eventId: string;
  referralCode: string;
  influencerId?: mongoose.Types.ObjectId;
  timestamp: Date;
  utmSource: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  visitorId?: string;
  userId?: string;
  sessionId?: string;
  deviceType?: string;
  browser?: string;
  browserVersion?: string;
  os?: string;
  osVersion?: string;
  country?: string;
  city?: string;
  pageUrl?: string;
  pageTitle?: string;
  sessionDuration?: number;
  scrollDepth?: number;
  eventData?: Record<string, any>;
  rawData?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const SafiraTrackingEventSchema = new Schema<ISafiraTrackingEvent>(
  {
    eventType: {
      type: String,
      enum: Object.values(SafiraEventType),
      required: true,
    },
    eventId: {
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
      required: false,
      index: true,
      sparse: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    utmSource: {
      type: String,
      required: true,
    },
    utmMedium: String,
    utmCampaign: String,
    utmContent: String,
    visitorId: String,
    userId: String,
    sessionId: String,
    deviceType: String,
    browser: String,
    browserVersion: String,
    os: String,
    osVersion: String,
    country: String,
    city: String,
    pageUrl: String,
    pageTitle: String,
    sessionDuration: Number,
    scrollDepth: Number,
    eventData: Schema.Types.Mixed,
    rawData: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics queries
SafiraTrackingEventSchema.index({ referralCode: 1, eventType: 1 });
SafiraTrackingEventSchema.index({ influencerId: 1, eventType: 1 });
SafiraTrackingEventSchema.index({ timestamp: -1 });
SafiraTrackingEventSchema.index({ referralCode: 1, timestamp: -1 });

export const SafiraTrackingEvent = mongoose.model<ISafiraTrackingEvent>(
  'SafiraTrackingEvent',
  SafiraTrackingEventSchema
);
