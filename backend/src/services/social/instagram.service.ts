import axios from 'axios';
import config from '@/config';
import { AppError } from '@/middleware/error.middleware';

interface InstagramProfile {
  username: string;
  followersCount: number;
  postsCount: number;
  engagementRate: number;
  verified: boolean;
  profileUrl: string;
}

export class InstagramService {
  private baseUrl = 'https://graph.instagram.com';
  private apiUrl = 'https://graph.facebook.com/v18.0';

  async getProfile(username: string, accessToken: string): Promise<InstagramProfile> {
    try {
      const response = await axios.get(`${this.baseUrl}/me`, {
        params: {
          fields: 'id,username,account_type,media_count',
          access_token: accessToken,
        },
      });

      const userId = response.data.id;

      // Get followers count (requires business account)
      const insightsResponse = await axios.get(
        `${this.baseUrl}/${userId}/insights`,
        {
          params: {
            metric: 'follower_count,reach,impressions',
            period: 'day',
            access_token: accessToken,
          },
        }
      );

      const followersCount = insightsResponse.data.data.find(
        (metric: any) => metric.name === 'follower_count'
      )?.values[0]?.value || 0;

      // Get recent posts for engagement calculation
      const mediaResponse = await axios.get(`${this.baseUrl}/${userId}/media`, {
        params: {
          fields: 'like_count,comments_count',
          limit: 6,
          access_token: accessToken,
        },
      });

      const engagementRate = this.calculateEngagementRate(
        mediaResponse.data.data,
        followersCount
      );

      return {
        username: response.data.username,
        followersCount,
        postsCount: response.data.media_count || 0,
        engagementRate,
        verified: response.data.account_type === 'BUSINESS',
        profileUrl: `https://instagram.com/${response.data.username}`,
      };
    } catch (error: any) {
      throw new AppError(
        `Failed to fetch Instagram profile: ${error.message}`,
        400
      );
    }
  }

  async verifyAccount(username: string, verificationCode: string): Promise<boolean> {
    try {
      // This would scrape the bio or use official API to verify
      // For now, returning true as placeholder
      return true;
    } catch (error) {
      return false;
    }
  }

  private calculateEngagementRate(posts: any[], followersCount: number): number {
    if (!posts || posts.length === 0 || followersCount === 0) return 0;

    const totalEngagement = posts.reduce((sum, post) => {
      const likes = post.like_count || 0;
      const comments = post.comments_count || 0;
      return sum + likes + comments;
    }, 0);

    const avgEngagement = totalEngagement / posts.length;
    return (avgEngagement / followersCount) * 100;
  }

  async getAuthUrl(redirectUri: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: config.social.instagram.appId!,
      redirect_uri: redirectUri,
      scope: 'user_profile,user_media',
      response_type: 'code',
    });

    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://api.instagram.com/oauth/access_token',
        {
          client_id: config.social.instagram.appId,
          client_secret: config.social.instagram.appSecret,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri,
          code,
        }
      );

      return response.data.access_token;
    } catch (error: any) {
      throw new AppError('Failed to exchange code for token', 400);
    }
  }
}

export default new InstagramService();
