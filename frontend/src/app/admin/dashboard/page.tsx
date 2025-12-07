'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { AdminNavbar } from '@/components/shared/AdminNavbar';
import api from '@/lib/api';
import {
  Users,
  Briefcase,
  FolderKanban,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalInfluencers: number;
  totalBusinesses: number;
  activeProjects: number;
  pendingApprovals: number;
  totalRevenue: number;
  monthlyRevenue: number;
  pendingWithdrawals: number;
  newUsersToday: number;
  newUsersThisWeek: number;
}

interface RecentUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  createdAt: string;
  status?: string;
}

interface RecentProject {
  _id: string;
  title: string;
  businessId: { firstName: string; lastName: string; profile?: { companyName?: string } };
  status: string;
  budget: number;
  createdAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalInfluencers: 0,
    totalBusinesses: 0,
    activeProjects: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    pendingWithdrawals: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes, projectsRes] = await Promise.all([
        api.get('/admin/dashboard/stats'),
        api.get('/admin/users?limit=5&sort=-createdAt'),
        api.get('/admin/projects?limit=5&sort=-createdAt'),
      ]);

      setStats({
        ...statsRes.data,
        newUsersToday: statsRes.data.newUsersToday || 0,
        newUsersThisWeek: statsRes.data.newUsersThisWeek || 0,
      });
      setRecentUsers(usersRes.data.users || []);
      setRecentProjects(projectsRes.data.projects || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      active: 'success',
      pending: 'warning',
      pending_approval: 'warning',
      in_progress: 'info',
      completed: 'success',
      rejected: 'danger',
      banned: 'danger',
    };
    return <Badge variant={variants[status] || 'gray'}>{status.replace('_', ' ')}</Badge>;
  };

  if (isLoading) {
    return (
      <>
        <AdminNavbar />
        <div className="lg:ml-64 pt-16 min-h-screen bg-slate-950 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="lg:ml-64 pt-16 min-h-screen bg-slate-950">
        <div className="p-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 mt-1">Welcome back! Here's what's happening.</p>
          </div>

          {/* Alerts */}
          {stats.pendingApprovals > 0 && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4">
              <AlertCircle className="w-6 h-6 text-yellow-500" />
              <div className="flex-1">
                <p className="text-yellow-500 font-medium">
                  {stats.pendingApprovals} items require your attention
                </p>
                <p className="text-yellow-500/70 text-sm">
                  Projects and withdrawals pending approval
                </p>
              </div>
              <Link href="/admin/projects?status=pending">
                <Button variant="outline" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10">
                  Review Now
                </Button>
              </Link>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-emerald-500 text-sm flex items-center">
                        <ArrowUpRight className="w-3 h-3" />
                        +{stats.newUsersThisWeek}
                      </span>
                      <span className="text-slate-500 text-xs">this week</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Users className="w-7 h-7 text-blue-500" />
                  </div>
                </div>
                <div className="mt-4 flex gap-4 text-xs">
                  <span className="text-slate-400">
                    <span className="text-white font-medium">{stats.totalInfluencers}</span> Influencers
                  </span>
                  <span className="text-slate-400">
                    <span className="text-white font-medium">{stats.totalBusinesses}</span> Businesses
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Active Projects</p>
                    <p className="text-3xl font-bold text-white">{stats.activeProjects}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500 text-sm flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {stats.pendingApprovals} pending
                      </span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                    <FolderKanban className="w-7 h-7 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-emerald-500 text-sm flex items-center">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {formatCurrency(stats.monthlyRevenue)}
                      </span>
                      <span className="text-slate-500 text-xs">this month</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Withdrawals */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-1">Pending Withdrawals</p>
                    <p className="text-3xl font-bold text-white">{stats.pendingWithdrawals}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Link href="/admin/payments?type=withdrawals" className="text-blue-500 text-sm hover:underline">
                        Process now
                      </Link>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-orange-500/20 rounded-2xl flex items-center justify-center">
                    <Clock className="w-7 h-7 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Users */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Recent Users</CardTitle>
                  <Link href="/admin/users" className="text-blue-500 text-sm hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {recentUsers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No users yet</div>
                  ) : (
                    recentUsers.map((user) => (
                      <div key={user._id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                            <p className="text-slate-400 text-sm">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={user.role === 'business' ? 'warning' : 'info'}>
                            {user.role}
                          </Badge>
                          <span className="text-slate-500 text-xs">{formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Recent Projects</CardTitle>
                  <Link href="/admin/projects" className="text-blue-500 text-sm hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {recentProjects.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No projects yet</div>
                  ) : (
                    recentProjects.map((project) => (
                      <div key={project._id} className="p-4 hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-medium truncate max-w-[200px]">{project.title}</p>
                          {getStatusBadge(project.status)}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">
                            {project.businessId?.profile?.companyName || `${project.businessId?.firstName} ${project.businessId?.lastName}`}
                          </span>
                          <span className="text-emerald-500 font-medium">{formatCurrency(project.budget)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Link href="/admin/users">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-blue-500/50 transition-colors cursor-pointer text-center">
                  <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Manage Users</p>
                </div>
              </Link>
              <Link href="/admin/projects?status=pending">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-purple-500/50 transition-colors cursor-pointer text-center">
                  <FolderKanban className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Review Projects</p>
                </div>
              </Link>
              <Link href="/admin/payments?type=withdrawals">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-colors cursor-pointer text-center">
                  <DollarSign className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Withdrawals</p>
                </div>
              </Link>
              <Link href="/admin/chats">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-pink-500/50 transition-colors cursor-pointer text-center">
                  <Briefcase className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">View Chats</p>
                </div>
              </Link>
              <Link href="/admin/safira">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-orange-500/50 transition-colors cursor-pointer text-center">
                  <TrendingUp className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Safira</p>
                </div>
              </Link>
              <Link href="/admin/analytics">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-cyan-500/50 transition-colors cursor-pointer text-center">
                  <TrendingUp className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                  <p className="text-white text-sm font-medium">Analytics</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
