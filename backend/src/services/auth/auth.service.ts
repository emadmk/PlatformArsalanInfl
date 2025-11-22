import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User, IUser } from '@/models/User.model';
import config from '@/config';
import { AppError } from '@/middleware/error.middleware';
import { UserRole } from '@shared/types';

export class AuthService {
  async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    profile?: any;
  }): Promise<IUser> {
    const existingUser = await User.findOne({ email: userData.email.toLowerCase() });

    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = new User(userData);
    await user.save();

    return user;
  }

  async login(email: string, password: string): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
    requiresTwoFactor: boolean;
  }> {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is inactive', 403);
    }

    if (user.isBanned) {
      throw new AppError(`Account is banned: ${user.banReason}`, 403);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.twoFactorEnabled) {
      return {
        user,
        accessToken: '',
        refreshToken: '',
        requiresTwoFactor: true,
      };
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.lastLogin = new Date();
    await user.save();

    return {
      user,
      accessToken,
      refreshToken,
      requiresTwoFactor: false,
    };
  }

  async verifyTwoFactor(userId: string, token: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await User.findById(userId);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError('Two-factor authentication not enabled', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      throw new AppError('Invalid two-factor code', 401);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    user.lastLogin = new Date();
    await user.save();

    return { accessToken, refreshToken };
  }

  async setupTwoFactor(userId: string): Promise<{
    secret: string;
    qrCode: string;
  }> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const secret = speakeasy.generateSecret({
      name: `${config.twoFactor.issuer} (${user.email})`,
      issuer: config.twoFactor.issuer,
    });

    user.twoFactorSecret = secret.base32;
    await user.save();

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  async enableTwoFactor(userId: string, token: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user || !user.twoFactorSecret) {
      throw new AppError('Two-factor setup not initiated', 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      throw new AppError('Invalid two-factor code', 401);
    }

    user.twoFactorEnabled = true;
    await user.save();
  }

  async disableTwoFactor(userId: string, password: string): Promise<void> {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new AppError('Invalid password', 401);
    }

    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();
  }

  async refreshAccessToken(refreshToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as any;

      const user = await User.findById(decoded.id);

      if (!user || !user.isActive || user.isBanned) {
        throw new AppError('Invalid refresh token', 401);
      }

      return this.generateAccessToken(user);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  private generateAccessToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        adminRole: user.adminRole,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  private generateRefreshToken(user: IUser): string {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }
}

export default new AuthService();
