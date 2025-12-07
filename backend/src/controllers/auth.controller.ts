import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import authService from '@/services/auth/auth.service';
import { User } from '@/models/User.model';
import { UserRole } from 'shared';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { fullName, firstName: providedFirstName, lastName: providedLastName, ...rest } = req.body;

      let firstName = providedFirstName;
      let lastName = providedLastName;

      // If firstName/lastName not provided, try to split fullName
      if (!firstName && fullName) {
        const nameParts = fullName.trim().split(/\s+/) || [];
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';
      }

      // Ensure we have values
      if (!firstName) {
        res.status(400).json({ error: 'First name is required' });
        return;
      }
      if (!lastName) {
        lastName = firstName; // Use firstName as lastName if not provided
      }

      const user = await authService.register({
        ...rest,
        firstName,
        lastName,
      });

      res.status(201).json({
        message: 'User registered successfully',
        user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  }

  async registerInfluencer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.register({
        ...req.body,
        role: UserRole.INFLUENCER,
      });

      res.status(201).json({
        message: 'Influencer registered successfully',
        user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  }

  async registerBusiness(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await authService.register({
        ...req.body,
        role: UserRole.BUSINESS,
      });

      res.status(201).json({
        message: 'Business registered successfully',
        user,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      if (result.requiresTwoFactor) {
        res.json({
          message: 'Two-factor authentication required',
          requiresTwoFactor: true,
          userId: result.user._id,
        });
        return;
      }

      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  }

  async verifyTwoFactor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId, token } = req.body;

      const tokens = await authService.verifyTwoFactor(userId, token);

      const user = await User.findById(userId);

      res.json({
        message: 'Two-factor verification successful',
        user,
        ...tokens,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  }

  async setupTwoFactor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await authService.setupTwoFactor(req.user!.id);

      res.json({
        message: 'Two-factor authentication setup initiated',
        ...result,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  }

  async enableTwoFactor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      await authService.enableTwoFactor(req.user!.id, token);

      res.json({
        message: 'Two-factor authentication enabled successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  }

  async disableTwoFactor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { password } = req.body;

      await authService.disableTwoFactor(req.user!.id, password);

      res.json({
        message: 'Two-factor authentication disabled successfully',
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  }

  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const accessToken = await authService.refreshAccessToken(refreshToken);

      res.json({
        accessToken,
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        error: error.message,
      });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user!.id);

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
      });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    // Implement token blacklisting if needed
    res.json({
      message: 'Logout successful',
    });
  }

  async forgotPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      // Find user by email (but don't reveal if they exist)
      const user = await User.findOne({ email: email.toLowerCase() });

      // Always return success (security best practice to prevent email enumeration)
      // In production, implement actual email sending here

      if (user) {
        // TODO: Generate reset token, save to user, send email
        // For now, just log it
        console.log(`Password reset requested for: ${email}`);
      }

      res.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    } catch (error: any) {
      // Even on error, return success message
      res.json({
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }
  }

  async resetPassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      // TODO: Implement actual token verification and password reset
      // For now, return an error

      res.status(400).json({
        error: 'Password reset functionality is not yet configured. Please contact support.',
      });
    } catch (error: any) {
      res.status(500).json({
        error: error.message,
      });
    }
  }
}
