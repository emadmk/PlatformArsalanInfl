import { CMSContent, PlatformSettings, ICMSContent } from '@/models/CMS.model';
import { AppError } from '@/middleware/error.middleware';
import { CMSContentType, ContentStatus } from 'shared';

export class CMSService {
  async createContent(data: Partial<ICMSContent>, createdBy: string): Promise<ICMSContent> {
    const content = new CMSContent({
      ...data,
      createdBy,
    });

    await content.save();

    return content;
  }

  async getContent(filters: {
    type?: CMSContentType;
    status?: ContentStatus;
    slug?: string;
  } = {}): Promise<ICMSContent[]> {
    const query: any = {};

    if (filters.type) query.type = filters.type;
    if (filters.status) query.status = filters.status;
    if (filters.slug) query.slug = filters.slug;

    return CMSContent.find(query).sort({ order: 1, createdAt: -1 });
  }

  async getContentById(contentId: string): Promise<ICMSContent> {
    const content = await CMSContent.findById(contentId);

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    return content;
  }

  async getContentBySlug(slug: string, language: string = 'en'): Promise<any> {
    const content = await CMSContent.findOne({ slug, isActive: true });

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    // Return translated content
    return {
      id: content._id,
      type: content.type,
      slug: content.slug,
      title: content.title[language] || content.title['en'],
      content: content.content[language] || content.content['en'],
      excerpt: content.excerpt?.[language] || content.excerpt?.['en'],
      images: content.images,
      metadata: content.metadata,
      seo: content.seo,
    };
  }

  async updateContent(
    contentId: string,
    updates: Partial<ICMSContent>,
    updatedBy: string
  ): Promise<ICMSContent> {
    const content = await CMSContent.findById(contentId);

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    Object.assign(content, updates);
    content.updatedBy = updatedBy as any;

    await content.save();

    return content;
  }

  async deleteContent(contentId: string): Promise<void> {
    const content = await CMSContent.findById(contentId);

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    await content.deleteOne();
  }

  async publishContent(contentId: string): Promise<ICMSContent> {
    const content = await CMSContent.findById(contentId);

    if (!content) {
      throw new AppError('Content not found', 404);
    }

    content.status = ContentStatus.PUBLISHED;
    content.publishedAt = new Date();

    await content.save();

    return content;
  }

  async getSettings(): Promise<any> {
    let settings = await PlatformSettings.findOne();

    if (!settings) {
      // Create default settings
      settings = new PlatformSettings({
        general: {
          siteName: new Map([['en', 'Micro Influencer Platform']]),
          siteDescription: new Map([
            ['en', 'Connect with micro influencers for your marketing campaigns'],
          ]),
          defaultLanguage: 'en',
          supportedLanguages: ['en', 'fa', 'fr', 'es', 'ar', 'de', 'pt', 'zh', 'ko', 'ja'],
          maintenanceMode: false,
        },
        commission: {
          defaultRate: 20,
          minimumWithdrawal: 10,
          withdrawalFee: 0,
        },
        registration: {
          influencerMinFollowers: new Map([
            ['instagram', 1000],
            ['facebook', 1000],
            ['twitter', 1000],
            ['youtube', 1000],
            ['tiktok', 1000],
          ]),
          requireEmailVerification: true,
          requireAdminApproval: false,
        },
        notifications: {
          emailEnabled: true,
          pushEnabled: true,
          smsEnabled: false,
        },
        security: {
          maxLoginAttempts: 5,
          loginAttemptWindow: 900,
          sessionTimeout: 86400,
          require2FA: false,
        },
      });

      await settings.save();
    }

    return settings;
  }

  async updateSettings(updates: any, updatedBy: string): Promise<any> {
    let settings = await PlatformSettings.findOne();

    if (!settings) {
      settings = new PlatformSettings({});
    }

    Object.assign(settings, updates);
    settings.updatedBy = updatedBy as any;

    await settings.save();

    return settings;
  }

  async getLandingPageContent(language: string = 'en'): Promise<any> {
    const sections = await CMSContent.find({
      type: { $in: [CMSContentType.SECTION, CMSContentType.BANNER, CMSContentType.TESTIMONIAL] },
      status: ContentStatus.PUBLISHED,
      isActive: true,
    }).sort({ order: 1 });

    return sections.map((section) => ({
      id: section._id,
      type: section.type,
      title: section.title[language] || section.title['en'],
      content: section.content[language] || section.content['en'],
      images: section.images,
      metadata: section.metadata,
    }));
  }
}

export default new CMSService();
