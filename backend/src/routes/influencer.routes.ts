import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requireRole } from '@/middleware/auth.middleware';
import { User } from '@/models/User.model';
import { Project } from '@/models/Project.model';
import { Task } from '@/models/Task.model';
import projectService from '@/services/project/project.service';
import taskService from '@/services/task/task.service';
import walletService from '@/services/payment/wallet.service';
import transactionService from '@/services/payment/transaction.service';
import { UserRole, ProjectStatus, TaskStatus } from '@shared/types';

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
      status: 'approved',
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

export default router;
