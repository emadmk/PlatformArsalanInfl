'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { BusinessNavbar } from '@/components/shared/BusinessNavbar';
import api from '@/lib/api';
import {
  ArrowLeft,
  MapPin,
  Users,
  TrendingUp,
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
  Mail,
  Globe,
  CheckCircle,
} from 'lucide-react';

interface Influencer {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  profile?: {
    bio?: string;
    location?: string;
    categories?: string[];
    website?: string;
    socialMedia?: {
      instagram?: { username: string; followers: number; engagement: number };
      youtube?: { username: string; followers: number; engagement: number };
      twitter?: { username: string; followers: number; engagement: number };
      tiktok?: { username: string; followers: number; engagement: number };
      totalFollowers: number;
      averageEngagement: number;
    };
    verified?: boolean;
  };
  createdAt: string;
}

export default function InfluencerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchInfluencer();
    }
  }, [params.id]);

  const fetchInfluencer = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/influencer/${params.id}/profile`);
      setInfluencer(data.user || data.influencer);
    } catch (error) {
      console.error('Error fetching influencer:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count?.toString() || '0';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessNavbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessNavbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Influencer Not Found</h1>
          <p className="text-gray-600 mb-6">The influencer you're looking for doesn't exist.</p>
          <Link href="/business/influencers">
            <Button variant="secondary">Back to Influencers</Button>
          </Link>
        </div>
      </div>
    );
  }

  const socialMedia = influencer.profile?.socialMedia;

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessNavbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Profile Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {influencer.avatar ? (
                  <img
                    src={influencer.avatar}
                    alt={`${influencer.firstName} ${influencer.lastName}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                    {influencer.firstName?.charAt(0)}{influencer.lastName?.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {influencer.firstName} {influencer.lastName}
                  </h1>
                  {influencer.profile?.verified && (
                    <div className="bg-blue-500 rounded-full p-1" title="Verified">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>

                {influencer.profile?.location && (
                  <div className="flex items-center text-gray-500 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {influencer.profile.location}
                  </div>
                )}

                {influencer.profile?.bio && (
                  <p className="text-gray-600 mb-4">{influencer.profile.bio}</p>
                )}

                {/* Categories */}
                {influencer.profile?.categories && influencer.profile.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {influencer.profile.categories.map((cat, i) => (
                      <Badge key={i} variant="primary">{cat}</Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Link href={`/business/messages?userId=${influencer._id}`}>
                    <Button variant="secondary">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </Link>
                  {influencer.profile?.website && (
                    <a href={influencer.profile.website} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-purple-600 mb-2">
                <Users className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatFollowers(socialMedia?.totalFollowers || 0)}
              </p>
              <p className="text-sm text-gray-500">Total Followers</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-green-600 mb-2">
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {(socialMedia?.averageEngagement || 0).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500">Engagement Rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-pink-600 mb-2">
                <Instagram className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatFollowers(socialMedia?.instagram?.followers || 0)}
              </p>
              <p className="text-sm text-gray-500">Instagram</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center text-red-600 mb-2">
                <Youtube className="w-6 h-6" />
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatFollowers(socialMedia?.youtube?.followers || 0)}
              </p>
              <p className="text-sm text-gray-500">YouTube</p>
            </CardContent>
          </Card>
        </div>

        {/* Social Media Details */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {socialMedia?.instagram && (
                <div className="flex items-center justify-between p-4 bg-pink-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <Instagram className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">@{socialMedia.instagram.username}</p>
                      <p className="text-sm text-gray-500">Instagram</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatFollowers(socialMedia.instagram.followers)}</p>
                    <p className="text-sm text-gray-500">{socialMedia.instagram.engagement?.toFixed(1)}% eng.</p>
                  </div>
                </div>
              )}

              {socialMedia?.youtube && (
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Youtube className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">@{socialMedia.youtube.username}</p>
                      <p className="text-sm text-gray-500">YouTube</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatFollowers(socialMedia.youtube.followers)}</p>
                    <p className="text-sm text-gray-500">{socialMedia.youtube.engagement?.toFixed(1)}% eng.</p>
                  </div>
                </div>
              )}

              {socialMedia?.twitter && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Twitter className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">@{socialMedia.twitter.username}</p>
                      <p className="text-sm text-gray-500">Twitter</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatFollowers(socialMedia.twitter.followers)}</p>
                    <p className="text-sm text-gray-500">{socialMedia.twitter.engagement?.toFixed(1)}% eng.</p>
                  </div>
                </div>
              )}

              {!socialMedia?.instagram && !socialMedia?.youtube && !socialMedia?.twitter && (
                <p className="text-center text-gray-500 py-4">No social media accounts linked</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
