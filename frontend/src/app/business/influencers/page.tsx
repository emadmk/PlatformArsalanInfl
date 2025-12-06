'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
import api from '@/lib/api';
import {
  Search,
  Users,
  TrendingUp,
  MapPin,
  Filter,
  Instagram,
  Youtube,
  Twitter,
  MessageCircle,
} from 'lucide-react';
import { BusinessNavbar } from '@/components/shared/BusinessNavbar';

interface Influencer {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  profile?: {
    bio?: string;
    location?: string;
    categories?: string[];
    socialMedia?: {
      instagram?: {
        username: string;
        followers: number;
        engagement: number;
      };
      youtube?: {
        username: string;
        followers: number;
        engagement: number;
      };
      twitter?: {
        username: string;
        followers: number;
        engagement: number;
      };
      totalFollowers: number;
      averageEngagement: number;
    };
    verified?: boolean;
  };
}

export default function FindInfluencersPage() {
  const router = useRouter();
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minFollowers, setMinFollowers] = useState('');
  const [maxFollowers, setMaxFollowers] = useState('');
  const [minEngagement, setMinEngagement] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const categories = [
    'all',
    'Fashion',
    'Beauty',
    'Technology',
    'Food',
    'Travel',
    'Fitness',
    'Gaming',
    'Lifestyle',
    'Health',
    'Business',
  ];

  useEffect(() => {
    searchInfluencers();
  }, [page, selectedCategory, minFollowers, maxFollowers, minEngagement]);

  const searchInfluencers = async () => {
    try {
      setLoading(true);
      const filters: any = {
        page,
        limit: 12,
      };

      // Send category as simple string
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      // Send follower filters as simple values
      if (minFollowers) {
        filters.minFollowers = minFollowers;
      }

      if (maxFollowers) {
        filters.maxFollowers = maxFollowers;
      }

      if (minEngagement) {
        filters.minEngagement = minEngagement;
      }

      const { data } = await api.post('/business/influencers/search', filters);
      setInfluencers(data.influencers || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error searching influencers:', error);
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    // useEffect will trigger the search
  };

  const filteredInfluencers = influencers.filter(
    (influencer) =>
      influencer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      influencer.profile?.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatEngagement = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessNavbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Find Influencers</h1>
              <p className="mt-2 text-sm text-gray-600">
                Discover and connect with talented micro-influencers for your campaigns
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full md:w-auto"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search influencers by name or bio..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Followers
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 1000"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Followers
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 100000"
                    value={maxFollowers}
                    onChange={(e) => setMaxFollowers(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Engagement (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 3.5"
                    value={minEngagement}
                    onChange={(e) => setMinEngagement(e.target.value)}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="primary" onClick={handleSearch}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Influencers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredInfluencers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No influencers found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Showing {filteredInfluencers.length} of {total} influencers
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInfluencers.map((influencer) => {
                const socialMedia = influencer.profile?.socialMedia;
                const totalFollowers = socialMedia?.totalFollowers || 0;
                const avgEngagement = socialMedia?.averageEngagement || 0;

                return (
                  <Card
                    key={influencer._id}
                    className="hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => router.push(`/business/influencers/${influencer._id}`)}
                  >
                    <div className="p-6">
                      {/* Profile Header */}
                      <div className="flex items-start mb-4">
                        <div className="relative">
                          {influencer.avatar ? (
                            <img
                              src={influencer.avatar}
                              alt={`${influencer.firstName} ${influencer.lastName}`}
                              className="w-16 h-16 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xl font-semibold">
                              {influencer.firstName.charAt(0)}
                              {influencer.lastName.charAt(0)}
                            </div>
                          )}
                          {influencer.profile?.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
                              <svg
                                className="w-3 h-3 text-white"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {influencer.firstName} {influencer.lastName}
                          </h3>
                          {influencer.profile?.location && (
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              {influencer.profile.location}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {influencer.profile?.bio && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {influencer.profile.bio}
                        </p>
                      )}

                      {/* Categories */}
                      {influencer.profile?.categories &&
                        influencer.profile.categories.length > 0 && (
                          <div className="mb-4 flex flex-wrap gap-2">
                            {influencer.profile.categories.slice(0, 3).map((cat, index) => (
                              <Badge key={index} variant="primary">
                                {cat}
                              </Badge>
                            ))}
                            {influencer.profile.categories.length > 3 && (
                              <Badge variant="gray">
                                +{influencer.profile.categories.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="flex items-center text-gray-500 text-xs mb-1">
                            <Users className="w-3 h-3 mr-1" />
                            Followers
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {formatFollowers(totalFollowers)}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center text-gray-500 text-xs mb-1">
                            <TrendingUp className="w-3 h-3 mr-1" />
                            Engagement
                          </div>
                          <div className="text-lg font-bold text-green-600">
                            {formatEngagement(avgEngagement)}
                          </div>
                        </div>
                      </div>

                      {/* Social Media Links */}
                      <div className="flex gap-2 mb-4">
                        {socialMedia?.instagram && (
                          <div className="flex items-center px-3 py-1 bg-pink-50 text-pink-600 rounded-full text-xs">
                            <Instagram className="w-3 h-3 mr-1" />
                            {formatFollowers(socialMedia.instagram.followers)}
                          </div>
                        )}
                        {socialMedia?.youtube && (
                          <div className="flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-full text-xs">
                            <Youtube className="w-3 h-3 mr-1" />
                            {formatFollowers(socialMedia.youtube.followers)}
                          </div>
                        )}
                        {socialMedia?.twitter && (
                          <div className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs">
                            <Twitter className="w-3 h-3 mr-1" />
                            {formatFollowers(socialMedia.twitter.followers)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/business/influencers/${influencer._id}`);
                          }}
                          className="flex-1"
                        >
                          View Profile
                        </Button>
                        <Button
                          variant="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/business/messages?userId=${influencer._id}`);
                          }}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
                  Previous
                </Button>
                <div className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {Math.ceil(total / 12)}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 12)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
