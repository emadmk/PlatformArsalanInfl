import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requireRole } from '@/middleware/auth.middleware';
import { User } from '@/models/User.model';
import { Project } from '@/models/Project.model';
import { Task } from '@/models/Task.model';
import projectService from '@/services/project/project.service';
import taskService from '@/services/task/task.service';
import walletService from '@/services/payment/wallet.service';
import transactionService from '@/services/payment/transaction.service';
import safiraService from '@/services/safira/safira.service';
import { SafiraInfluencerStats } from '@/models/SafiraInfluencerStats.model';
import { SafiraConversion } from '@/models/SafiraConversion.model';
import { SafiraTrackingEvent } from '@/models/SafiraTracking.model';
import { UserRole, ProjectStatus, TaskStatus } from 'shared';

const router = Router();

// All routes require influencer authentication
router.use(authenticateToken);
router.use(requireRole(UserRole.INFLUENCER));

// Dashboard Stats
router.get('/dashboard/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Count active projects (accepted influencer)
    const activeProjects = await Project.countDocuments({
      acceptedInfluencers: userId,
      status: { $in: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROGRESS] },
    });

    // Count completed tasks
    const completedTasks = await Task.countDocuments({
      influencerId: userId,
      status: TaskStatus.COMPLETED,
    });

    // Get wallet balance and calculate totals
    const balance = await walletService.getBalance(userId);
    const { transactions } = await transactionService.getTransactions(userId);

    const totalEarnings = transactions
      .filter((t: any) => t.type === 'credit' && t.status === 'completed')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    const pendingPayments = transactions
      .filter((t: any) => t.type === 'credit' && t.status === 'pending')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    res.json({
      activeProjects,
      completedTasks,
      totalEarnings,
      pendingPayments,
      currentBalance: balance,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Profile
router.get('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-password -twoFactorSecret');
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.user!.id, { profile: req.body }, { new: true });
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Projects
router.get('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Get projects where influencer is applied or accepted
    const query = {
      $or: [
        { appliedInfluencers: userId },
        { acceptedInfluencers: userId },
      ],
    };

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('businessId', 'firstName lastName profile.companyName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    res.json({ projects, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects/browse', async (req: AuthRequest, res: Response) => {
  try {
    const { projects, total } = await projectService.getProjects({
      status: ProjectStatus.APPROVED,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });

    res.json({ projects, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/projects/applied', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    // Query for projects where influencer has applied
    const [projects, total] = await Promise.all([
      Project.find({ appliedInfluencers: userId })
        .populate('businessId', 'firstName lastName profile.companyName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments({ appliedInfluencers: userId }),
    ]);

    res.json({ projects, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks
router.get('/tasks', async (req: AuthRequest, res: Response) => {
  try {
    const { tasks, total } = await taskService.getTasks({
      influencerId: req.user!.id,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });

    res.json({ tasks, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tasks/upcoming', async (req: AuthRequest, res: Response) => {
  try {
    const tasks = await taskService.getTasksByDeadline(req.user!.id, 7);
    res.json({ tasks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tasks/:id/submit', async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.submitTask(req.params.id, req.user!.id, req.body);
    res.json({ task });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Earnings
router.get('/earnings', async (req: AuthRequest, res: Response) => {
  try {
    const balance = await walletService.getBalance(req.user!.id);
    res.json({ balance });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/earnings/withdraw', async (req: AuthRequest, res: Response) => {
  try {
    const { amount, address, blockchain } = req.body;
    const withdrawalId = await walletService.withdraw(
      req.user!.id,
      amount,
      address,
      blockchain
    );

    res.json({ withdrawalId, message: 'Withdrawal request submitted' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// ============================================
// SAFIRA DASHBOARD ROUTES
// ============================================

// Get Safira dashboard overview
router.get('/safira/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const dashboardStats = await safiraService.getInfluencerDashboardStats(req.user!.id);
    res.json(dashboardStats);
  } catch (error: any) {
    // If stats not found, try to assign Safira project first
    if (error.statusCode === 404) {
      try {
        const assignment = await safiraService.assignSafiraProjectToInfluencer(req.user!.id);
        const dashboardStats = await safiraService.getInfluencerDashboardStats(req.user!.id);
        res.json(dashboardStats);
        return;
      } catch (assignError: any) {
        res.status(assignError.statusCode || 500).json({ error: assignError.message });
        return;
      }
    }
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get Safira referral link
router.get('/safira/referral-link', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await SafiraInfluencerStats.findOne({ influencerId: req.user!.id });

    if (!stats) {
      // Try to assign first
      const assignment = await safiraService.assignSafiraProjectToInfluencer(req.user!.id);
      res.json({
        referralCode: assignment.referralCode,
        referralUrl: assignment.referralUrl,
        socialLinks: {
          instagram: `${assignment.referralUrl}&utm_medium=instagram`,
          tiktok: `${assignment.referralUrl}&utm_medium=tiktok`,
          youtube: `${assignment.referralUrl}&utm_medium=youtube`,
          twitter: `${assignment.referralUrl}&utm_medium=twitter`,
          facebook: `${assignment.referralUrl}&utm_medium=facebook`,
        },
      });
      return;
    }

    res.json({
      referralCode: stats.referralCode,
      referralUrl: stats.referralUrl,
      socialLinks: {
        instagram: `${stats.referralUrl}&utm_medium=instagram`,
        tiktok: `${stats.referralUrl}&utm_medium=tiktok`,
        youtube: `${stats.referralUrl}&utm_medium=youtube`,
        twitter: `${stats.referralUrl}&utm_medium=twitter`,
        facebook: `${stats.referralUrl}&utm_medium=facebook`,
      },
    });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get Safira slot details
router.get('/safira/slots', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await SafiraInfluencerStats.findOne({ influencerId: req.user!.id });

    if (!stats) {
      res.status(404).json({ error: 'Safira stats not found' });
      return;
    }

    res.json({
      totalSlots: stats.totalSlots,
      filledSlots: stats.filledSlots,
      emptySlots: stats.totalSlots - stats.filledSlots,
      amountPerSlot: stats.amountPerSlot,
      totalLockedAmount: stats.totalLockedAmount,
      totalEarnedAmount: stats.totalEarnedAmount,
      availableBalance: stats.availableBalance,
      progress: Math.round((stats.filledSlots / stats.totalSlots) * 100),
      slots: stats.slots.map((slot) => ({
        number: slot.slotNumber,
        filled: slot.filled,
        amount: slot.amount,
        filledAt: slot.filledAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Safira conversion history
router.get('/safira/conversions', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [conversions, total] = await Promise.all([
      SafiraConversion.find({ influencerId: req.user!.id })
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      SafiraConversion.countDocuments({ influencerId: req.user!.id }),
    ]);

    res.json({
      conversions: conversions.map((c) => ({
        id: c.conversionId,
        type: c.conversionType,
        amount: c.transaction.commission,
        productName: c.product.name,
        productValue: c.transaction.productValue,
        slotNumber: c.slotNumber,
        status: c.status,
        timestamp: c.timestamp,
        customerIsNew: c.customer.isNew,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Safira tracking events
router.get('/safira/tracking', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;
    const eventType = req.query.type as string;

    const query: any = { influencerId: req.user!.id };
    if (eventType) {
      query.eventType = eventType;
    }

    const [events, total] = await Promise.all([
      SafiraTrackingEvent.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit),
      SafiraTrackingEvent.countDocuments(query),
    ]);

    res.json({
      events: events.map((e) => ({
        id: e.eventId,
        type: e.eventType,
        timestamp: e.timestamp,
        deviceType: e.deviceType,
        browser: e.browser,
        country: e.country,
        city: e.city,
        pageUrl: e.pageUrl,
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get Safira analytics summary
router.get('/safira/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await SafiraInfluencerStats.findOne({ influencerId: req.user!.id });

    if (!stats) {
      res.status(404).json({ error: 'Safira stats not found' });
      return;
    }

    // Get today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEvents = await SafiraTrackingEvent.countDocuments({
      influencerId: req.user!.id,
      timestamp: { $gte: today },
    });

    const todayConversions = await SafiraConversion.countDocuments({
      influencerId: req.user!.id,
      timestamp: { $gte: today },
    });

    // Get last 7 days stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyStats = await SafiraTrackingEvent.aggregate([
      {
        $match: {
          influencerId: stats.influencerId,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$eventType', 'CLICK'] }, 1, 0] },
          },
          pageViews: {
            $sum: { $cond: [{ $eq: ['$eventType', 'PAGE_VIEW'] }, 1, 0] },
          },
          signups: {
            $sum: { $cond: [{ $eq: ['$eventType', 'SIGNUP'] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const weeklyConversions = await SafiraConversion.aggregate([
      {
        $match: {
          influencerId: stats.influencerId,
          timestamp: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
          },
          conversions: { $sum: 1 },
          commission: { $sum: '$transaction.commission' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      overview: {
        totalClicks: stats.totalClicks,
        totalPageViews: stats.totalPageViews,
        totalSignups: stats.totalSignups,
        totalConversions: stats.totalConversions,
        conversionRate: stats.conversionRate.toFixed(2),
      },
      today: {
        events: todayEvents,
        conversions: todayConversions,
      },
      weekly: {
        tracking: weeklyStats,
        conversions: weeklyConversions,
      },
      earnings: {
        totalEarned: stats.totalEarnedAmount,
        availableBalance: stats.availableBalance,
        totalWithdrawn: stats.totalWithdrawnAmount,
        potentialEarnings: (stats.totalSlots - stats.filledSlots) * stats.amountPerSlot,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Request withdrawal from Safira earnings
router.post('/safira/withdraw', async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      res.status(400).json({ error: 'Invalid withdrawal amount' });
      return;
    }

    const result = await safiraService.requestWithdrawal(req.user!.id, amount);
    res.json(result);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export default router;
