'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNavbar } from '@/components/shared/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { Input } from '@/components/shared/Input';
import api from '@/lib/api';
import {
  Search,
  Users,
  Filter,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  Star,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'influencer' | 'business' | 'admin';
  status: string;
  avatar?: string;
  profile?: {
    verified?: boolean;
    banned?: boolean;
    banReason?: string;
    companyName?: string;
    bio?: string;
    location?: string;
    socialMedia?: {
      totalFollowers?: number;
    };
  };
  createdAt: string;
  lastLogin?: string;
}

export default function UsersManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'verify' | 'delete'>('ban');
  const [banReason, setBanReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    status: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole, selectedStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10, sort: '-createdAt' };

      if (selectedRole !== 'all') {
        params.role = selectedRole;
      }

      if (selectedStatus === 'verified') {
        params.verified = 'true';
      } else if (selectedStatus === 'banned') {
        params.banned = 'true';
      } else if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleAction = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);

      if (actionType === 'ban') {
        if (!banReason) {
          alert('Please provide a reason for banning');
          return;
        }
        await api.post(`/admin/users/${selectedUser._id}/ban`, { reason: banReason });
      } else if (actionType === 'unban') {
        await api.post(`/admin/users/${selectedUser._id}/unban`);
      } else if (actionType === 'verify') {
        await api.post(`/admin/users/${selectedUser._id}/verify`);
      } else if (actionType === 'delete') {
        await api.delete(`/admin/users/${selectedUser._id}`);
      }

      setShowActionModal(false);
      setSelectedUser(null);
      setBanReason('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.error || 'Failed to perform action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      status: user.status || 'active',
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await api.put(`/admin/users/${selectedUser._id}`, editFormData);
      setShowEditModal(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user:', error);
      alert(error.response?.data?.error || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const openActionModal = (user: User, action: 'ban' | 'unban' | 'verify' | 'delete') => {
    setSelectedUser(user);
    setActionType(action);
    setShowActionModal(true);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      influencer: 'info',
      business: 'warning',
      admin: 'danger',
    };
    return <Badge variant={variants[role] || 'gray'}>{role}</Badge>;
  };

  const getStatusBadge = (user: User) => {
    if (user.profile?.banned || user.status === 'banned') {
      return <Badge variant="danger">Banned</Badge>;
    }
    if (user.profile?.verified) {
      return <Badge variant="success">Verified</Badge>;
    }
    if (user.status === 'active') {
      return <Badge variant="success">Active</Badge>;
    }
    if (user.status === 'pending') {
      return <Badge variant="warning">Pending</Badge>;
    }
    return <Badge variant="gray">{user.status || 'Unverified'}</Badge>;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'influencer':
        return <Star className="w-4 h-4" />;
      case 'business':
        return <Briefcase className="w-4 h-4" />;
      case 'admin':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="lg:ml-64 pt-16 min-h-screen bg-slate-950">
        <div className="p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Users Management</h1>
              <p className="text-slate-400 mt-1">
                Manage all platform users ({total} total)
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{total}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Influencers</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter((u) => u.role === 'influencer').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Star className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Businesses</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter((u) => u.role === 'business').length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Verified</p>
                    <p className="text-2xl font-bold text-white">
                      {users.filter((u) => u.profile?.verified).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-500" />
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
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </form>

                <div className="flex gap-4">
                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setPage(1);
                    }}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Roles</option>
                    <option value="influencer">Influencers</option>
                    <option value="business">Businesses</option>
                    <option value="admin">Admins</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setPage(1);
                    }}
                    className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="verified">Verified</option>
                    <option value="pending">Pending</option>
                    <option value="banned">Banned</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No users found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              {user.avatar ? (
                                <img
                                  src={user.avatar}
                                  alt={`${user.firstName} ${user.lastName}`}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </div>
                              )}
                              <div>
                                <p className="text-white font-medium">
                                  {user.firstName} {user.lastName}
                                  {user.profile?.verified && (
                                    <CheckCircle className="inline-block w-4 h-4 ml-1 text-blue-500" />
                                  )}
                                </p>
                                <p className="text-slate-400 text-sm">{user.email}</p>
                                {user.role === 'business' && user.profile?.companyName && (
                                  <p className="text-slate-500 text-xs">{user.profile.companyName}</p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {getRoleIcon(user.role)}
                              {getRoleBadge(user.role)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              {getStatusBadge(user)}
                              {user.profile?.banned && user.profile?.banReason && (
                                <span className="text-xs text-red-400 max-w-[150px] truncate">
                                  {user.profile.banReason}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                            {formatDate(user.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                            {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleViewUser(user)}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEditUser(user)}
                                className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => router.push(`/admin/chats?user=${user._id}`)}
                                className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Message User"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              {!user.profile?.verified && (
                                <button
                                  onClick={() => openActionModal(user, 'verify')}
                                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Verify User"
                                >
                                  <UserCheck className="w-4 h-4" />
                                </button>
                              )}
                              {user.profile?.banned ? (
                                <button
                                  onClick={() => openActionModal(user, 'unban')}
                                  className="p-2 text-slate-400 hover:text-green-400 hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Unban User"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => openActionModal(user, 'ban')}
                                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                                  title="Ban User"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => openActionModal(user, 'delete')}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                                title="Delete User"
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
                    Page {page} of {totalPages} ({total} users)
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

      {/* Action Modal */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {actionType === 'ban' && 'Ban User'}
                {actionType === 'unban' && 'Unban User'}
                {actionType === 'verify' && 'Verify User'}
                {actionType === 'delete' && 'Delete User'}
              </h3>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setBanReason('');
                }}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-slate-300 mb-4">
                {actionType === 'ban' && (
                  <>
                    Are you sure you want to ban{' '}
                    <strong className="text-white">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </strong>
                    ? This will prevent them from accessing the platform.
                  </>
                )}
                {actionType === 'unban' && (
                  <>
                    Are you sure you want to unban{' '}
                    <strong className="text-white">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </strong>
                    ? They will regain access to the platform.
                  </>
                )}
                {actionType === 'verify' && (
                  <>
                    Are you sure you want to verify{' '}
                    <strong className="text-white">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </strong>
                    ? This will mark their account as verified.
                  </>
                )}
                {actionType === 'delete' && (
                  <>
                    Are you sure you want to permanently delete{' '}
                    <strong className="text-white">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </strong>
                    ? This action cannot be undone.
                  </>
                )}
              </p>

              {actionType === 'ban' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Reason for Ban *
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Enter reason for banning this user..."
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
                  setBanReason('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant={actionType === 'ban' || actionType === 'delete' ? 'danger' : 'secondary'}
                onClick={handleAction}
                disabled={actionLoading}
                className="flex-1"
              >
                {actionLoading ? 'Processing...' : (
                  <>
                    {actionType === 'ban' && 'Ban User'}
                    {actionType === 'unban' && 'Unban User'}
                    {actionType === 'verify' && 'Verify User'}
                    {actionType === 'delete' && 'Delete User'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={editFormData.firstName}
                  onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={editFormData.lastName}
                  onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="banned">Banned</option>
                  <option value="suspended">Suspended</option>
                </select>
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

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">User Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-4 mb-6">
                {selectedUser.avatar ? (
                  <img
                    src={selectedUser.avatar}
                    alt={`${selectedUser.firstName} ${selectedUser.lastName}`}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                    {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-xl font-semibold text-white">
                    {selectedUser.firstName} {selectedUser.lastName}
                    {selectedUser.profile?.verified && (
                      <CheckCircle className="inline-block w-5 h-5 ml-2 text-blue-500" />
                    )}
                  </h4>
                  <p className="text-slate-400">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Role</p>
                  <div className="mt-1 flex items-center gap-2">
                    {getRoleIcon(selectedUser.role)}
                    {getRoleBadge(selectedUser.role)}
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedUser)}</div>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Joined</p>
                  <p className="text-white mt-1">{formatDate(selectedUser.createdAt)}</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-3">
                  <p className="text-slate-400 text-sm">Last Login</p>
                  <p className="text-white mt-1">
                    {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}
                  </p>
                </div>
              </div>

              {selectedUser.profile && (
                <div className="mt-4 space-y-3">
                  {selectedUser.profile.companyName && (
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-slate-400 text-sm">Company</p>
                      <p className="text-white mt-1">{selectedUser.profile.companyName}</p>
                    </div>
                  )}
                  {selectedUser.profile.bio && (
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-slate-400 text-sm">Bio</p>
                      <p className="text-white mt-1">{selectedUser.profile.bio}</p>
                    </div>
                  )}
                  {selectedUser.profile.location && (
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-slate-400 text-sm">Location</p>
                      <p className="text-white mt-1">{selectedUser.profile.location}</p>
                    </div>
                  )}
                  {selectedUser.profile.socialMedia?.totalFollowers !== undefined && (
                    <div className="bg-slate-800 rounded-lg p-3">
                      <p className="text-slate-400 text-sm">Total Followers</p>
                      <p className="text-white mt-1">
                        {selectedUser.profile.socialMedia.totalFollowers?.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {selectedUser.profile.banned && selectedUser.profile.banReason && (
                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-3">
                      <p className="text-red-400 text-sm">Ban Reason</p>
                      <p className="text-red-300 mt-1">{selectedUser.profile.banReason}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditUser(selectedUser);
                  }}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => router.push(`/admin/chats?user=${selectedUser._id}`)}
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
            <div className="p-4 border-t border-slate-700">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
