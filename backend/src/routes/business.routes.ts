import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requireRole } from '@/middleware/auth.middleware';
import projectService from '@/services/project/project.service';
import taskService from '@/services/task/task.service';
import transactionService from '@/services/payment/transaction.service';
import { User } from '@/models/User.model';
import { Project } from '@/models/Project.model';
import { Task } from '@/models/Task.model';
import { UserRole, ProjectStatus, TaskStatus } from '@shared/types';

const router = Router();

// All routes require business authentication
router.use(authenticateToken);
router.use(requireRole(UserRole.BUSINESS));

// Dashboard Stats
router.get('/dashboard/stats', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Count active campaigns
    const activeCampaigns = await Project.countDocuments({
      businessId: userId,
      status: { $in: [ProjectStatus.ACTIVE, ProjectStatus.IN_PROGRESS] },
    });

    // Count total unique influencers worked with
    const projects = await Project.find({ businessId: userId });
    const uniqueInfluencers = new Set();
    projects.forEach((project: any) => {
      project.acceptedInfluencers?.forEach((inf: any) => uniqueInfluencers.add(inf.toString()));
    });
    const totalInfluencers = uniqueInfluencers.size;

    // Count completed projects
    const completedProjects = await Project.countDocuments({
      businessId: userId,
      status: ProjectStatus.COMPLETED,
    });

    // Calculate total spent
    const { transactions } = await transactionService.getTransactions(userId);
    const totalSpent = transactions
      .filter((t: any) => t.type === 'debit' && t.status === 'completed')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    res.json({
      activeCampaigns,
      totalInfluencers,
      completedProjects,
      totalSpent,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Projects
router.post('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectService.createProject(req.user!.id, req.body);
    res.status(201).json({ project });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const { projects, total } = await projectService.getProjects({
      businessId: req.user!.id,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });

    res.json({ projects, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectService.updateProject(
      req.params.id,
      req.user!.id,
      req.body
    );

    res.json({ project });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.delete('/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    await projectService.deleteProject(req.params.id, req.user!.id);
    res.json({ message: 'Project deleted' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Accept/Reject Influencer
router.post(
  '/projects/:projectId/influencers/:influencerId/accept',
  async (req: AuthRequest, res: Response) => {
    try {
      const project = await projectService.acceptInfluencer(
        req.params.projectId,
        req.user!.id,
        req.params.influencerId
      );

      res.json({ project });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
);

router.post(
  '/projects/:projectId/influencers/:influencerId/reject',
  async (req: AuthRequest, res: Response) => {
    try {
      const project = await projectService.rejectInfluencer(
        req.params.projectId,
        req.user!.id,
        req.params.influencerId
      );

      res.json({ project });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
);

// Tasks
router.get('/tasks', async (req: AuthRequest, res: Response) => {
  try {
    const { tasks, total } = await taskService.getTasks({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });

    res.json({ tasks, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/tasks/:id/review', async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.reviewTask(
      req.params.id,
      req.user!.id,
      req.body
    );

    res.json({ task });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get Influencers working with business
router.get('/influencers', async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // Get all projects for this business
    const projects = await Project.find({ businessId: userId })
      .populate('acceptedInfluencers', 'firstName lastName avatar profile')
      .select('acceptedInfluencers status');

    // Collect unique influencers with their data
    const influencerMap = new Map();

    for (const project of projects as any[]) {
      if (project.acceptedInfluencers) {
        for (const influencer of project.acceptedInfluencers) {
          if (!influencerMap.has(influencer._id.toString())) {
            // Get tasks count for this influencer
            const tasksCount = await Task.countDocuments({
              influencerId: influencer._id,
              projectId: { $in: projects.map(p => p._id) },
            });

            const completedTasks = await Task.countDocuments({
              influencerId: influencer._id,
              projectId: { $in: projects.map(p => p._id) },
              status: TaskStatus.COMPLETED,
            });

            influencerMap.set(influencer._id.toString(), {
              id: influencer._id,
              name: `${influencer.firstName} ${influencer.lastName}`,
              avatar: influencer.avatar,
              category: influencer.profile?.categories?.[0] || 'General',
              followers: influencer.profile?.socialMedia?.totalFollowers || 0,
              engagement: influencer.profile?.socialMedia?.averageEngagement || 0,
              status: completedTasks > 0 ? 'active' : 'pending',
              tasksCompleted: completedTasks,
              totalTasks: tasksCount,
            });
          }
        }
      }
    }

    const allInfluencers = Array.from(influencerMap.values());
    const total = allInfluencers.length;
    const paginatedInfluencers = allInfluencers.slice((page - 1) * limit, page * limit);

    res.json({ influencers: paginatedInfluencers, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Search Influencers
router.post('/influencers/search', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, ...filters } = req.body;

    const users = await User.find({
      role: 'influencer',
      'profile.verified': true,
      ...filters,
    })
      .select('-password -twoFactorSecret')
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({
      role: 'influencer',
      'profile.verified': true,
      ...filters,
    });

    res.json({ influencers: users, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
