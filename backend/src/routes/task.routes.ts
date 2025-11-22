import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth.middleware';
import taskService from '@/services/task/task.service';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tasks (filtered by user role)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { tasks, total } = await taskService.getTasks({
      ...(req.query.projectId && { projectId: req.query.projectId as string }),
      ...(req.query.influencerId && { influencerId: req.query.influencerId as string }),
      ...(req.query.status && { status: req.query.status as any }),
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
    });

    res.json({ tasks, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single task
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    res.json({ task });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Create task (Business only, handled in business routes)
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.createTask({
      ...req.body,
    });

    res.status(201).json({ task });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Update task
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.user!.id,
      req.body
    );

    res.json({ task });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Submit task
router.post('/:id/submit', async (req: AuthRequest, res: Response) => {
  try {
    const task = await taskService.submitTask(
      req.params.id,
      req.user!.id,
      req.body
    );

    res.json({ task });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Review task
router.post('/:id/review', async (req: AuthRequest, res: Response) => {
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

export default router;
