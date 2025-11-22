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
  Filter,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  Star,
} from 'lucide-react';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'influencer' | 'business' | 'admin';
  avatar?: string;
  profile?: {
    verified?: boolean;
    banned?: boolean;
    banReason?: string;
    companyName?: string;
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
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'verify'>('ban');
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [page, selectedRole, selectedStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };

      if (selectedRole !== 'all') {
        params.role = selectedRole;
      }

      if (selectedStatus === 'verified') {
        params.verified = 'true';
      } else if (selectedStatus === 'banned') {
        params.banned = 'true';
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const { data } = await api.get('/admin/users', { params });
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser) return;

    try {
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
      }

      setShowActionModal(false);
      setSelectedUser(null);
      setBanReason('');
      fetchUsers();
    } catch (error: any) {
      console.error('Error performing action:', error);
      alert(error.response?.data?.error || 'Failed to perform action');
    }
  };

  const openActionModal = (user: User, action: 'ban' | 'unban' | 'verify') => {
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
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      influencer: 'primary',
      business: 'success',
      admin: 'danger',
    };
    return <Badge variant={variants[role] || 'gray'}>{role}</Badge>;
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Users Management</h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage all users on the platform
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
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
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
                    User Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Roles</option>
                    <option value="influencer">Influencers</option>
                    <option value="business">Businesses</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="verified">Verified Only</option>
                    <option value="banned">Banned Only</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="primary" onClick={() => fetchUsers()}>
                  Apply Filters
                </Button>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{total}</p>
                </div>
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Influencers</p>
                  <p className="text-2xl font-bold text-primary-600">
                    {users.filter((u) => u.role === 'influencer').length}
                  </p>
                </div>
                <Star className="w-8 h-8 text-primary-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Businesses</p>
                  <p className="text-2xl font-bold text-green-600">
                    {users.filter((u) => u.role === 'business').length}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-green-400" />
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {users.filter((u) => u.profile?.verified).length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="text-gray-400 text-4xl mb-2">👥</div>
                      <p className="text-gray-600">No users found</p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
                              {user.firstName.charAt(0)}
                              {user.lastName.charAt(0)}
                            </div>
                          )}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                              {user.profile?.verified && (
                                <CheckCircle className="inline-block w-4 h-4 ml-1 text-blue-500" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.role === 'business' && user.profile?.companyName && (
                              <div className="text-xs text-gray-400">
                                {user.profile.companyName}
                              </div>
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
                          {user.profile?.banned ? (
                            <Badge variant="danger">Banned</Badge>
                          ) : user.profile?.verified ? (
                            <Badge variant="success">Verified</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                          {user.profile?.banned && user.profile?.banReason && (
                            <span className="text-xs text-red-600">
                              {user.profile.banReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/users/${user._id}`)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {!user.profile?.verified && (
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => openActionModal(user, 'verify')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}

                          {user.profile?.banned ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => openActionModal(user, 'unban')}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => openActionModal(user, 'ban')}
                            >
                              <Ban className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {Math.min((page - 1) * 20 + 1, total)} to {Math.min(page * 20, total)}{' '}
                of {total} users
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {actionType === 'ban'
                    ? 'Ban User'
                    : actionType === 'unban'
                    ? 'Unban User'
                    : 'Verify User'}
                </h3>
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setBanReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <p className="text-gray-600">
                  {actionType === 'ban' && (
                    <>
                      Are you sure you want to ban{' '}
                      <strong>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </strong>
                      ? This will prevent them from accessing the platform.
                    </>
                  )}
                  {actionType === 'unban' && (
                    <>
                      Are you sure you want to unban{' '}
                      <strong>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </strong>
                      ? They will regain access to the platform.
                    </>
                  )}
                  {actionType === 'verify' && (
                    <>
                      Are you sure you want to verify{' '}
                      <strong>
                        {selectedUser.firstName} {selectedUser.lastName}
                      </strong>
                      ? This will mark their account as verified.
                    </>
                  )}
                </p>
              </div>

              {actionType === 'ban' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Ban *
                  </label>
                  <textarea
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder="Enter reason for banning this user..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    rows={3}
                    required
                  />
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
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
                  type="button"
                  variant={
                    actionType === 'ban'
                      ? 'danger'
                      : actionType === 'unban'
                      ? 'primary'
                      : 'success'
                  }
                  onClick={handleAction}
                  className="flex-1"
                >
                  {actionType === 'ban' && 'Ban User'}
                  {actionType === 'unban' && 'Unban User'}
                  {actionType === 'verify' && 'Verify User'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
