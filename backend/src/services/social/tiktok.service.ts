import axios from 'axios';
import config from '@/config';
import { AppError } from '@/middleware/error.middleware';

interface TikTokProfile {
  username: string;
  followersCount: number;
  postsCount: number;
  engagementRate: number;
  verified: boolean;
  profileUrl: string;
}

export class TikTokService {
  private baseUrl = 'https://open.tiktokapis.com/v2';

  async getProfile(accessToken: string): Promise<TikTokProfile> {
    try {
      // Get user info
      const userResponse = await axios.get(`${this.baseUrl}/user/info/`, {
        params: {
          fields: 'open_id,union_id,avatar_url,display_name,follower_count,video_count',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const user = userResponse.data.data.user;

      // Get recent videos
      const videosResponse = await axios.post(
        `${this.baseUrl}/video/list/`,
        {
          max_count: 10,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const videos = videosResponse.data.data.videos || [];

      const engagementRate = this.calculateEngagementRate(
        videos,
        user.follower_count
      );

      return {
        username: user.display_name,
        followersCount: user.follower_count || 0,
        postsCount: user.video_count || 0,
        engagementRate,
        verified: user.is_verified || false,
        profileUrl: `https://tiktok.com/@${user.display_name}`,
      };
    } catch (error: any) {
      throw new AppError(
        `Failed to fetch TikTok profile: ${error.message}`,
        400
      );
    }
  }

  async getAuthUrl(redirectUri: string): Promise<string> {
    const params = new URLSearchParams({
      client_key: config.social.tiktok.clientKey!,
      scope: 'user.info.basic,video.list',
      response_type: 'code',
      redirect_uri: redirectUri,
    });

    return `https://www.tiktok.com/auth/authorize/?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<string> {
    try {
      const response = await axios.post(
        'https://open.tiktokapis.com/v2/oauth/token/',
        {
          client_key: config.social.tiktok.clientKey,
          client_secret: config.social.tiktok.clientSecret,
          code,
          grant_type: 'authorization_code',
        }
      );

      return response.data.data.access_token;
    } catch (error: any) {
      throw new AppError('Failed to exchange code for token', 400);
    }
  }

  private calculateEngagementRate(videos: any[], followersCount: number): number {
    if (!videos || videos.length === 0 || followersCount === 0) return 0;

    const totalEngagement = videos.reduce((sum, video) => {
      return sum + video.like_count + video.comment_count + video.share_count;
    }, 0);

    const avgEngagement = totalEngagement / videos.length;
    return (avgEngagement / followersCount) * 100;
  }
}

export default new TikTokService();
