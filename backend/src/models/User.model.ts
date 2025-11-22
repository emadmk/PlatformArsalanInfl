import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { UserRole, AdminRole } from '@shared/types';

export interface IUser extends Document {
  email: string;
  password: string;
  role: UserRole;
  adminRole?: AdminRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  profile?: any;
  wallet?: {
    balance: number;
    lockedBalance: number;
    address?: string;
  };
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const SocialAccountSchema = new Schema({
  platform: {
    type: String,
    enum: ['instagram', 'facebook', 'twitter', 'youtube', 'tiktok'],
    required: true,
  },
  username: { type: String, required: true },
  profileUrl: { type: String, required: true },
  followersCount: { type: Number, default: 0 },
  postsCount: { type: Number, default: 0 },
  engagementRate: { type: Number, default: 0 },
  verified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  lastSynced: Date,
  metadata: Schema.Types.Mixed,
});

const InfluencerProfileSchema = new Schema({
  bio: { type: String, maxlength: 500 },
  category: String,
  skills: [String],
  languages: [String],
  regions: [String],
  contentTypes: [String],
  capabilities: [String],
  socialAccounts: [SocialAccountSchema],
  portfolio: [String],
  rates: [
    {
      title: String,
      description: String,
      price: Number,
      deliverables: [String],
      duration: String,
    },
  ],
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalProjects: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 },
});

const BusinessProfileSchema = new Schema({
  companyName: String,
  industry: String,
  description: { type: String, maxlength: 1000 },
  website: String,
  productType: {
    type: String,
    enum: ['product', 'service', 'both'],
  },
  categories: [String],
  regions: [String],
  hasShipping: { type: Boolean, default: false },
  socialAccounts: [
    {
      platform: String,
      url: String,
    },
  ],
  logo: String,
  productImages: [String],
  goals: [String],
  targetAudience: {
    ageRange: String,
    gender: String,
    interests: [String],
    locations: [String],
  },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalProjects: { type: Number, default: 0 },
});

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
    },
    adminRole: {
      type: String,
      enum: Object.values(AdminRole),
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: String,
    avatar: String,
    profile: Schema.Types.Mixed,
    wallet: {
      balance: { type: Number, default: 0 },
      lockedBalance: { type: Number, default: 0 },
      address: String,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: String,
    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ 'profile.verified': 1 });
UserSchema.index({ createdAt: -1 });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.twoFactorSecret;
    delete ret.emailVerificationToken;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpires;
    return ret;
  },
});

export const User = mongoose.model<IUser>('User', UserSchema);
