'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { BusinessNavbar } from '@/components/shared/BusinessNavbar';
import api from '@/lib/api';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  DollarSign,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  maxInfluencers: number;
  acceptedInfluencers?: string[];
  appliedInfluencers?: string[];
  requirements?: {
    categories: string[];
    platforms: string[];
    minFollowers: number;
  };
  createdAt: string;
}

export default function BusinessProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const statuses = ['all', 'draft', 'active', 'in_progress', 'completed', 'cancelled'];

  useEffect(() => {
    fetchProjects();
  }, [page, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const { data } = await api.get('/business/projects', { params });
      setProjects(data.projects || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) {
      return;
    }

    try {
      await api.delete(`/business/projects/${projectId}`);
      fetchProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert(error.response?.data?.error || 'Failed to delete campaign');
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      active: 'success',
      draft: 'gray',
      completed: 'info',
      pending: 'warning',
      in_progress: 'primary',
      cancelled: 'danger',
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
      <BusinessNavbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Campaigns</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your influencer marketing campaigns
              </p>
            </div>
            <Link href="/business/projects/new">
              <Button variant="secondary">
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="mt-6 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-gray-900 bg-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent text-gray-900 bg-white"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">Start by creating your first influencer campaign</p>
              <Link href="/business/projects/new">
                <Button variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <>
            <div className="space-y-4">
              {filteredProjects.map((project) => {
                const applicants = project.appliedInfluencers?.length || 0;
                const accepted = project.acceptedInfluencers?.length || 0;
                const spotsLeft = project.maxInfluencers - accepted;

                return (
                  <Card key={project._id} className="hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Main Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {project.title}
                                </h3>
                                {getStatusBadge(project.status)}
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                                {project.description}
                              </p>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                              <span className="font-medium text-green-600">
                                {formatCurrency(project.budget)}
                              </span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Due: {formatDate(project.deadline)}</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <Users className="w-4 h-4 mr-1" />
                              <span>{applicants} applicants</span>
                            </div>
                            <div className="flex items-center text-gray-600">
                              <span className="text-sm">
                                {accepted}/{project.maxInfluencers} spots filled
                              </span>
                            </div>
                          </div>

                          {/* Categories */}
                          {project.requirements?.categories && project.requirements.categories.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {project.requirements.categories.map((cat, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                >
                                  {cat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 md:flex-col md:items-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/business/projects/${project._id}`)}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/business/projects/${project._id}/edit`)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProject(project._id)}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            {total > 10 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 text-sm text-gray-600">
                  Page {page} of {Math.ceil(total / 10)}
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 10)}
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
