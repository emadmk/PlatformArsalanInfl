import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requireRole } from '@/middleware/auth.middleware';
import projectService from '@/services/project/project.service';
import taskService from '@/services/task/task.service';
import { User } from '@/models/User.model';
import { UserRole } from '@shared/types';

const router = Router();

// All routes require business authentication
router.use(authenticateToken);
router.use(requireRole(UserRole.BUSINESS));

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
