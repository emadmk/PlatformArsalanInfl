import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requireRole, requireAdminRole } from '@/middleware/auth.middleware';
import adminService from '@/services/admin/admin.service';
import projectService from '@/services/project/project.service';
import { User } from '@/models/User.model';
import { Project } from '@/models/Project.model';
import { UserRole, AdminRole, ProjectStatus } from 'shared';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(UserRole.ADMIN));

// Dashboard stats (legacy endpoint)
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Dashboard stats (new endpoint)
router.get('/dashboard/stats', async (req: AuthRequest, res: Response) => {
  try {
    // Get comprehensive dashboard stats
    const totalUsers = await User.countDocuments();
    const totalInfluencers = await User.countDocuments({ role: UserRole.INFLUENCER });
    const totalBusinesses = await User.countDocuments({ role: UserRole.BUSINESS });

    const activeProjects = await Project.countDocuments({
      status: { $in: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROGRESS] },
    });

    // Get pending approvals count
    const pendingProjects = await Project.countDocuments({ status: ProjectStatus.PENDING_APPROVAL });
    const pendingWithdrawals = await adminService.getPendingWithdrawalsCount();
    const pendingApprovals = pendingProjects + pendingWithdrawals;

    // Get revenue stats from dashboard stats
    const dashboardData = await adminService.getDashboardStats();
    const totalRevenue = dashboardData.revenue?.actual || 0;
    const monthlyRevenue = totalRevenue; // Same value for now

    res.json({
      totalUsers,
      totalInfluencers,
      totalBusinesses,
      activeProjects,
      pendingApprovals,
      totalRevenue,
      monthlyRevenue,
      pendingWithdrawals,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Users management
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const { users, total } = await adminService.getUsers({
      role: req.query.role,
      verified: req.query.verified,
      banned: req.query.banned,
      search: req.query.search,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });

    res.json({ users, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const data = await adminService.getUserById(req.params.id);
    res.json(data);
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/users/:id/ban', requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await adminService.banUser(req.params.id, req.body.reason, req.user!.id);
    res.json({ message: 'User banned successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/users/:id/unban', requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    await adminService.unbanUser(req.params.id, req.user!.id);
    res.json({ message: 'User unbanned successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/users/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    await adminService.verifyUser(req.params.id, req.user!.id);
    res.json({ message: 'User verified successfully' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Update user
router.put('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user status
router.put('/users/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status, 'profile.banned': status === 'banned' } },
      { new: true }
    ).select('-password');
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete('/users/:id', requireAdminRole(AdminRole.SUPER_ADMIN), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Projects management - Get all projects with filters
router.get('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .populate('businessId', 'firstName lastName email profile.companyName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      projects,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      page: Number(page),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).populate('businessId', 'firstName lastName email profile.companyName');

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ project });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Projects approval - pending
router.get('/projects/pending', async (req: AuthRequest, res: Response) => {
  try {
    const { projects } = await projectService.getProjects({
      status: ProjectStatus.PENDING_APPROVAL,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });

    res.json({ projects });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/projects/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectService.approveProject(req.params.id, req.user!.id);
    res.json({ project, message: 'Project approved' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/projects/:id/reject', async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectService.rejectProject(
      req.params.id,
      req.user!.id,
      req.body.reason
    );

    res.json({ project, message: 'Project rejected' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Withdrawals approval
router.get('/withdrawals/pending', async (req: AuthRequest, res: Response) => {
  try {
    const pending = await adminService.getPendingApprovals();
    res.json({ withdrawals: pending.withdrawals });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/withdrawals/:id/approve', requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.FINANCIAL), async (req: AuthRequest, res: Response) => {
  try {
    await adminService.approveWithdrawal(req.params.id, req.user!.id);
    res.json({ message: 'Withdrawal approved and processed' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/withdrawals/:id/reject', requireAdminRole(AdminRole.SUPER_ADMIN, AdminRole.FINANCIAL), async (req: AuthRequest, res: Response) => {
  try {
    await adminService.rejectWithdrawal(
      req.params.id,
      req.user!.id,
      req.body.reason
    );

    res.json({ message: 'Withdrawal rejected' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Analytics
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const period = req.query.period as any || 'month';
    const analytics = await adminService.getAnalytics(period);

    res.json(analytics);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit logs
router.get('/audit-logs', async (req: AuthRequest, res: Response) => {
  try {
    const { logs, total } = await adminService.getAuditLogs({
      adminId: req.query.adminId,
      action: req.query.action,
      entityType: req.query.entityType,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    });

    res.json({ logs, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Pending approvals (all types)
router.get('/approvals/pending', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get pending projects
    const pendingProjects = await Project.find({ status: ProjectStatus.PENDING_APPROVAL })
      .populate('businessId', 'firstName lastName profile.companyName')
      .sort({ createdAt: -1 })
      .limit(limit / 2);

    // Get pending withdrawals
    const pending = await adminService.getPendingApprovals();

    // Combine and format approvals
    const approvals = [
      ...pendingProjects.map((p: any) => ({
        id: p._id,
        type: 'project',
        title: p.title,
        requester: p.businessId?.profile?.companyName || `${p.businessId?.firstName} ${p.businessId?.lastName}`,
        amount: p.budget,
        createdAt: p.createdAt,
      })),
      ...pending.withdrawals.slice(0, limit / 2).map((w: any) => ({
        id: w._id,
        type: 'withdrawal',
        title: `Withdrawal Request`,
        requester: w.userId?.firstName ? `${w.userId.firstName} ${w.userId.lastName}` : 'Unknown',
        amount: w.amount,
        createdAt: w.createdAt,
      })),
    ];

    // Sort by date and limit
    approvals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ approvals: approvals.slice(0, limit) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Recent activity
router.get('/activity', async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Get recent audit logs as activities
    const { logs } = await adminService.getAuditLogs({
      page: 1,
      limit,
    });

    // Format as activities
    const activities = logs.map((log: any) => ({
      id: log._id,
      type: log.action,
      description: `${log.action} ${log.entityType} - ${log.details || ''}`,
      user: log.adminId?.firstName ? `${log.adminId.firstName} ${log.adminId.lastName}` : 'System',
      timestamp: log.timestamp,
    }));

    res.json({ activities });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =================== TRANSACTIONS ===================
router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;
    // Return empty for now - would connect to transaction model
    res.json({
      transactions: [],
      total: 0,
      totalPages: 0,
      page: Number(page),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =================== WITHDRAWALS ===================
router.get('/withdrawals', async (req: AuthRequest, res: Response) => {
  try {
    const pending = await adminService.getPendingApprovals();
    res.json({
      withdrawals: pending.withdrawals || [],
      total: pending.withdrawals?.length || 0,
      totalPages: 1,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/withdrawals/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const { txHash, adminNote } = req.body;
    await adminService.approveWithdrawal(req.params.id, req.user!.id);
    res.json({ message: 'Withdrawal completed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =================== CHATS MANAGEMENT ===================
router.get('/chats', async (req: AuthRequest, res: Response) => {
  try {
    // Import Chat model dynamically
    const { Chat } = await import('@/models/Chat.model');
    const { status, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Chat.countDocuments(query);
    const chats = await Chat.find(query)
      .populate('participants', 'firstName lastName email role profile.avatar profile.companyName')
      .populate('projectId', 'title')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      chats,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      page: Number(page),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/chats/stats', async (req: AuthRequest, res: Response) => {
  try {
    const { Chat } = await import('@/models/Chat.model');
    const { Message } = await import('@/models/Message.model');

    const totalChats = await Chat.countDocuments();
    const activeChats = await Chat.countDocuments({ status: 'active' });
    const suspendedChats = await Chat.countDocuments({ status: 'suspended' });
    const totalMessages = await Message.countDocuments();

    res.json({
      totalChats,
      activeChats,
      suspendedChats,
      totalMessages,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/chats/:id/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { Message } = await import('@/models/Message.model');
    const messages = await Message.find({ chatId: req.params.id })
      .populate('sender', 'firstName lastName role')
      .sort({ createdAt: 1 });
    res.json({ messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/chats/:id/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { Message } = await import('@/models/Message.model');
    const { Chat } = await import('@/models/Chat.model');

    const message = new Message({
      chatId: req.params.id,
      sender: req.user!.id,
      content: req.body.content,
      type: req.body.type || 'text',
    });
    await message.save();

    // Update chat's last message
    await Chat.findByIdAndUpdate(req.params.id, {
      lastMessage: {
        content: req.body.content,
        sender: req.user!.id,
        createdAt: new Date(),
      },
      updatedAt: new Date(),
    });

    res.json({ message });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/chats/create', async (req: AuthRequest, res: Response) => {
  try {
    const { Chat } = await import('@/models/Chat.model');
    const { userId } = req.body;

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user!.id, userId] },
    }).populate('participants', 'firstName lastName email role profile.avatar');

    if (!chat) {
      chat = new Chat({
        participants: [req.user!.id, userId],
        status: 'active',
      });
      await chat.save();
      await chat.populate('participants', 'firstName lastName email role profile.avatar');
    }

    res.json({ chat });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/chats/:id/suspend', async (req: AuthRequest, res: Response) => {
  try {
    const { Chat } = await import('@/models/Chat.model');
    await Chat.findByIdAndUpdate(req.params.id, { status: 'suspended' });
    res.json({ message: 'Chat suspended' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/chats/:id/unsuspend', async (req: AuthRequest, res: Response) => {
  try {
    const { Chat } = await import('@/models/Chat.model');
    await Chat.findByIdAndUpdate(req.params.id, { status: 'active' });
    res.json({ message: 'Chat unsuspended' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/chats/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { Chat } = await import('@/models/Chat.model');
    const { Message } = await import('@/models/Message.model');

    await Message.deleteMany({ chatId: req.params.id });
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: 'Chat deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =================== SAFIRA MANAGEMENT ===================
router.get('/safira/stats', async (req: AuthRequest, res: Response) => {
  try {
    // Mock data for Safira stats - would connect to Safira models
    res.json({
      totalInfluencers: 0,
      activeInfluencers: 0,
      totalConversions: 0,
      totalRevenue: 0,
      totalCommissions: 0,
      pendingPayouts: 0,
      conversionRate: 0,
      averageOrderValue: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/safira/influencers', async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      influencers: [],
      total: 0,
      totalPages: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/safira/conversions', async (req: AuthRequest, res: Response) => {
  try {
    res.json({
      conversions: [],
      total: 0,
      totalPages: 0,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/safira/sync', async (req: AuthRequest, res: Response) => {
  try {
    res.json({ message: 'Safira data synced' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// =================== ANALYTICS ===================
router.get('/analytics', async (req: AuthRequest, res: Response) => {
  try {
    const period = req.query.period as string || '30d';

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    // Get user stats
    const totalUsers = await User.countDocuments();
    const totalInfluencers = await User.countDocuments({ role: UserRole.INFLUENCER });
    const totalBusinesses = await User.countDocuments({ role: UserRole.BUSINESS });
    const newUsersToday = await User.countDocuments({
      createdAt: { $gte: new Date(now.setHours(0, 0, 0, 0)) },
    });
    const newUsersThisWeek = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    });

    // Get project stats
    const totalProjects = await Project.countDocuments();
    const activeProjects = await Project.countDocuments({
      status: { $in: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROGRESS] },
    });
    const completedProjects = await Project.countDocuments({ status: ProjectStatus.COMPLETED });
    const pendingProjects = await Project.countDocuments({ status: ProjectStatus.PENDING_APPROVAL });

    // Get budget stats
    const budgetAgg = await Project.aggregate([
      { $group: { _id: null, totalBudget: { $sum: '$budget' }, avgBudget: { $avg: '$budget' } } },
    ]);

    const totalBudget = budgetAgg[0]?.totalBudget || 0;
    const averageBudget = budgetAgg[0]?.avgBudget || 0;

    // Get top categories
    const topCategories = await Project.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, revenue: { $sum: '$budget' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { name: '$_id', count: 1, revenue: 1, _id: 0 } },
    ]);

    // Chat stats
    let totalChats = 0;
    let totalMessages = 0;
    let activeChatsToday = 0;
    try {
      const { Chat } = await import('@/models/Chat.model');
      const { Message } = await import('@/models/Message.model');
      totalChats = await Chat.countDocuments();
      totalMessages = await Message.countDocuments();
      activeChatsToday = await Chat.countDocuments({
        updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      });
    } catch (e) {
      // Chat model might not exist
    }

    res.json({
      overview: {
        totalUsers,
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        userGrowth: 10.5, // Mock growth
        totalInfluencers,
        totalBusinesses,
      },
      projects: {
        totalProjects,
        activeProjects,
        completedProjects,
        pendingProjects,
        projectGrowth: 5.2, // Mock growth
        averageBudget,
        totalBudget,
      },
      revenue: {
        totalRevenue: totalBudget * 0.2, // 20% platform fee
        monthlyRevenue: totalBudget * 0.05,
        platformFees: totalBudget * 0.2,
        revenueGrowth: 12.5, // Mock growth
        averageProjectValue: averageBudget,
      },
      engagement: {
        totalChats,
        totalMessages,
        averageResponseTime: 2.5,
        activeChatsToday,
      },
      topCategories,
      recentActivity: [],
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
