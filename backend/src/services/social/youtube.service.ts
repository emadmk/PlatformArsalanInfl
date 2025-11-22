import axios from 'axios';
import config from '@/config';
import { AppError } from '@/middleware/error.middleware';

interface YouTubeProfile {
  username: string;
  followersCount: number;
  postsCount: number;
  engagementRate: number;
  verified: boolean;
  profileUrl: string;
}

export class YouTubeService {
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  async getProfile(channelId: string): Promise<YouTubeProfile> {
    try {
      // Get channel details
      const channelResponse = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          part: 'snippet,statistics',
          id: channelId,
          key: config.social.youtube.apiKey,
        },
      });

      const channel = channelResponse.data.items[0];

      if (!channel) {
        throw new AppError('Channel not found', 404);
      }

      const stats = channel.statistics;

      // Get recent videos for engagement calculation
      const videosResponse = await axios.get(`${this.baseUrl}/search`, {
        params: {
          part: 'id',
          channelId,
          order: 'date',
          maxResults: 6,
          type: 'video',
          key: config.social.youtube.apiKey,
        },
      });

      const videoIds = videosResponse.data.items
        .map((item: any) => item.id.videoId)
        .join(',');

      const videoStatsResponse = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'statistics',
          id: videoIds,
          key: config.social.youtube.apiKey,
        },
      });

      const engagementRate = this.calculateEngagementRate(
        videoStatsResponse.data.items,
        parseInt(stats.subscriberCount)
      );

      return {
        username: channel.snippet.title,
        followersCount: parseInt(stats.subscriberCount) || 0,
        postsCount: parseInt(stats.videoCount) || 0,
        engagementRate,
        verified: channel.snippet.customUrl ? true : false,
        profileUrl: `https://youtube.com/channel/${channelId}`,
      };
    } catch (error: any) {
      throw new AppError(
        `Failed to fetch YouTube profile: ${error.message}`,
        400
      );
    }
  }

  async getChannelIdByUsername(username: string): Promise<string> {
    try {
      const response = await axios.get(`${this.baseUrl}/channels`, {
        params: {
          part: 'id',
          forUsername: username,
          key: config.social.youtube.apiKey,
        },
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new AppError('Channel not found', 404);
      }

      return response.data.items[0].id;
    } catch (error: any) {
      throw new AppError('Failed to find YouTube channel', 400);
    }
  }

  private calculateEngagementRate(videos: any[], subscriberCount: number): number {
    if (!videos || videos.length === 0 || subscriberCount === 0) return 0;

    const totalEngagement = videos.reduce((sum, video) => {
      const stats = video.statistics;
      const views = parseInt(stats.viewCount) || 0;
      const likes = parseInt(stats.likeCount) || 0;
      const comments = parseInt(stats.commentCount) || 0;
      return sum + views + likes + comments;
    }, 0);

    const avgEngagement = totalEngagement / videos.length;
    return (avgEngagement / subscriberCount) * 100;
  }
}

export default new YouTubeService();
