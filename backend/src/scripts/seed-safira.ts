/**
 * Seed script for Safira Business and Project
 *
 * This script creates:
 * 1. A business user for Safira
 * 2. The Safiralux project that all influencers are automatically assigned to
 *
 * Run with: npx ts-node -r tsconfig-paths/register src/scripts/seed-safira.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.model';
import { Project } from '../models/Project.model';
import { UserRole, ProjectStatus } from 'shared';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/micro_influencer';

// Safira Business Configuration
const SAFIRA_BUSINESS = {
  email: 'makhdoumiemad@gmail.com',
  password: '@Emadiemadi@0606',
  firstName: 'Safira',
  lastName: 'Luxury',
  role: UserRole.BUSINESS,
  profile: {
    companyName: 'Safira Luxury',
    industry: 'Luxury Investment',
    description:
      'Safira Luxury is a premium investment platform offering unique opportunities in luxury goods and art investments. Partner with us to earn commissions by referring customers to our platform.',
    website: 'https://safiralux.com',
    productType: 'service',
    categories: ['Investment', 'Luxury', 'Art'],
    regions: ['Global'],
    hasShipping: false,
    socialAccounts: [
      { platform: 'instagram', url: 'https://instagram.com/safiralux' },
      { platform: 'twitter', url: 'https://twitter.com/safiralux' },
    ],
    goals: ['Brand Awareness', 'Lead Generation', 'Sales'],
    targetAudience: {
      ageRange: '25-55',
      gender: 'all',
      interests: ['Investment', 'Luxury', 'Art', 'Finance'],
      locations: ['Global'],
    },
    verified: true,
    rating: 5,
    totalProjects: 1,
  },
  emailVerified: true,
  isActive: true,
  wallet: {
    balance: 100000,
    lockedBalance: 0,
  },
};

// Safira Project Configuration
const SAFIRA_PROJECT = {
  title: 'Safira Luxury Referral Program',
  description: `Join the Safira Luxury Referral Program and earn $40 for every successful referral!

**How it works:**
1. Share your unique referral link on your social media
2. When someone clicks your link and makes a purchase/investment on Safira
3. You earn $40 per successful conversion

**Earning Structure:**
- 20 slots available per cycle
- $40 per filled slot
- Total potential earnings: $800 per cycle
- Once all 20 slots are filled, you can withdraw your earnings and start a new cycle

**What you need to do:**
- Share your referral link on Instagram, TikTok, YouTube, or any other platform
- Create engaging content about Safira Luxury investments
- Track your conversions in your dashboard

**About Safira Luxury:**
Safira Luxury is a premium investment platform specializing in luxury goods and art investments. We offer unique investment opportunities with attractive returns.

Start earning today by sharing your referral link!`,
  category: 'Investment',
  tags: ['investment', 'luxury', 'referral', 'commission', 'passive-income'],
  budget: 1000000, // Large budget for ongoing program
  currency: 'USD',
  status: ProjectStatus.ACTIVE,
  requirements: {
    minFollowers: 100,
    platforms: ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'],
    regions: ['Global'],
    languages: ['English', 'Persian', 'Arabic'],
    contentTypes: ['POST', 'STORY', 'REEL', 'VIDEO'],
  },
  deliverables: [
    {
      title: 'Share Referral Link',
      description: 'Share your unique referral link on social media',
      quantity: 1,
    },
    {
      title: 'Generate Conversions',
      description: 'Get people to sign up and invest through your link',
      quantity: 20,
    },
  ],
  deadline: new Date('2030-12-31'), // Far future deadline for ongoing program
  maxInfluencers: 100000, // Unlimited influencers
  isPublic: false, // Not shown in public listing, auto-assigned
  metadata: {
    slug: 'safiralux',
    isSafiraProject: true,
    safiraConfig: {
      amountPerSlot: 40,
      totalSlots: 20,
      totalLockedAmount: 800,
    },
  },
};

async function seedSafira() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if Safira business already exists
    let safiraBusiness = await User.findOne({ email: SAFIRA_BUSINESS.email });

    if (safiraBusiness) {
      console.log('Safira business already exists, updating...');
      safiraBusiness = await User.findOneAndUpdate(
        { email: SAFIRA_BUSINESS.email },
        {
          $set: {
            profile: SAFIRA_BUSINESS.profile,
            isActive: true,
            emailVerified: true,
          },
        },
        { new: true }
      );
    } else {
      console.log('Creating Safira business...');
      safiraBusiness = new User(SAFIRA_BUSINESS);
      await safiraBusiness.save();
      console.log('Safira business created successfully');
    }

    console.log(`Safira Business ID: ${safiraBusiness!._id}`);

    // Check if Safira project already exists
    let safiraProject = await Project.findOne({ 'metadata.slug': 'safiralux' });

    if (safiraProject) {
      console.log('Safira project already exists, updating...');
      safiraProject = await Project.findOneAndUpdate(
        { 'metadata.slug': 'safiralux' },
        {
          $set: {
            ...SAFIRA_PROJECT,
            businessId: safiraBusiness!._id,
          },
        },
        { new: true }
      );
    } else {
      console.log('Creating Safira project...');
      safiraProject = new Project({
        ...SAFIRA_PROJECT,
        businessId: safiraBusiness!._id,
      });
      await safiraProject.save();
      console.log('Safira project created successfully');
    }

    console.log(`Safira Project ID: ${safiraProject!._id}`);

    console.log('\n========================================');
    console.log('SAFIRA SEED COMPLETED SUCCESSFULLY');
    console.log('========================================');
    console.log(`Business Email: ${SAFIRA_BUSINESS.email}`);
    console.log(`Business Password: ${SAFIRA_BUSINESS.password}`);
    console.log(`Project Title: ${safiraProject!.title}`);
    console.log(`Project Slug: ${safiraProject!.metadata?.slug}`);
    console.log('========================================\n');

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding Safira:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedSafira();
