import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requireRole } from '@/middleware/auth.middleware';
import cmsService from '@/services/cms/cms.service';
import { UserRole } from 'shared';

const router = Router();

// Public routes
router.get('/content/:slug', async (req: AuthRequest, res: Response) => {
  try {
    const language = req.query.lang as string || 'en';
    const content = await cmsService.getContentBySlug(req.params.slug, language);

    res.json({ content });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/landing', async (req: AuthRequest, res: Response) => {
  try {
    const language = req.query.lang as string || 'en';
    const content = await cmsService.getLandingPageContent(language);

    res.json({ content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const settings = await cmsService.getSettings();
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Admin routes
router.use(authenticateToken);
router.use(requireRole(UserRole.ADMIN));

router.get('/content', async (req: AuthRequest, res: Response) => {
  try {
    const content = await cmsService.getContent({
      type: req.query.type as any,
      status: req.query.status as any,
    });

    res.json({ content });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/content', async (req: AuthRequest, res: Response) => {
  try {
    const content = await cmsService.createContent(req.body, req.user!.id);
    res.status(201).json({ content });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.get('/content/id/:id', async (req: AuthRequest, res: Response) => {
  try {
    const content = await cmsService.getContentById(req.params.id);
    res.json({ content });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.put('/content/:id', async (req: AuthRequest, res: Response) => {
  try {
    const content = await cmsService.updateContent(
      req.params.id,
      req.body,
      req.user!.id
    );

    res.json({ content });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.delete('/content/:id', async (req: AuthRequest, res: Response) => {
  try {
    await cmsService.deleteContent(req.params.id);
    res.json({ message: 'Content deleted' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.post('/content/:id/publish', async (req: AuthRequest, res: Response) => {
  try {
    const content = await cmsService.publishContent(req.params.id);
    res.json({ content });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

router.put('/settings', async (req: AuthRequest, res: Response) => {
  try {
    const settings = await cmsService.updateSettings(req.body, req.user!.id);
    res.json({ settings });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

export default router;
