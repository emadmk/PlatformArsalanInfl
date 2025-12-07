'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminNavbar } from '@/components/shared/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import api from '@/lib/api';
import {
  Search,
  FolderKanban,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Users,
  Calendar,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Check,
  Ban,
} from 'lucide-react';

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  deadline: string;
  maxInfluencers: number;
  businessId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      companyName?: string;
    };
  };
  requirements?: {
    platforms?: string[];
    categories?: string[];
    minFollowers?: number;
  };
  applications?: any[];
  deliverables?: any[];
  createdAt: string;
  updatedAt: string;
}

export default function AdminProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'delete'>('approve');
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    budget: 0,
    status: '',
    maxInfluencers: 5,
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [page, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10, sort: '-createdAt' };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const { data } = await api.get('/admin/projects', { params });
      setProjects(data.projects || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/dashboard/stats');
      setStats({
        total: data.totalProjects || 0,
        active: data.activeProjects || 0,
        pending: data.pendingApprovals || 0,
        completed: data.completedProjects || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setShowViewModal(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setEditFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      budget: project.budget,
      status: project.status,
      maxInfluencers: project.maxInfluencers,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedProject) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/projects/${selectedProject._id}`, editFormData);
      setShowEditModal(false);
      fetchProjects();
      fetchStats();
    } catch (error: any) {
      console.error('Failed to update project:', error);
      alert(error.response?.data?.error || 'Failed to update project');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (project: Project, action: 'approve' | 'reject' | 'delete') => {
    setSelectedProject(project);
    setActionType(action);
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedProject) return;

    try {
      setActionLoading(true);

      if (actionType === 'approve') {
        await api.put(`/admin/projects/${selectedProject._id}`, { status: 'active' });
      } else if (actionType === 'reject') {
        if (!rejectReason) {
          alert('Please provide a reason for rejection');
          return;
        }
        await api.put(`/admin/projects/${selectedProject._id}`, {
          status: 'rejected',
          rejectionReason: rejectReason,
        });
      } else if (actionType === 'delete') {
        await api.delete(`/admin/projects/${selectedProject._id}`);
      }

      setShowActionModal(false);
      setSelectedProject(null);
      setRejectReason('');
      fetchProjects();
      fetchStats();
    } catch (error: any) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.error || 'Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      active: 'success',
      pending: 'warning',
      pending_approval: 'warning',
      in_progress: 'info',
      completed: 'success',
      rejected: 'danger',
      cancelled: 'gray',
    };
    return <Badge variant={variants[status] || 'gray'}>{status.replace('_', ' ')}</Badge>;
  };

  const categories = [
    'Fashion', 'Beauty', 'Technology', 'Food', 'Travel', 'Fitness',
    'Gaming', 'Lifestyle', 'Health', 'Business', 'Education', 'Entertainment',
  ];

  return (
    <>
      <AdminNavbar />
      <div className="lg:ml-64 pt-16 min-h-screen bg-slate-950">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Projects Management</h1>
              <p className="text-slate-400 mt-1">
                Manage all platform projects and campaigns ({total} total)
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Projects</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active</p>
                    <p className="text-2xl font-bold text-white">{stats.active}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Pending Approval</p>
                    <p className="text-2xl font-bold text-white">{stats.pending}</p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-white">{stats.completed}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Check className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="bg-slate-900 border-slate-800 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </form>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Projects Table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No projects found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Project
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Business
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Budget
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Deadline
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {projects.map((project) => (
                        <tr key={project._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white font-medium max-w-[250px] truncate">
                                {project.title}
                              </p>
                              <p className="text-slate-500 text-sm">{project.category}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-white text-sm">
                                {project.businessId?.profile?.companyName ||
                                  `${project.businessId?.firstName} ${project.businessId?.lastName}`}
                              </p>
                              <p className="text-slate-500 text-xs">{project.businessId?.email}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(project.status)}
                          </td>
                          <td className="px-6 py-4 text-emerald-400 font-medium">
                            {formatCurrency(project.budget)}
                          </td>
                          <td className="px-6 py-4 text-slate-400 text-sm">
                            {formatDate(project.deadline)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewProject(project)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditProject(project)}
                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Edit Project"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {project.status === 'pending' && (
                                <>
                                  <button
                                    onClick={() => openActionModal(project, 'approve')}
                                    className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Approve"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openActionModal(project, 'reject')}
                                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                                    title="Reject"
                                  >
                                    <Ban className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => openActionModal(project, 'delete')}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                  <p className="text-slate-400 text-sm">
                    Page {page} of {totalPages} ({total} projects)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Project Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="mb-6">
                <h4 className="text-xl font-bold text-white mb-2">{selectedProject.title}</h4>
                <div className="flex items-center gap-3">
                  {getStatusBadge(selectedProject.status)}
                  <Badge variant="gray">{selectedProject.category}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Budget
                  </p>
                  <p className="text-emerald-400 text-lg font-bold mt-1">
                    {formatCurrency(selectedProject.budget)}
                  </p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Deadline
                  </p>
                  <p className="text-white mt-1">{formatDate(selectedProject.deadline)}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <Users className="w-4 h-4" /> Max Influencers
                  </p>
                  <p className="text-white mt-1">{selectedProject.maxInfluencers}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <FolderKanban className="w-4 h-4" /> Applications
                  </p>
                  <p className="text-white mt-1">{selectedProject.applications?.length || 0}</p>
                </div>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <p className="text-slate-400 text-sm mb-2">Description</p>
                <p className="text-white">{selectedProject.description}</p>
              </div>

              <div className="bg-slate-800 rounded-lg p-4 mb-4">
                <p className="text-slate-400 text-sm mb-2">Business</p>
                <p className="text-white">
                  {selectedProject.businessId?.profile?.companyName ||
                    `${selectedProject.businessId?.firstName} ${selectedProject.businessId?.lastName}`}
                </p>
                <p className="text-slate-500 text-sm">{selectedProject.businessId?.email}</p>
              </div>

              {selectedProject.requirements && (
                <div className="bg-slate-800 rounded-lg p-4 mb-4">
                  <p className="text-slate-400 text-sm mb-2">Requirements</p>
                  {selectedProject.requirements.platforms && selectedProject.requirements.platforms.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedProject.requirements.platforms.map((platform) => (
                        <Badge key={platform} variant="info">{platform}</Badge>
                      ))}
                    </div>
                  )}
                  {selectedProject.requirements.minFollowers && (
                    <p className="text-white text-sm">
                      Min Followers: {selectedProject.requirements.minFollowers.toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditProject(selectedProject);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {selectedProject.status === 'pending' && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowViewModal(false);
                      openActionModal(selectedProject, 'approve');
                    }}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Edit Project</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                <select
                  value={editFormData.category}
                  onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Budget (USD)</label>
                <input
                  type="number"
                  value={editFormData.budget}
                  onChange={(e) => setEditFormData({ ...editFormData, budget: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Max Influencers</label>
                <input
                  type="number"
                  value={editFormData.maxInfluencers}
                  onChange={(e) => setEditFormData({ ...editFormData, maxInfluencers: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleSaveEdit}
                disabled={actionLoading}
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {actionType === 'approve' && 'Approve Project'}
                {actionType === 'reject' && 'Reject Project'}
                {actionType === 'delete' && 'Delete Project'}
              </h3>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setRejectReason('');
                }}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-slate-300 mb-4">
                {actionType === 'approve' && (
                  <>
                    Are you sure you want to approve{' '}
                    <strong className="text-white">"{selectedProject.title}"</strong>?
                    This will make it visible to influencers.
                  </>
                )}
                {actionType === 'reject' && (
                  <>
                    Are you sure you want to reject{' '}
                    <strong className="text-white">"{selectedProject.title}"</strong>?
                    The business will be notified.
                  </>
                )}
                {actionType === 'delete' && (
                  <>
                    Are you sure you want to permanently delete{' '}
                    <strong className="text-white">"{selectedProject.title}"</strong>?
                    This action cannot be undone.
                  </>
                )}
              </p>

              {actionType === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reason for rejecting this project..."
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 p-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowActionModal(false);
                  setRejectReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'secondary' : 'danger'}
                onClick={handleAction}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Processing...' : (
                  <>
                    {actionType === 'approve' && 'Approve'}
                    {actionType === 'reject' && 'Reject'}
                    {actionType === 'delete' && 'Delete'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
