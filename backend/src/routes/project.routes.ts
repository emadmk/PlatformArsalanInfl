import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requireRole } from '@/middleware/auth.middleware';
import projectService from '@/services/project/project.service';
import { UserRole } from '@shared/types';

const router = Router();

// Public: Browse all approved projects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { projects, total } = await projectService.getProjects({
      status: 'approved',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 20,
      category: req.query.category as string,
      search: req.query.search as string,
    });

    res.json({ projects, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single project
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json({ project });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Search projects
router.post('/search', async (req: AuthRequest, res: Response) => {
  try {
    const { projects, total } = await projectService.searchProjects(req.body);
    res.json({ projects, total });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Apply to project (Influencer only)
router.post(
  '/:id/apply',
  authenticateToken,
  requireRole(UserRole.INFLUENCER),
  async (req: AuthRequest, res: Response) => {
    try {
      const project = await projectService.applyToProject(
        req.params.id,
        req.user!.id
      );

      res.json({ message: 'Application submitted', project });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
);

export default router;
