'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Input } from '@/components/shared/Input';
import { BusinessNavbar } from '@/components/shared/BusinessNavbar';
import api from '@/lib/api';
import { ArrowLeft, Plus, X } from 'lucide-react';

const categories = [
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
  'Education',
  'Entertainment',
];

const platforms = ['Instagram', 'YouTube', 'TikTok', 'Twitter', 'Facebook', 'LinkedIn'];

export default function CreateCampaignPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: '',
    deadline: '',
    maxInfluencers: '5',
    requirements: {
      categories: [] as string[],
      platforms: [] as string[],
      minFollowers: '',
    },
    deliverables: '',
    guidelines: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        categories: prev.requirements.categories.includes(category)
          ? prev.requirements.categories.filter((c) => c !== category)
          : [...prev.requirements.categories, category],
      },
    }));
  };

  const togglePlatform = (platform: string) => {
    setFormData((prev) => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        platforms: prev.requirements.platforms.includes(platform)
          ? prev.requirements.platforms.filter((p) => p !== platform)
          : [...prev.requirements.platforms, platform],
      },
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Campaign title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.budget || parseFloat(formData.budget) <= 0) {
      newErrors.budget = 'Please enter a valid budget';
    }

    if (!formData.deadline) {
      newErrors.deadline = 'Deadline is required';
    } else if (new Date(formData.deadline) <= new Date()) {
      newErrors.deadline = 'Deadline must be in the future';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (formData.requirements.platforms.length === 0) {
      newErrors.platforms = 'Please select at least one platform';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Parse deliverables from text to array of objects
      const deliverablesArray = formData.deliverables
        .split('\n')
        .filter(line => line.trim())
        .map((line, index) => ({
          title: line.trim(),
          description: line.trim(),
          quantity: 1,
        }));

      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline,
        maxInfluencers: parseInt(formData.maxInfluencers),
        requirements: {
          categories: formData.requirements.categories.length > 0
            ? formData.requirements.categories
            : [formData.category],
          platforms: formData.requirements.platforms,
          minFollowers: formData.requirements.minFollowers
            ? parseInt(formData.requirements.minFollowers)
            : 0,
          contentTypes: formData.requirements.platforms,
        },
        deliverables: deliverablesArray.length > 0 ? deliverablesArray : [
          { title: 'Content Creation', description: 'Create content as per guidelines', quantity: 1 }
        ],
        guidelines: formData.guidelines,
        status: 'active',
      };

      await api.post('/business/projects', projectData);
      router.push('/business/projects');
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      alert(error.response?.data?.error || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

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

        <Card>
          <CardHeader>
            <CardTitle>Create New Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Campaign Details</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title *
                  </label>
                  <Input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g., Summer Fashion Collection Launch"
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Describe your campaign objectives, target audience, and what you're looking for in influencers..."
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all text-gray-900 bg-white ${
                      errors.description ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all text-gray-900 bg-white ${
                      errors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget (USD) *
                    </label>
                    <Input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      placeholder="e.g., 5000"
                      min="0"
                      step="0.01"
                      className={errors.budget ? 'border-red-500' : ''}
                    />
                    {errors.budget && (
                      <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deadline *
                    </label>
                    <Input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={errors.deadline ? 'border-red-500' : ''}
                    />
                    {errors.deadline && (
                      <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Influencers
                  </label>
                  <select
                    name="maxInfluencers"
                    value={formData.maxInfluencers}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all text-gray-900 bg-white"
                  >
                    {[1, 2, 3, 5, 10, 15, 20, 25, 30].map((num) => (
                      <option key={num} value={num}>
                        {num} influencer{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900">Requirements</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Categories <span className="text-gray-500 font-normal">(Optional - select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.requirements.categories.includes(category)
                            ? 'bg-secondary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platforms * <span className="text-gray-500 font-normal">(Select all that apply)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {platforms.map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          formData.requirements.platforms.includes(platform)
                            ? 'bg-secondary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {platform}
                      </button>
                    ))}
                  </div>
                  {errors.platforms && (
                    <p className="mt-1 text-sm text-red-600">{errors.platforms}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Followers
                  </label>
                  <Input
                    type="number"
                    name="requirements.minFollowers"
                    value={formData.requirements.minFollowers}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        requirements: {
                          ...prev.requirements,
                          minFollowers: e.target.value,
                        },
                      }))
                    }
                    placeholder="e.g., 10000"
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty for no minimum requirement
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deliverables
                  </label>
                  <textarea
                    name="deliverables"
                    value={formData.deliverables}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Enter each deliverable on a new line, e.g.:&#10;3 Instagram posts&#10;2 Instagram Stories&#10;1 YouTube video"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all text-gray-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content Guidelines
                  </label>
                  <textarea
                    name="guidelines"
                    value={formData.guidelines}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Any specific guidelines, hashtags, mentions, or brand requirements..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 transition-all text-gray-900 bg-white"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
