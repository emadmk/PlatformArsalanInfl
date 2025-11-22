import axios from 'axios';
import config from '@/config';
import { AppError } from '@/middleware/error.middleware';

interface TwitterProfile {
  username: string;
  followersCount: number;
  postsCount: number;
  engagementRate: number;
  verified: boolean;
  profileUrl: string;
}

export class TwitterService {
  private baseUrl = 'https://api.twitter.com/2';

  async getProfile(username: string): Promise<TwitterProfile> {
    try {
      const cleanUsername = username.replace('@', '');

      // Get user by username
      const userResponse = await axios.get(
        `${this.baseUrl}/users/by/username/${cleanUsername}`,
        {
          params: {
            'user.fields': 'public_metrics,verified',
          },
          headers: {
            Authorization: `Bearer ${config.social.twitter.bearerToken}`,
          },
        }
      );

      const user = userResponse.data.data;

      // Get recent tweets
      const tweetsResponse = await axios.get(
        `${this.baseUrl}/users/${user.id}/tweets`,
        {
          params: {
            max_results: 10,
            'tweet.fields': 'public_metrics',
          },
          headers: {
            Authorization: `Bearer ${config.social.twitter.bearerToken}`,
          },
        }
      );

      const engagementRate = this.calculateEngagementRate(
        tweetsResponse.data.data || [],
        user.public_metrics.followers_count
      );

      return {
        username: user.username,
        followersCount: user.public_metrics.followers_count,
        postsCount: user.public_metrics.tweet_count,
        engagementRate,
        verified: user.verified || false,
        profileUrl: `https://twitter.com/${user.username}`,
      };
    } catch (error: any) {
      throw new AppError(
        `Failed to fetch Twitter profile: ${error.message}`,
        400
      );
    }
  }

  private calculateEngagementRate(tweets: any[], followersCount: number): number {
    if (!tweets || tweets.length === 0 || followersCount === 0) return 0;

    const totalEngagement = tweets.reduce((sum, tweet) => {
      const metrics = tweet.public_metrics;
      return (
        sum +
        metrics.retweet_count +
        metrics.reply_count +
        metrics.like_count +
        metrics.quote_count
      );
    }, 0);

    const avgEngagement = totalEngagement / tweets.length;
    return (avgEngagement / followersCount) * 100;
  }
}

export default new TwitterService();
