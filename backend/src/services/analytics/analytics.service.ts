import { AppDataSource } from '@/config/database';
import { Request } from 'express';

export class AnalyticsService {
  async trackEvent(data: {
    userId?: string;
    sessionId?: string;
    eventType: string;
    eventName: string;
    pageUrl?: string;
    referrer?: string;
    metadata?: any;
    req?: Request;
  }): Promise<void> {
    try {
      const analyticsRepo = AppDataSource.getRepository('analytics_events');

      const event = analyticsRepo.create({
        userId: data.userId,
        sessionId: data.sessionId,
        eventType: data.eventType,
        eventName: data.eventName,
        pageUrl: data.pageUrl,
        referrer: data.referrer,
        metadata: data.metadata,
        ...(data.req && {
          ipAddress: this.getIpAddress(data.req),
          userAgent: data.req.headers['user-agent'],
          ...this.parseUserAgent(data.req.headers['user-agent'] || ''),
        }),
        createdAt: new Date(),
      });

      await analyticsRepo.save(event);
    } catch (error) {
      console.error('Failed to track event:', error);
    }
  }

  async trackPageView(
    userId: string | undefined,
    sessionId: string,
    pageUrl: string,
    req: Request
  ): Promise<void> {
    await this.trackEvent({
      userId,
      sessionId,
      eventType: 'page_view',
      eventName: 'Page View',
      pageUrl,
      referrer: req.headers.referer,
      req,
    });
  }

  async createSession(data: {
    userId: string;
    sessionToken: string;
    refreshToken?: string;
    req: Request;
  }): Promise<void> {
    try {
      const sessionRepo = AppDataSource.getRepository('user_sessions');

      const session = sessionRepo.create({
        userId: data.userId,
        sessionToken: data.sessionToken,
        refreshToken: data.refreshToken,
        ipAddress: this.getIpAddress(data.req),
        userAgent: data.req.headers['user-agent'],
        ...this.parseUserAgent(data.req.headers['user-agent'] || ''),
        lastActivity: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
      });

      await sessionRepo.save(session);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  }

  async updateSessionActivity(sessionToken: string): Promise<void> {
    try {
      const sessionRepo = AppDataSource.getRepository('user_sessions');

      await sessionRepo.update(
        { sessionToken },
        { lastActivity: new Date() }
      );
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }

  async endSession(sessionToken: string): Promise<void> {
    try {
      const sessionRepo = AppDataSource.getRepository('user_sessions');

      await sessionRepo.update(
        { sessionToken },
        { isActive: false }
      );
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  async getUserSessions(userId: string): Promise<any[]> {
    const sessionRepo = AppDataSource.getRepository('user_sessions');

    return sessionRepo.find({
      where: { userId, isActive: true },
      order: { lastActivity: 'DESC' },
    });
  }

  async getAnalytics(startDate: Date, endDate: Date): Promise<any> {
    const analyticsRepo = AppDataSource.getRepository('analytics_events');

    const events = await analyticsRepo
      .createQueryBuilder('event')
      .where('event.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .getMany();

    const pageViews = events.filter((e) => e.eventType === 'page_view').length;
    const uniqueVisitors = new Set(events.map((e) => e.userId || e.sessionId)).size;
    const uniqueSessions = new Set(events.map((e) => e.sessionId)).size;

    // Group by page
    const pageStats: any = {};
    events
      .filter((e) => e.eventType === 'page_view' && e.pageUrl)
      .forEach((e) => {
        const page = e.pageUrl!;
        if (!pageStats[page]) {
          pageStats[page] = 0;
        }
        pageStats[page]++;
      });

    // Top pages
    const topPages = Object.entries(pageStats)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 10)
      .map(([page, count]) => ({ page, count }));

    return {
      totalEvents: events.length,
      pageViews,
      uniqueVisitors,
      uniqueSessions,
      topPages,
    };
  }

  private getIpAddress(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      ''
    );
  }

  private parseUserAgent(userAgent: string): {
    deviceType: string;
    browser: string;
    os: string;
  } {
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);

    let browser = 'Unknown';
    if (/chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent)) browser = 'Safari';
    else if (/edge/i.test(userAgent)) browser = 'Edge';

    let os = 'Unknown';
    if (/windows/i.test(userAgent)) os = 'Windows';
    else if (/mac/i.test(userAgent)) os = 'MacOS';
    else if (/linux/i.test(userAgent)) os = 'Linux';
    else if (/android/i.test(userAgent)) os = 'Android';
    else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS';

    return {
      deviceType: isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop',
      browser,
      os,
    };
  }
}

export default new AnalyticsService();
