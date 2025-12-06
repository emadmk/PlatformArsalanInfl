import mongoose, { Schema, Document } from 'mongoose';

export interface ISafiraDailyStats extends Document {
  date: Date;
  referralCode: string;
  influencerId: mongoose.Types.ObjectId;

  // Daily metrics
  visits: number;
  uniqueVisitors: number;
  signups: number;
  investments: number;
  purchases: number;
  revenue: number;
  commissionEarned: number;

  // Device breakdown
  deviceBreakdown?: {
    desktop: number;
    mobile: number;
    tablet: number;
  };

  // Browser breakdown
  browserBreakdown?: Record<string, number>;

  // Country breakdown
  countryBreakdown?: Record<string, number>;

  createdAt: Date;
  updatedAt: Date;
}

const SafiraDailyStatsSchema = new Schema<ISafiraDailyStats>(
  {
    date: {
      type: Date,
      required: true,
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

    // Daily metrics
    visits: {
      type: Number,
      default: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
    },
    signups: {
      type: Number,
      default: 0,
    },
    investments: {
      type: Number,
      default: 0,
    },
    purchases: {
      type: Number,
      default: 0,
    },
    revenue: {
      type: Number,
      default: 0,
    },
    commissionEarned: {
      type: Number,
      default: 0,
    },

    // Breakdowns
    deviceBreakdown: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    browserBreakdown: {
      type: Schema.Types.Mixed,
      default: {},
    },
    countryBreakdown: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for unique daily stats per influencer
SafiraDailyStatsSchema.index({ date: 1, referralCode: 1 }, { unique: true });
SafiraDailyStatsSchema.index({ influencerId: 1, date: -1 });

export const SafiraDailyStats = mongoose.model<ISafiraDailyStats>(
  'SafiraDailyStats',
  SafiraDailyStatsSchema
);
