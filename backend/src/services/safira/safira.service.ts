import mongoose from 'mongoose';
import crypto from 'crypto';
import config from '@/config';
import { User } from '@/models/User.model';
import { Project } from '@/models/Project.model';
import {
  SafiraTrackingEvent,
  SafiraEventType,
  ISafiraTrackingEvent,
} from '@/models/SafiraTracking.model';
import {
  SafiraConversion,
  SafiraConversionType,
  SafiraConversionStatus,
  ISafiraConversion,
} from '@/models/SafiraConversion.model';
import {
  SafiraInfluencerStats,
  ISafiraInfluencerStats,
} from '@/models/SafiraInfluencerStats.model';
import { SafiraDailyStats, ISafiraDailyStats } from '@/models/SafiraDailyStats.model';
import { AppError } from '@/middleware/error.middleware';
import { UserRole } from 'shared';
import logger from '@/config/logger';

// Constants
const SAFIRA_PROJECT_SLUG = 'safiralux';

class SafiraService {
  /**
   * Generate a unique referral code for an influencer
   */
  generateReferralCode(): string {
    const prefix = 'INF_';
    const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}${randomPart}`;
  }

  /**
   * Generate UTM referral URL for an influencer
   */
  generateReferralUrl(referralCode: string, medium: string = 'social'): string {
    const baseUrl = config.safira?.baseReferralUrl || 'https://safiralux.com/invest';
    return `${baseUrl}?ref=${referralCode}&utm_source=${referralCode}&utm_medium=${medium}`;
  }

  /**
   * Get or create Safira project
   */
  async getSafiraProject(): Promise<any> {
    let project = await Project.findOne({
      'metadata.slug': SAFIRA_PROJECT_SLUG,
    });

    if (!project) {
      // Auto-create Safira project if it doesn't exist
      logger.info('Safira project not found, creating automatically...');

      // First create or get Safira business user
      let safiraBusiness = await User.findOne({
        email: 'safira@microcollaboration.com'
      });

      if (!safiraBusiness) {
        safiraBusiness = new User({
          email: 'safira@microcollaboration.com',
          password: 'SafiraLux2024!',
          firstName: 'Safira',
          lastName: 'Luxury',
          role: UserRole.BUSINESS,
          profile: {
            companyName: 'Safira Luxury',
            industry: 'Luxury Investment',
            description: 'Premium investment platform',
            website: 'https://safiralux.com',
          },
          emailVerified: true,
          isActive: true,
        });
        await safiraBusiness.save();
        logger.info('Created Safira business account');
      }

      // Create the Safira project
      project = new Project({
        businessId: safiraBusiness._id,
        title: 'Safira Luxury Referral Program',
        description: 'Earn $40 for every successful referral. 20 slots = $800!',
        category: 'Investment',
        tags: ['investment', 'luxury', 'referral'],
        budget: 1000000,
        currency: 'USD',
        status: 'active',
        requirements: {
          minFollowers: 100,
          platforms: ['instagram', 'tiktok', 'youtube', 'twitter', 'facebook'],
          contentTypes: ['POST', 'STORY', 'REEL', 'VIDEO'],
        },
        deliverables: [
          { title: 'Share Referral Link', description: 'Share your unique referral link', quantity: 1 },
        ],
        deadline: new Date('2030-12-31'),
        maxInfluencers: 100000,
        isPublic: false,
        metadata: {
          slug: SAFIRA_PROJECT_SLUG,
          isSafiraProject: true,
          safiraConfig: {
            amountPerSlot: config.safira?.amountPerSlot || 40,
            totalSlots: config.safira?.totalSlots || 20,
            totalLockedAmount: config.safira?.totalLockedAmount || 800,
          },
        },
      });
      await project.save();
      logger.info('Created Safira project automatically');
    }

    return project;
  }

  /**
   * Initialize Safira stats for a new influencer
   */
  async initializeInfluencerStats(
    influencerId: mongoose.Types.ObjectId,
    referralCode: string,
    projectId: mongoose.Types.ObjectId
  ): Promise<ISafiraInfluencerStats> {
    const referralUrl = this.generateReferralUrl(referralCode);

    const stats = new SafiraInfluencerStats({
      influencerId,
      referralCode,
      projectId,
      referralUrl,
      totalSlots: config.safira?.totalSlots || 20,
      amountPerSlot: config.safira?.amountPerSlot || 40,
      totalLockedAmount: config.safira?.totalLockedAmount || 800,
    });

    await stats.save();
    return stats;
  }

  /**
   * Assign Safira project to a new influencer
   * Called during influencer registration
   */
  async assignSafiraProjectToInfluencer(userId: string): Promise<{
    referralCode: string;
    referralUrl: string;
    stats: ISafiraInfluencerStats;
  }> {
    const user = await User.findById(userId);
    if (!user || user.role !== UserRole.INFLUENCER) {
      throw new AppError('User not found or not an influencer', 404);
    }

    // Check if already has Safira stats
    const existingStats = await SafiraInfluencerStats.findOne({ influencerId: userId });
    if (existingStats) {
      return {
        referralCode: existingStats.referralCode,
        referralUrl: existingStats.referralUrl,
        stats: existingStats as ISafiraInfluencerStats,
      };
    }

    // Get Safira project
    const project = await this.getSafiraProject();

    // Generate unique referral code
    let referralCode: string = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      referralCode = this.generateReferralCode();
      const existing = await SafiraInfluencerStats.findOne({ referralCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new AppError('Failed to generate unique referral code', 500);
    }

    // Update user profile with referral code
    await User.findByIdAndUpdate(userId, {
      'profile.safiraReferralCode': referralCode,
    });

    // Add influencer to project's accepted list
    await Project.findByIdAndUpdate(project._id, {
      $addToSet: { acceptedInfluencers: userId },
    });

    // Initialize stats
    const newStats = await this.initializeInfluencerStats(
      new mongoose.Types.ObjectId(userId),
      referralCode,
      project._id
    );

    return {
      referralCode: referralCode,
      referralUrl: newStats.referralUrl,
      stats: newStats as ISafiraInfluencerStats,
    };
  }

  /**
   * Get influencer by referral code (for Safira API)
   */
  async getInfluencerByReferralCode(referralCode: string): Promise<any> {
    const stats = await SafiraInfluencerStats.findOne({ referralCode }).populate(
      'influencerId',
      'firstName lastName email profile'
    );

    if (!stats) {
      throw new AppError('Influencer not found', 404);
    }

    const user = stats.influencerId as any;

    return {
      referral_code: stats.referralCode,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      status: user.isActive ? 'active' : 'inactive',
      tier: this.calculateTier(stats.totalConversions),
      social_profiles: this.formatSocialProfiles(user.profile?.socialAccounts || []),
      commission_rate: 25, // Fixed rate for Safira
      payment_info: {
        method: 'crypto',
        wallet_address: user.wallet?.address || null,
      },
    };
  }

  /**
   * Get all active influencers (for Safira API)
   */
  async getActiveInfluencers(): Promise<any> {
    const stats = await SafiraInfluencerStats.find()
      .populate('influencerId', 'firstName lastName isActive profile createdAt')
      .sort({ totalEarnedAmount: -1 });

    const influencers = stats
      .filter((s) => (s.influencerId as any)?.isActive)
      .map((s) => {
        const user = s.influencerId as any;
        return {
          referral_code: s.referralCode,
          name: `${user.firstName} ${user.lastName}`,
          status: 'active',
          tier: this.calculateTier(s.totalConversions),
          commission_rate: 25,
          joined_at: user.createdAt,
        };
      });

    return {
      influencers,
      total: influencers.length,
      last_updated: new Date().toISOString(),
    };
  }

  /**
   * Process tracking event from Safira webhook
   * Saves ALL events, even if influencer not found (for future reference)
   */
  async processTrackingEvent(eventData: any): Promise<ISafiraTrackingEvent> {
    const referralCode = eventData.referral_code || eventData.utm_source;

    // Check for duplicate event
    const existingEvent = await SafiraTrackingEvent.findOne({
      eventId: eventData.event_id,
    });

    if (existingEvent) {
      logger.warn(`Duplicate tracking event: ${eventData.event_id}`);
      return existingEvent;
    }

    // Try to find influencer by referral code
    const stats = await SafiraInfluencerStats.findOne({
      referralCode: referralCode,
    });

    // Create tracking event - save even if influencer not found
    const trackingEvent = new SafiraTrackingEvent({
      eventType: eventData.event_type as SafiraEventType,
      eventId: eventData.event_id,
      referralCode: referralCode,
      influencerId: stats?.influencerId || undefined,
      timestamp: new Date(eventData.timestamp),
      utmSource: eventData.utm_source,
      utmMedium: eventData.utm_medium,
      utmCampaign: eventData.utm_campaign,
      utmContent: eventData.utm_content,
      visitorId: eventData.visitor_id,
      userId: eventData.user_id,
      sessionId: eventData.session_id,
      deviceType: eventData.device_type,
      browser: eventData.browser,
      browserVersion: eventData.browser_version,
      os: eventData.os,
      osVersion: eventData.os_version,
      country: eventData.country,
      city: eventData.city,
      pageUrl: eventData.page_url,
      pageTitle: eventData.page_title,
      sessionDuration: eventData.session_duration,
      scrollDepth: eventData.scroll_depth,
      eventData: eventData.event_data,
      rawData: eventData,
    });

    await trackingEvent.save();

    // If influencer found, update their stats
    if (stats) {
      const updateFields: any = {
        lastActivityAt: new Date(),
      };

      switch (eventData.event_type) {
        case SafiraEventType.PAGE_VIEW:
          updateFields.$inc = { totalPageViews: 1 };
          break;
        case SafiraEventType.SESSION_START:
          updateFields.$inc = { totalClicks: 1 };
          break;
        case SafiraEventType.CLICK:
          updateFields.$inc = { totalClicks: 1 };
          break;
        case SafiraEventType.SIGNUP:
          updateFields.$inc = { totalSignups: 1 };
          break;
        case SafiraEventType.INVESTMENT:
        case SafiraEventType.PAYMENT_CLICK:
          updateFields.$inc = { totalClicks: 1 };
          break;
      }

      if (updateFields.$inc) {
        await SafiraInfluencerStats.findByIdAndUpdate(stats._id, updateFields);
      }

      logger.info(`Tracking event saved for influencer: ${referralCode}`, {
        eventType: eventData.event_type,
        eventId: eventData.event_id,
      });
    } else {
      logger.info(`Tracking event saved (no influencer found): ${referralCode}`, {
        eventType: eventData.event_type,
        eventId: eventData.event_id,
      });
    }

    return trackingEvent;
  }

  /**
   * Process conversion event from Safira webhook
   */
  async processConversion(conversionData: any): Promise<{
    conversion: ISafiraConversion;
    slotFilled: boolean;
    slotNumber?: number;
  }> {
    // Find influencer by referral code
    const stats = await SafiraInfluencerStats.findOne({
      referralCode: conversionData.referral_code,
    });

    if (!stats) {
      throw new AppError('Influencer not found for referral code', 404);
    }

    // Check for duplicate conversion
    const existingConversion = await SafiraConversion.findOne({
      conversionId: conversionData.conversion_id,
    });

    if (existingConversion) {
      logger.warn(`Duplicate conversion: ${conversionData.conversion_id}`);
      return {
        conversion: existingConversion,
        slotFilled: false,
      };
    }

    // Create conversion record
    const conversion = new SafiraConversion({
      conversionType: conversionData.conversion_type as SafiraConversionType,
      conversionId: conversionData.conversion_id,
      referralCode: stats.referralCode,
      influencerId: stats.influencerId,
      timestamp: new Date(conversionData.timestamp),
      customer: {
        id: conversionData.customer.id,
        emailHash: conversionData.customer.email_hash,
        isNew: conversionData.customer.is_new,
        signupDate: conversionData.customer.signup_date
          ? new Date(conversionData.customer.signup_date)
          : undefined,
      },
      transaction: {
        amount: conversionData.transaction.amount,
        currency: conversionData.transaction.currency,
        productValue: conversionData.transaction.product_value,
        commission: config.safira?.amountPerSlot || 40, // Fixed $40 per slot
        commissionRate: 25,
      },
      product: {
        id: conversionData.product.id,
        name: conversionData.product.name,
        type: conversionData.product.type,
      },
      attribution: {
        firstClick: conversionData.attribution?.first_click
          ? new Date(conversionData.attribution.first_click)
          : undefined,
        lastClick: conversionData.attribution?.last_click
          ? new Date(conversionData.attribution.last_click)
          : undefined,
        totalVisits: conversionData.attribution?.total_visits || 1,
      },
      status: SafiraConversionStatus.CONFIRMED,
    });

    await conversion.save();

    // Fill a slot
    const filledSlot = await (stats as any).fillSlot(conversion.conversionId);

    if (filledSlot) {
      // Update conversion with slot number
      conversion.slotNumber = filledSlot.slotNumber;
      await conversion.save();

      logger.info(
        `Slot ${filledSlot.slotNumber} filled for influencer ${stats.referralCode}`
      );

      return {
        conversion,
        slotFilled: true,
        slotNumber: filledSlot.slotNumber,
      };
    }

    return {
      conversion,
      slotFilled: false,
    };
  }

  /**
   * Process daily stats from Safira webhook
   */
  async processDailyStats(statsData: any): Promise<void> {
    const date = new Date(statsData.date);

    for (const sellerStats of statsData.sellers) {
      const stats = await SafiraInfluencerStats.findOne({
        referralCode: sellerStats.referral_code,
      });

      if (!stats) {
        logger.warn(`Influencer not found for daily stats: ${sellerStats.referral_code}`);
        continue;
      }

      // Upsert daily stats
      await SafiraDailyStats.findOneAndUpdate(
        {
          date,
          referralCode: sellerStats.referral_code,
        },
        {
          $set: {
            influencerId: stats.influencerId,
            visits: sellerStats.visits,
            uniqueVisitors: sellerStats.unique_visitors,
            signups: sellerStats.signups,
            investments: sellerStats.investments,
            purchases: sellerStats.purchases,
            revenue: sellerStats.revenue,
            commissionEarned: sellerStats.commission_earned,
          },
        },
        { upsert: true, new: true }
      );
    }

    logger.info(`Processed daily stats for ${statsData.date}`);
  }

  /**
   * Get influencer Safira dashboard stats
   */
  async getInfluencerDashboardStats(userId: string): Promise<any> {
    const stats = await SafiraInfluencerStats.findOne({ influencerId: userId });

    if (!stats) {
      throw new AppError('Safira stats not found for this influencer', 404);
    }

    // Get recent conversions
    const recentConversions = await SafiraConversion.find({
      influencerId: userId,
      status: SafiraConversionStatus.CONFIRMED,
    })
      .sort({ timestamp: -1 })
      .limit(10);

    // Get daily stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyStats = await SafiraDailyStats.find({
      influencerId: userId,
      date: { $gte: thirtyDaysAgo },
    }).sort({ date: -1 });

    // Get device breakdown from tracking events
    const deviceBreakdown = await SafiraTrackingEvent.aggregate([
      { $match: { influencerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$deviceType', count: { $sum: 1 } } },
    ]);

    // Get country breakdown
    const countryBreakdown = await SafiraTrackingEvent.aggregate([
      { $match: { influencerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Get platform breakdown (by utm_medium)
    const platformBreakdown = await SafiraTrackingEvent.aggregate([
      { $match: { influencerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$utmMedium', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Calculate total for percentages
    const totalPlatformEvents = platformBreakdown.reduce((sum: number, item: any) => sum + item.count, 0);

    // Get event type breakdown
    const eventTypeBreakdown = await SafiraTrackingEvent.aggregate([
      { $match: { influencerId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$eventType', count: { $sum: 1 } } },
    ]);

    return {
      overview: {
        referralCode: stats.referralCode,
        referralUrl: stats.referralUrl,
        currentCycle: stats.currentCycle,
        cycleStartedAt: stats.cycleStartedAt,
      },
      slots: {
        total: stats.totalSlots,
        filled: stats.filledSlots,
        empty: stats.totalSlots - stats.filledSlots,
        progress: Math.round((stats.filledSlots / stats.totalSlots) * 100),
        details: stats.slots,
      },
      earnings: {
        totalLocked: stats.totalLockedAmount,
        totalEarned: stats.totalEarnedAmount,
        availableBalance: stats.availableBalance,
        totalWithdrawn: stats.totalWithdrawnAmount,
        amountPerSlot: stats.amountPerSlot,
        potentialEarnings: (stats.totalSlots - stats.filledSlots) * stats.amountPerSlot,
      },
      stats: {
        totalClicks: stats.totalClicks,
        totalPageViews: stats.totalPageViews,
        totalSignups: stats.totalSignups,
        totalConversions: stats.totalConversions,
        conversionRate: stats.conversionRate.toFixed(2),
      },
      activity: {
        lastActivityAt: stats.lastActivityAt,
        lastConversionAt: stats.lastConversionAt,
      },
      recentConversions: recentConversions.map((c) => ({
        id: c.conversionId,
        type: c.conversionType,
        amount: c.transaction.commission,
        productName: c.product.name,
        slotNumber: c.slotNumber,
        timestamp: c.timestamp,
      })),
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        visits: d.visits,
        signups: d.signups,
        conversions: d.investments + d.purchases,
        revenue: d.revenue,
        commission: d.commissionEarned,
      })),
      breakdown: {
        byDevice: deviceBreakdown.reduce((acc: any, item: any) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {}),
        byCountry: countryBreakdown.reduce((acc: any, item: any) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {}),
        byPlatform: platformBreakdown.map((item: any) => ({
          platform: item._id || 'direct',
          count: item.count,
          percentage: totalPlatformEvents > 0 ? Math.round((item.count / totalPlatformEvents) * 100) : 0,
        })),
        byEventType: eventTypeBreakdown.reduce((acc: any, item: any) => {
          acc[item._id || 'unknown'] = item.count;
          return acc;
        }, {}),
      },
    };
  }

  /**
   * Request withdrawal for Safira earnings
   */
  async requestWithdrawal(userId: string, amount: number): Promise<any> {
    const stats = await SafiraInfluencerStats.findOne({ influencerId: userId });

    if (!stats) {
      throw new AppError('Safira stats not found', 404);
    }

    if (amount > stats.availableBalance) {
      throw new AppError(
        `Insufficient balance. Available: $${stats.availableBalance}`,
        400
      );
    }

    // Create withdrawal request (will be handled by admin)
    // The actual withdrawal processing happens in the payment service
    return {
      requestedAmount: amount,
      availableBalance: stats.availableBalance,
      status: 'pending_approval',
      message:
        'Withdrawal request submitted. Admin will review and process your request.',
    };
  }

  /**
   * Process approved withdrawal
   */
  async processWithdrawal(userId: string, amount: number): Promise<void> {
    const stats = await SafiraInfluencerStats.findOne({ influencerId: userId });

    if (!stats) {
      throw new AppError('Safira stats not found', 404);
    }

    await (stats as any).resetSlots(amount);
  }

  // Helper methods
  private calculateTier(conversions: number): string {
    if (conversions >= 100) return 'platinum';
    if (conversions >= 50) return 'gold';
    if (conversions >= 10) return 'silver';
    return 'bronze';
  }

  private formatSocialProfiles(socialAccounts: any[]): any {
    const profiles: any = {};
    for (const account of socialAccounts) {
      profiles[account.platform] = account.username;
    }
    return profiles;
  }
}

export default new SafiraService();
