'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
import { DashboardNavbar } from '@/components/shared/DashboardNavbar';
import api from '@/lib/api';
import { Search, MapPin, DollarSign, Calendar, Users, Filter } from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  requirements: {
    categories: string[];
    minFollowers: number;
    platforms: string[];
  };
  businessId: {
    _id: string;
    firstName: string;
    lastName: string;
    profile?: {
      companyName?: string;
    };
    avatar?: string;
  };
  acceptedInfluencers?: string[];
  appliedInfluencers?: string[];
  maxInfluencers: number;
}

export default function BrowseProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [minBudget, setMinBudget] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const categories = ['all', 'Fashion', 'Beauty', 'Technology', 'Food', 'Travel', 'Fitness', 'Gaming', 'Lifestyle'];

  useEffect(() => {
    fetchProjects();
  }, [page, selectedCategory, minBudget]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 12 };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (minBudget) {
        params.minBudget = minBudget;
      }

      const { data } = await api.get('/influencer/projects/browse', { params });
      setProjects(data.projects || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (projectId: string) => {
    try {
      await api.post(`/projects/${projectId}/apply`);
      fetchProjects();
    } catch (error: any) {
      console.error('Error applying to project:', error);
      alert(error.response?.data?.error || 'Failed to apply to project');
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      active: 'success',
      completed: 'info',
      pending: 'warning',
      in_progress: 'primary',
      pending_approval: 'warning',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'gray'}>{status.replace('_', ' ')}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Projects</h1>
              <p className="mt-1 text-sm text-gray-600">
                Find exciting collaboration opportunities with brands
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
                placeholder="Search projects by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    Minimum Budget (USD)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g., 500"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Category Pills */}
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
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

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Showing {filteredProjects.length} of {total} projects
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => {
                const isApplied = project.appliedInfluencers?.some((id) => id === project._id);
                const spotsLeft = project.maxInfluencers - (project.acceptedInfluencers?.length || 0);

                return (
                  <Card key={project._id} className="hover:shadow-xl transition-shadow duration-300">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {project.title}
                          </h3>
                          {getStatusBadge(project.status)}
                        </div>
                      </div>

                      {/* Business Info */}
                      <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
                          {project.businessId?.firstName?.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {project.businessId?.profile?.companyName ||
                              `${project.businessId?.firstName} ${project.businessId?.lastName}`}
                          </p>
                          <p className="text-xs text-gray-500">Brand</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      {/* Project Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {formatCurrency(project.budget)}
                          </span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Deadline: {formatDate(project.deadline)}</span>
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          <span>
                            {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left
                          </span>
                        </div>
                      </div>

                      {/* Requirements */}
                      {project.requirements?.categories && project.requirements.categories.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {project.requirements.categories.slice(0, 3).map((cat, index) => (
                              <Badge key={index} variant="gray">
                                {cat}
                              </Badge>
                            ))}
                            {project.requirements.categories.length > 3 && (
                              <Badge variant="gray">
                                +{project.requirements.categories.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Platforms */}
                      {project.requirements?.platforms && project.requirements.platforms.length > 0 && (
                        <div className="mb-4 flex gap-2">
                          {project.requirements.platforms.map((platform, index) => (
                            <div
                              key={index}
                              className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded"
                            >
                              {platform}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Min Followers */}
                      {project.requirements?.minFollowers && (
                        <div className="mb-4 text-xs text-gray-600">
                          Min. Followers: {project.requirements.minFollowers.toLocaleString()}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => router.push(`/dashboard/projects/${project._id}`)}
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        {!isApplied && spotsLeft > 0 && project.status === 'active' && (
                          <Button
                            variant="primary"
                            onClick={() => handleApply(project._id)}
                            className="flex-1"
                          >
                            Apply Now
                          </Button>
                        )}
                        {isApplied && (
                          <Button variant="success" disabled className="flex-1">
                            Applied ✓
                          </Button>
                        )}
                        {spotsLeft === 0 && (
                          <Button variant="gray" disabled className="flex-1">
                            Full
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {total > 12 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
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
