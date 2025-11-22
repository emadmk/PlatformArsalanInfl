import { User } from '@/models/User.model';
import { Project } from '@/models/Project.model';
import { Task } from '@/models/Task.model';
import { AppDataSource } from '@/config/database';
import { AppError } from '@/middleware/error.middleware';
import { ProjectStatus, TaskStatus } from 'shared';

export class AdminService {
  async getDashboardStats(): Promise<any> {
    const [
      totalUsers,
      totalInfluencers,
      totalBusinesses,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      completedTasks,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'influencer' }),
      User.countDocuments({ role: 'business' }),
      Project.countDocuments(),
      Project.countDocuments({ status: ProjectStatus.IN_PROGRESS }),
      Project.countDocuments({ status: ProjectStatus.COMPLETED }),
      Task.countDocuments(),
      Task.countDocuments({ status: TaskStatus.COMPLETED }),
    ]);

    // Get transaction stats from PostgreSQL
    const transactionRepo = AppDataSource.getRepository('transactions');
    const revenueResult = await transactionRepo
      .createQueryBuilder('transaction')
      .select('SUM(transaction.amount)', 'total')
      .where('transaction.type = :type', { type: 'commission' })
      .andWhere('transaction.status = :status', { status: 'completed' })
      .getRawOne();

    const totalRevenue = parseFloat(revenueResult?.total || '0');

    // Calculate for display (with multiplier as mentioned)
    const displayMultiplier = 1.5;

    return {
      users: {
        total: totalUsers,
        influencers: totalInfluencers,
        businesses: totalBusinesses,
        display: Math.floor(totalUsers * displayMultiplier),
      },
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        display: Math.floor(totalProjects * displayMultiplier),
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
      },
      revenue: {
        actual: totalRevenue,
        display: totalRevenue * displayMultiplier,
      },
    };
  }

  async getUsers(filters: any = {}) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.role) query.role = filters.role;
    if (filters.verified !== undefined) query['profile.verified'] = filters.verified;
    if (filters.banned !== undefined) query.isBanned = filters.banned;
    if (filters.search) {
      query.$or = [
        { email: { $regex: filters.search, $options: 'i' } },
        { firstName: { $regex: filters.search, $options: 'i' } },
        { lastName: { $regex: filters.search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -twoFactorSecret')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query),
    ]);

    return { users, total };
  }

  async getUserById(userId: string) {
    const user = await User.findById(userId).select('-password -twoFactorSecret');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Get user's sessions from PostgreSQL
    const sessionRepo = AppDataSource.getRepository('user_sessions');
    const sessions = await sessionRepo.find({
      where: { userId, isActive: true },
      order: { lastActivity: 'DESC' },
      take: 10,
    });

    // Get user's transactions
    const transactionRepo = AppDataSource.getRepository('transactions');
    const transactions = await transactionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return { user, sessions, transactions };
  }

  async banUser(userId: string, reason: string, adminId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isBanned = true;
    user.banReason = reason;
    await user.save();

    // Create audit log
    await this.createAuditLog({
      adminId,
      action: 'USER_BANNED',
      entityType: 'user',
      entityId: userId,
      changes: { reason },
    });
  }

  async unbanUser(userId: string, adminId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    user.isBanned = false;
    user.banReason = undefined;
    await user.save();

    // Create audit log
    await this.createAuditLog({
      adminId,
      action: 'USER_UNBANNED',
      entityType: 'user',
      entityId: userId,
    });
  }

  async verifyUser(userId: string, adminId: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.profile) {
      throw new AppError('User profile not found', 400);
    }

    user.profile.verified = true;
    await user.save();

    await this.createAuditLog({
      adminId,
      action: 'USER_VERIFIED',
      entityType: 'user',
      entityId: userId,
    });
  }

  async getAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
    const analyticsRepo = AppDataSource.getRepository('analytics_events');

    let startDate = new Date();
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const events = await analyticsRepo
      .createQueryBuilder('event')
      .where('event.createdAt >= :startDate', { startDate })
      .getMany();

    // Process analytics data
    const pageViews = events.filter((e) => e.eventType === 'page_view').length;
    const uniqueSessions = new Set(events.map((e) => e.sessionId)).size;

    return {
      pageViews,
      uniqueSessions,
      events: events.length,
      period,
    };
  }

  async getAuditLogs(filters: any = {}) {
    const auditRepo = AppDataSource.getRepository('audit_logs');

    const query = auditRepo.createQueryBuilder('log');

    if (filters.adminId) {
      query.where('log.adminId = :adminId', { adminId: filters.adminId });
    }

    if (filters.action) {
      query.andWhere('log.action = :action', { action: filters.action });
    }

    if (filters.entityType) {
      query.andWhere('log.entityType = :entityType', { entityType: filters.entityType });
    }

    const page = filters.page || 1;
    const limit = filters.limit || 50;

    query.skip((page - 1) * limit).take(limit).orderBy('log.createdAt', 'DESC');

    const [logs, total] = await query.getManyAndCount();

    return { logs, total };
  }

  private async createAuditLog(data: any): Promise<void> {
    const auditRepo = AppDataSource.getRepository('audit_logs');
    const log = auditRepo.create({
      ...data,
      createdAt: new Date(),
    });
    await auditRepo.save(log);
  }

  async getPendingApprovals() {
    const [pendingProjects, pendingWithdrawals] = await Promise.all([
      Project.find({ status: ProjectStatus.PENDING_APPROVAL })
        .populate('businessId', 'firstName lastName profile.companyName email')
        .sort({ createdAt: -1 })
        .limit(10),

      // Get pending withdrawals from PostgreSQL
      AppDataSource.getRepository('transactions').find({
        where: { type: 'withdrawal', status: 'pending' },
        order: { createdAt: 'DESC' },
        take: 10,
      }),
    ]);

    return {
      projects: pendingProjects,
      withdrawals: pendingWithdrawals,
    };
  }

  async getPendingWithdrawalsCount(): Promise<number> {
    const transactionRepo = AppDataSource.getRepository('transactions');
    const count = await transactionRepo.count({
      where: { type: 'withdrawal', status: 'pending' },
    });
    return count;
  }

  async approveWithdrawal(withdrawalId: string, adminId: string): Promise<void> {
    const transactionRepo = AppDataSource.getRepository('transactions');

    const withdrawal = await transactionRepo.findOne({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new AppError('Withdrawal not found', 404);
    }

    // Process crypto payment here
    // ...

    await transactionRepo.update(withdrawalId, {
      status: 'completed',
      completedAt: new Date(),
    });

    await this.createAuditLog({
      adminId,
      action: 'WITHDRAWAL_APPROVED',
      entityType: 'transaction',
      entityId: withdrawalId,
    });
  }

  async rejectWithdrawal(
    withdrawalId: string,
    adminId: string,
    reason: string
  ): Promise<void> {
    const transactionRepo = AppDataSource.getRepository('transactions');

    const withdrawal = await transactionRepo.findOne({
      where: { id: withdrawalId },
    });

    if (!withdrawal) {
      throw new AppError('Withdrawal not found', 404);
    }

    // Refund to user wallet
    const user = await User.findById(withdrawal.userId);
    if (user && user.wallet) {
      user.wallet.balance += withdrawal.amount;
      await user.save();
    }

    await transactionRepo.update(withdrawalId, {
      status: 'cancelled',
      metadata: { rejectionReason: reason },
    });

    await this.createAuditLog({
      adminId,
      action: 'WITHDRAWAL_REJECTED',
      entityType: 'transaction',
      entityId: withdrawalId,
      changes: { reason },
    });
  }
}

export default new AdminService();
