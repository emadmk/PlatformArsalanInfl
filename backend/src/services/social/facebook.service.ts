import axios from 'axios';
import config from '@/config';
import { AppError } from '@/middleware/error.middleware';

interface FacebookProfile {
  username: string;
  followersCount: number;
  postsCount: number;
  engagementRate: number;
  verified: boolean;
  profileUrl: string;
}

export class FacebookService {
  private baseUrl = 'https://graph.facebook.com/v18.0';

  async getProfile(pageId: string, accessToken: string): Promise<FacebookProfile> {
    try {
      // Get page info
      const pageResponse = await axios.get(`${this.baseUrl}/${pageId}`, {
        params: {
          fields: 'name,username,fan_count,verification_status',
          access_token: accessToken,
        },
      });

      const page = pageResponse.data;

      // Get recent posts
      const postsResponse = await axios.get(`${this.baseUrl}/${pageId}/posts`, {
        params: {
          fields: 'reactions.summary(true),comments.summary(true),shares',
          limit: 10,
          access_token: accessToken,
        },
      });

      const posts = postsResponse.data.data || [];

      const engagementRate = this.calculateEngagementRate(
        posts,
        page.fan_count
      );

      return {
        username: page.username || page.name,
        followersCount: page.fan_count || 0,
        postsCount: posts.length,
        engagementRate,
        verified: page.verification_status === 'blue_verified',
        profileUrl: `https://facebook.com/${page.username || page.id}`,
      };
    } catch (error: any) {
      throw new AppError(
        `Failed to fetch Facebook profile: ${error.message}`,
        400
      );
    }
  }

  async getAuthUrl(redirectUri: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: config.social.facebook.appId!,
      redirect_uri: redirectUri,
      scope: 'pages_show_list,pages_read_engagement,pages_read_user_content',
      response_type: 'code',
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/oauth/access_token`, {
        params: {
          client_id: config.social.facebook.appId,
          client_secret: config.social.facebook.appSecret,
          redirect_uri: redirectUri,
          code,
        },
      });

      return response.data.access_token;
    } catch (error: any) {
      throw new AppError('Failed to exchange code for token', 400);
    }
  }

  private calculateEngagementRate(posts: any[], followersCount: number): number {
    if (!posts || posts.length === 0 || followersCount === 0) return 0;

    const totalEngagement = posts.reduce((sum, post) => {
      const reactions = post.reactions?.summary?.total_count || 0;
      const comments = post.comments?.summary?.total_count || 0;
      const shares = post.shares?.count || 0;
      return sum + reactions + comments + shares;
    }, 0);

    const avgEngagement = totalEngagement / posts.length;
    return (avgEngagement / followersCount) * 100;
  }
}

export default new FacebookService();
