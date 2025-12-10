'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { BusinessNavbar } from '@/components/shared/BusinessNavbar';
import api from '@/lib/api';

interface Influencer {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  socialMediaProfiles?: {
    instagram?: { username: string; followers: number };
    tiktok?: { username: string; followers: number };
    youtube?: { username: string; subscribers: number };
  };
}

interface HotOffer {
  _id: string;
  influencerId: Influencer;
  title: string;
  description: string;
  targetCategories: string[];
  targetBrands: string[];
  equipment: string[];
  languages: string[];
  scenarioSummary: string;
  contentTypes: string[];
  platforms: string[];
  price: number;
  deliveryTime: number;
  status: string;
  viewCount: number;
  createdAt: string;
}

const CATEGORIES = [
  'Fashion & Beauty',
  'Technology',
  'Food & Cooking',
  'Fitness & Health',
  'Travel',
  'Gaming',
  'Lifestyle',
  'Education',
  'Entertainment',
  'Business & Finance',
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook', 'LinkedIn'];

export default function BusinessOffersPage() {
  const [offers, setOffers] = useState<HotOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOffer, setSelectedOffer] = useState<HotOffer | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    platform: '',
    minPrice: '',
    maxPrice: '',
  });
  const [expressInterestLoading, setExpressInterestLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, [filters.category, filters.platform]);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.platform) params.append('platform', filters.platform);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const { data } = await api.get(`/offers?${params.toString()}`);
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpressInterest = async (offerId: string) => {
    setExpressInterestLoading(offerId);
    try {
      await api.post(`/offers/${offerId}/interest`);
      alert('Interest expressed! The influencer will be notified.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to express interest');
    } finally {
      setExpressInterestLoading(null);
    }
  };

  const formatFollowers = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading && offers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessNavbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessNavbar />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold">Hot Offers!</h1>
          <p className="text-orange-100 mt-1">Browse exclusive offers from top influencers</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
                <select
                  value={filters.platform}
                  onChange={(e) => setFilters(prev => ({ ...prev, platform: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                >
                  <option value="">All Platforms</option>
                  {PLATFORMS.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  placeholder="Min $"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 bg-white"
                  placeholder="Max $"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={fetchOffers} className="bg-orange-500 hover:bg-orange-600">
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Offers Grid */}
        {offers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Offers Found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later for new offers.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offers.map((offer) => (
              <Card key={offer._id} hover className="cursor-pointer" onClick={() => setSelectedOffer(offer)}>
                <CardContent className="p-6">
                  {/* Influencer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    {offer.influencerId?.avatar ? (
                      <img
                        src={offer.influencerId.avatar}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold">
                        {offer.influencerId?.firstName?.charAt(0)}{offer.influencerId?.lastName?.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {offer.influencerId?.firstName} {offer.influencerId?.lastName}
                      </h4>
                      {offer.influencerId?.socialMediaProfiles?.instagram && (
                        <p className="text-sm text-gray-500">
                          {formatFollowers(offer.influencerId.socialMediaProfiles.instagram.followers)} followers
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Offer Title & Price */}
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 line-clamp-2">{offer.title}</h3>
                    <p className="text-xl font-bold text-green-600 ml-2">${offer.price}</p>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">{offer.description}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {offer.targetCategories.slice(0, 2).map((cat) => (
                      <Badge key={cat} variant="primary" className="text-xs">{cat}</Badge>
                    ))}
                    {offer.platforms.slice(0, 2).map((platform) => (
                      <Badge key={platform} variant="info" className="text-xs">{platform}</Badge>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-gray-500">{offer.deliveryTime} days delivery</span>
                    <span className="text-sm text-gray-500">{offer.viewCount} views</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedOffer(null)}>
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              {/* Influencer Header */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b">
                {selectedOffer.influencerId?.avatar ? (
                  <img
                    src={selectedOffer.influencerId.avatar}
                    alt=""
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-xl">
                    {selectedOffer.influencerId?.firstName?.charAt(0)}{selectedOffer.influencerId?.lastName?.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedOffer.influencerId?.firstName} {selectedOffer.influencerId?.lastName}
                  </h3>
                  <div className="flex gap-4 mt-1 text-sm text-gray-500">
                    {selectedOffer.influencerId?.socialMediaProfiles?.instagram && (
                      <span>IG: {formatFollowers(selectedOffer.influencerId.socialMediaProfiles.instagram.followers)}</span>
                    )}
                    {selectedOffer.influencerId?.socialMediaProfiles?.tiktok && (
                      <span>TikTok: {formatFollowers(selectedOffer.influencerId.socialMediaProfiles.tiktok.followers)}</span>
                    )}
                    {selectedOffer.influencerId?.socialMediaProfiles?.youtube && (
                      <span>YT: {formatFollowers(selectedOffer.influencerId.socialMediaProfiles.youtube.subscribers)}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">${selectedOffer.price}</p>
                  <p className="text-sm text-gray-500">{selectedOffer.deliveryTime} days</p>
                </div>
              </div>

              {/* Offer Details */}
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedOffer.title}</h2>
              <p className="text-gray-700 mb-6">{selectedOffer.description}</p>

              {/* Categories & Platforms */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Target Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOffer.targetCategories.map((cat) => (
                      <Badge key={cat} variant="primary">{cat}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Platforms</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOffer.platforms.map((platform) => (
                      <Badge key={platform} variant="info">{platform}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content Types & Equipment */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Content Types</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOffer.contentTypes.map((type) => (
                      <Badge key={type} variant="gray">{type}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Equipment</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOffer.equipment.map((eq) => (
                      <Badge key={eq} variant="success">{eq}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Languages */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-2">Languages</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedOffer.languages.map((lang) => (
                    <Badge key={lang} variant="warning">{lang}</Badge>
                  ))}
                </div>
              </div>

              {/* Scenario Summary */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">Scenario Summary</h4>
                <p className="text-gray-700">{selectedOffer.scenarioSummary}</p>
              </div>

              {/* Target Brands */}
              {selectedOffer.targetBrands && selectedOffer.targetBrands.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Ideal for Brands</h4>
                  <p className="text-gray-700">{selectedOffer.targetBrands.join(', ')}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedOffer(null)}
                >
                  Close
                </Button>
                <Link href={`/business/messages?userId=${selectedOffer.influencerId?._id}`} className="flex-1">
                  <Button className="w-full bg-blue-500 hover:bg-blue-600">
                    Chat with Influencer
                  </Button>
                </Link>
                <Button
                  className="flex-1 bg-orange-500 hover:bg-orange-600"
                  onClick={() => handleExpressInterest(selectedOffer._id)}
                  isLoading={expressInterestLoading === selectedOffer._id}
                >
                  Express Interest
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
