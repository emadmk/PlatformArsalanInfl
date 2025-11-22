import { Router, Response } from 'express';
import { AuthRequest, authenticateToken, requireRole, requireAdminRole } from '@/middleware/auth.middleware';
import adminService from '@/services/admin/admin.service';
import projectService from '@/services/project/project.service';
import { UserRole, AdminRole } from '@shared/types';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken);
router.use(requireRole(UserRole.ADMIN));

// Dashboard stats
router.get('/dashboard', async (req: AuthRequest, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
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

// Projects approval
router.get('/projects/pending', async (req: AuthRequest, res: Response) => {
  try {
    const { projects } = await projectService.getProjects({
      status: 'pending_approval',
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

export default router;
