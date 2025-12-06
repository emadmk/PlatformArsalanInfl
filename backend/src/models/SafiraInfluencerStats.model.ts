import mongoose, { Schema, Document } from 'mongoose';

export interface ISafiraSlot {
  slotNumber: number;
  filled: boolean;
  conversionId?: string;
  filledAt?: Date;
  amount: number;
}

export interface ISafiraInfluencerStats extends Document {
  influencerId: mongoose.Types.ObjectId;
  referralCode: string;
  projectId: mongoose.Types.ObjectId;

  // Slot system
  slots: ISafiraSlot[];
  totalSlots: number;
  filledSlots: number;
  amountPerSlot: number;

  // Earnings
  totalLockedAmount: number;
  totalEarnedAmount: number;
  totalWithdrawnAmount: number;
  availableBalance: number;

  // Stats
  totalClicks: number;
  totalPageViews: number;
  totalSignups: number;
  totalConversions: number;
  conversionRate: number;

  // Tracking
  lastActivityAt?: Date;
  lastConversionAt?: Date;

  // Cycle tracking (resets after withdrawal)
  currentCycle: number;
  cycleStartedAt: Date;

  // UTM link
  referralUrl: string;

  createdAt: Date;
  updatedAt: Date;
}

const SafiraSlotSchema = new Schema<ISafiraSlot>(
  {
    slotNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    filled: {
      type: Boolean,
      default: false,
    },
    conversionId: String,
    filledAt: Date,
    amount: {
      type: Number,
      default: 40,
    },
  },
  { _id: false }
);

const SafiraInfluencerStatsSchema = new Schema<ISafiraInfluencerStats>(
  {
    influencerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },

    // Slot system - 20 slots, $40 each = $800 total
    slots: {
      type: [SafiraSlotSchema],
      default: () => {
        const slots: ISafiraSlot[] = [];
        for (let i = 1; i <= 20; i++) {
          slots.push({
            slotNumber: i,
            filled: false,
            amount: 40,
          });
        }
        return slots;
      },
    },
    totalSlots: {
      type: Number,
      default: 20,
    },
    filledSlots: {
      type: Number,
      default: 0,
    },
    amountPerSlot: {
      type: Number,
      default: 40,
    },

    // Earnings
    totalLockedAmount: {
      type: Number,
      default: 800, // 20 slots × $40
    },
    totalEarnedAmount: {
      type: Number,
      default: 0,
    },
    totalWithdrawnAmount: {
      type: Number,
      default: 0,
    },
    availableBalance: {
      type: Number,
      default: 0,
    },

    // Stats
    totalClicks: {
      type: Number,
      default: 0,
    },
    totalPageViews: {
      type: Number,
      default: 0,
    },
    totalSignups: {
      type: Number,
      default: 0,
    },
    totalConversions: {
      type: Number,
      default: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
    },

    // Tracking
    lastActivityAt: Date,
    lastConversionAt: Date,

    // Cycle tracking
    currentCycle: {
      type: Number,
      default: 1,
    },
    cycleStartedAt: {
      type: Date,
      default: Date.now,
    },

    // UTM link
    referralUrl: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SafiraInfluencerStatsSchema.index({ influencerId: 1 });
SafiraInfluencerStatsSchema.index({ referralCode: 1 });
SafiraInfluencerStatsSchema.index({ filledSlots: -1 });
SafiraInfluencerStatsSchema.index({ totalEarnedAmount: -1 });

// Virtual for progress percentage
SafiraInfluencerStatsSchema.virtual('progressPercentage').get(function () {
  return Math.round((this.filledSlots / this.totalSlots) * 100);
});

// Method to fill a slot
SafiraInfluencerStatsSchema.methods.fillSlot = async function (conversionId: string) {
  const emptySlot = this.slots.find((slot: ISafiraSlot) => !slot.filled);
  if (!emptySlot) {
    return null; // All slots filled
  }

  emptySlot.filled = true;
  emptySlot.conversionId = conversionId;
  emptySlot.filledAt = new Date();

  this.filledSlots += 1;
  this.totalEarnedAmount += emptySlot.amount;
  this.availableBalance += emptySlot.amount;
  this.totalConversions += 1;
  this.lastConversionAt = new Date();

  // Update conversion rate
  if (this.totalClicks > 0) {
    this.conversionRate = (this.totalConversions / this.totalClicks) * 100;
  }

  await this.save();
  return emptySlot;
};

// Method to reset slots after withdrawal
SafiraInfluencerStatsSchema.methods.resetSlots = async function (withdrawnAmount: number) {
  this.totalWithdrawnAmount += withdrawnAmount;
  this.availableBalance -= withdrawnAmount;

  // If all slots are filled and withdrawal is complete, start new cycle
  if (this.filledSlots >= this.totalSlots && this.availableBalance === 0) {
    this.currentCycle += 1;
    this.cycleStartedAt = new Date();
    this.filledSlots = 0;

    // Reset all slots
    this.slots = [];
    for (let i = 1; i <= 20; i++) {
      this.slots.push({
        slotNumber: i,
        filled: false,
        amount: 40,
      });
    }
  }

  await this.save();
};

export const SafiraInfluencerStats = mongoose.model<ISafiraInfluencerStats>(
  'SafiraInfluencerStats',
  SafiraInfluencerStatsSchema
);
