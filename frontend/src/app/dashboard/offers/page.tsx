'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { DashboardNavbar } from '@/components/shared/DashboardNavbar';
import api from '@/lib/api';

interface HotOffer {
  _id: string;
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
  interestedBusinesses: string[];
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
  'Other'
];

const CONTENT_TYPES = [
  'Instagram Reels',
  'Instagram Stories',
  'Instagram Post',
  'TikTok Video',
  'YouTube Video',
  'YouTube Shorts',
  'Twitter/X Post',
  'Blog Post',
  'Podcast Mention',
  'Live Stream'
];

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Twitter/X', 'Facebook', 'LinkedIn', 'Other'];

const EQUIPMENT = [
  'Professional Camera',
  'Ring Light',
  'Microphone',
  'Studio Setup',
  'Green Screen',
  'Drone',
  'Editing Software',
  'Smartphone Only'
];

const LANGUAGES = ['English', 'Spanish', 'French', 'German', 'Persian', 'Arabic', 'Chinese', 'Japanese', 'Korean', 'Other'];

export default function InfluencerOffersPage() {
  const [offers, setOffers] = useState<HotOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState<HotOffer | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetCategories: [] as string[],
    targetBrands: '',
    equipment: [] as string[],
    languages: [] as string[],
    scenarioSummary: '',
    contentTypes: [] as string[],
    platforms: [] as string[],
    price: '',
    deliveryTime: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const { data } = await api.get('/offers/my-offers');
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArrayToggle = (field: 'targetCategories' | 'equipment' | 'languages' | 'contentTypes' | 'platforms', value: string) => {
    setFormData(prev => {
      const arr = prev[field];
      if (arr.includes(value)) {
        return { ...prev, [field]: arr.filter(v => v !== value) };
      }
      return { ...prev, [field]: [...arr, value] };
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetCategories: [],
      targetBrands: '',
      equipment: [],
      languages: [],
      scenarioSummary: '',
      contentTypes: [],
      platforms: [],
      price: '',
      deliveryTime: '',
    });
    setEditingOffer(null);
  };

  const openEditModal = (offer: HotOffer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      targetCategories: offer.targetCategories,
      targetBrands: offer.targetBrands?.join(', ') || '',
      equipment: offer.equipment,
      languages: offer.languages,
      scenarioSummary: offer.scenarioSummary,
      contentTypes: offer.contentTypes,
      platforms: offer.platforms,
      price: offer.price.toString(),
      deliveryTime: offer.deliveryTime.toString(),
    });
    setShowCreateModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        targetBrands: formData.targetBrands.split(',').map(b => b.trim()).filter(Boolean),
        price: parseFloat(formData.price),
        deliveryTime: parseInt(formData.deliveryTime),
      };

      if (editingOffer) {
        await api.put(`/offers/${editingOffer._id}`, payload);
      } else {
        await api.post('/offers', payload);
      }

      setShowCreateModal(false);
      resetForm();
      fetchOffers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;

    try {
      await api.delete(`/offers/${offerId}`);
      fetchOffers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete offer');
    }
  };

  const handleStatusToggle = async (offer: HotOffer) => {
    try {
      const newStatus = offer.status === 'active' ? 'paused' : 'active';
      await api.put(`/offers/${offer._id}`, { status: newStatus });
      fetchOffers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update offer status');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
      active: 'success',
      paused: 'warning',
      closed: 'danger',
      expired: 'gray',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Hot Offers</h1>
              <p className="text-orange-100 mt-1">Create and manage your offers for businesses</p>
            </div>
            <Button
              onClick={() => { resetForm(); setShowCreateModal(true); }}
              className="bg-white text-orange-600 hover:bg-orange-50"
            >
              + Create New Offer
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{offers.length}</p>
              <p className="text-sm text-gray-600">Total Offers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{offers.filter(o => o.status === 'active').length}</p>
              <p className="text-sm text-gray-600">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{offers.reduce((sum, o) => sum + o.viewCount, 0)}</p>
              <p className="text-sm text-gray-600">Total Views</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">{offers.reduce((sum, o) => sum + o.interestedBusinesses.length, 0)}</p>
              <p className="text-sm text-gray-600">Interested Businesses</p>
            </CardContent>
          </Card>
        </div>

        {/* Offers List */}
        {offers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Offers Yet</h3>
              <p className="text-gray-600 mb-4">Create your first offer to attract businesses</p>
              <Button onClick={() => setShowCreateModal(true)}>Create Your First Offer</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {offers.map((offer) => (
              <Card key={offer._id} hover>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{offer.title}</h3>
                        {getStatusBadge(offer.status)}
                      </div>
                      <p className="text-gray-600 line-clamp-2">{offer.description}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-green-600">${offer.price}</p>
                      <p className="text-sm text-gray-500">{offer.deliveryTime} days delivery</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {offer.targetCategories.map((cat) => (
                      <Badge key={cat} variant="primary">{cat}</Badge>
                    ))}
                    {offer.platforms.map((platform) => (
                      <Badge key={platform} variant="info">{platform}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {offer.viewCount} views
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {offer.interestedBusinesses.length} interested
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusToggle(offer)}
                      >
                        {offer.status === 'active' ? 'Pause' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(offer)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDelete(offer._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingOffer ? 'Edit Offer' : 'Create New Offer'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                    placeholder="e.g., Professional Product Review Video"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                    rows={3}
                    placeholder="Describe your offer in detail..."
                    required
                  />
                </div>

                {/* Target Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Categories *</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleArrayToggle('targetCategories', cat)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.targetCategories.includes(cat)
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Brands */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Brands (optional)</label>
                  <input
                    type="text"
                    value={formData.targetBrands}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetBrands: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                    placeholder="e.g., Nike, Apple, Samsung (comma separated)"
                  />
                </div>

                {/* Platforms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Platforms *</label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handleArrayToggle('platforms', platform)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.platforms.includes(platform)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content Types *</label>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleArrayToggle('contentTypes', type)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.contentTypes.includes(type)
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Equipment Available</label>
                  <div className="flex flex-wrap gap-2">
                    {EQUIPMENT.map((eq) => (
                      <button
                        key={eq}
                        type="button"
                        onClick={() => handleArrayToggle('equipment', eq)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.equipment.includes(eq)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {eq}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Languages *</label>
                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleArrayToggle('languages', lang)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          formData.languages.includes(lang)
                            ? 'bg-indigo-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scenario Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scenario Summary *</label>
                  <textarea
                    value={formData.scenarioSummary}
                    onChange={(e) => setFormData(prev => ({ ...prev, scenarioSummary: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                    rows={3}
                    placeholder="Describe your content creation idea and approach..."
                    required
                  />
                </div>

                {/* Price and Delivery */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (days) *</label>
                    <input
                      type="number"
                      value={formData.deliveryTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryTime: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
                      placeholder="7"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => { setShowCreateModal(false); resetForm(); }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    isLoading={submitting}
                  >
                    {editingOffer ? 'Update Offer' : 'Create Offer'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
