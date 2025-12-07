'use client';

import { useState, useEffect } from 'react';
import { AdminNavbar } from '@/components/shared/AdminNavbar';
import { Card, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import api from '@/lib/api';
import {
  Search,
  Users,
  DollarSign,
  ShoppingCart,
  Eye,
  Edit,
  Ban,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Link as LinkIcon,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';

interface SafiraInfluencer {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profile?: {
      avatar?: string;
    };
  };
  affiliateCode: string;
  totalClicks: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  pendingCommissions: number;
  conversionRate: number;
  status: 'active' | 'inactive' | 'suspended';
  tier: string;
  commissionRate: number;
  createdAt: string;
}

export default function SafiraInfluencersPage() {
  const [influencers, setInfluencers] = useState<SafiraInfluencer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedInfluencer, setSelectedInfluencer] = useState<SafiraInfluencer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'suspend' | 'activate'>('suspend');
  const [actionLoading, setActionLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    commissionRate: 10,
    tier: 'standard',
  });

  useEffect(() => {
    fetchInfluencers();
  }, [page, statusFilter]);

  const fetchInfluencers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10, sort: '-totalRevenue' };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const { data } = await api.get('/admin/safira/influencers', { params });
      setInfluencers(data.influencers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching influencers:', error);
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInfluencers();
  };

  const handleEditInfluencer = (influencer: SafiraInfluencer) => {
    setSelectedInfluencer(influencer);
    setEditFormData({
      commissionRate: influencer.commissionRate,
      tier: influencer.tier,
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedInfluencer) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/safira/influencers/${selectedInfluencer._id}`, editFormData);
      setShowEditModal(false);
      fetchInfluencers();
    } catch (error: any) {
      console.error('Failed to update influencer:', error);
      alert(error.response?.data?.error || 'Failed to update');
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (influencer: SafiraInfluencer, action: 'suspend' | 'activate') => {
    setSelectedInfluencer(influencer);
    setActionType(action);
    setShowActionModal(true);
  };

  const handleAction = async () => {
    if (!selectedInfluencer) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/safira/influencers/${selectedInfluencer._id}/${actionType}`);
      setShowActionModal(false);
      fetchInfluencers();
    } catch (error: any) {
      console.error('Error:', error);
      alert(error.response?.data?.error || 'Failed');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'gray'> = {
      active: 'success',
      inactive: 'gray',
      suspended: 'danger',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
  };

  const getTierBadge = (tier: string) => {
    const variants: Record<string, 'success' | 'warning' | 'info' | 'gray'> = {
      gold: 'warning',
      silver: 'gray',
      bronze: 'info',
      standard: 'gray',
    };
    return <Badge variant={variants[tier] || 'gray'}>{tier}</Badge>;
  };

  return (
    <>
      <AdminNavbar />
      <div className="lg:ml-64 pt-16 min-h-screen bg-slate-950">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/safira" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Safira Influencers</h1>
              <p className="text-slate-400 mt-1">
                Manage influencer affiliate accounts ({total} total)
              </p>
            </div>
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
                      placeholder="Search influencers..."
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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : influencers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No influencers found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Influencer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Code</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Conversions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Commission</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {influencers.map((influencer) => (
                        <tr key={influencer._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-medium">
                                {influencer.userId?.firstName?.charAt(0)}{influencer.userId?.lastName?.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {influencer.userId?.firstName} {influencer.userId?.lastName}
                                </p>
                                <p className="text-slate-500 text-sm">{influencer.userId?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded text-sm">
                              {influencer.affiliateCode}
                            </code>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(influencer.status)}
                              {getTierBadge(influencer.tier)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white">{influencer.totalConversions}</p>
                            <p className="text-slate-500 text-xs">{influencer.conversionRate?.toFixed(1)}% rate</p>
                          </td>
                          <td className="px-6 py-4 text-emerald-400 font-medium">
                            {formatCurrency(influencer.totalRevenue)}
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-white">{formatCurrency(influencer.totalCommissions)}</p>
                            <p className="text-yellow-400 text-xs">
                              {formatCurrency(influencer.pendingCommissions)} pending
                            </p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEditInfluencer(influencer)}
                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {influencer.status === 'suspended' ? (
                                <button
                                  onClick={() => openActionModal(influencer, 'activate')}
                                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg"
                                  title="Activate"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openActionModal(influencer, 'suspend')}
                                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg"
                                  title="Suspend"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
                  <p className="text-slate-400 text-sm">Page {page} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg disabled:opacity-50"
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

      {/* Edit Modal */}
      {showEditModal && selectedInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Edit Influencer</h3>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  value={editFormData.commissionRate}
                  onChange={(e) => setEditFormData({ ...editFormData, commissionRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Tier</label>
                <select
                  value={editFormData.tier}
                  onChange={(e) => setEditFormData({ ...editFormData, tier: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="standard">Standard</option>
                  <option value="bronze">Bronze</option>
                  <option value="silver">Silver</option>
                  <option value="gold">Gold</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 p-4 border-t border-slate-700">
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
              <Button variant="secondary" onClick={handleSaveEdit} disabled={actionLoading} className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                {actionLoading ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && selectedInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {actionType === 'suspend' ? 'Suspend Influencer' : 'Activate Influencer'}
              </h3>
              <button onClick={() => setShowActionModal(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-slate-300">
                {actionType === 'suspend'
                  ? `Are you sure you want to suspend ${selectedInfluencer.userId?.firstName}? They won't earn commissions.`
                  : `Are you sure you want to activate ${selectedInfluencer.userId?.firstName}?`
                }
              </p>
            </div>
            <div className="flex gap-3 p-4 border-t border-slate-700">
              <Button variant="outline" onClick={() => setShowActionModal(false)} className="flex-1">Cancel</Button>
              <Button
                variant={actionType === 'suspend' ? 'danger' : 'secondary'}
                onClick={handleAction}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Processing...' : actionType === 'suspend' ? 'Suspend' : 'Activate'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
