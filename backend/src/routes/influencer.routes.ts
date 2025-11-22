import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requireRole } from '@/middleware/auth.middleware';
import { User } from '@/models/User.model';
import projectService from '@/services/project/project.service';
import taskService from '@/services/task/task.service';
import walletService from '@/services/payment/wallet.service';
import { UserRole } from '@shared/types';

const router = Router();

// All routes require influencer authentication
router.use(authenticateToken);
router.use(requireRole(UserRole.INFLUENCER));

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
    const { projects, total } = await projectService.getProjects({
      appliedInfluencers: req.user!.id,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });

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
