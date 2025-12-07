'use client';

import { useState, useEffect } from 'react';
import { AdminNavbar } from '@/components/shared/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import api from '@/lib/api';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FolderKanban,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    userGrowth: number;
    totalInfluencers: number;
    totalBusinesses: number;
  };
  projects: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    pendingProjects: number;
    projectGrowth: number;
    averageBudget: number;
    totalBudget: number;
  };
  revenue: {
    totalRevenue: number;
    monthlyRevenue: number;
    platformFees: number;
    revenueGrowth: number;
    averageProjectValue: number;
  };
  engagement: {
    totalChats: number;
    totalMessages: number;
    averageResponseTime: number;
    activeChatsToday: number;
  };
  topCategories: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
    userId?: {
      firstName: string;
      lastName: string;
    };
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: analyticsData } = await api.get('/admin/analytics', {
        params: { period },
      });
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
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
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Analytics</h1>
              <p className="text-slate-400 mt-1">Platform performance and insights</p>
            </div>
            <div className="flex gap-3">
              {/* Period Selector */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                {(['7d', '30d', '90d', '1y'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      period === p
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : p === '90d' ? '90 Days' : '1 Year'}
                  </button>
                ))}
              </div>
              <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Users */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-white">
                      {formatNumber(data?.overview.totalUsers || 0)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {(data?.overview.userGrowth || 0) >= 0 ? (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 text-xs">
                            +{data?.overview.userGrowth?.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                          <span className="text-red-400 text-xs">
                            {data?.overview.userGrowth?.toFixed(1)}%
                          </span>
                        </>
                      )}
                      <span className="text-slate-500 text-xs">vs last period</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
                <div className="flex gap-4 mt-4 text-xs">
                  <span className="text-slate-400">
                    <span className="text-white font-medium">{data?.overview.totalInfluencers}</span> Influencers
                  </span>
                  <span className="text-slate-400">
                    <span className="text-white font-medium">{data?.overview.totalBusinesses}</span> Businesses
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card className="bg-gradient-to-br from-emerald-500/20 to-green-600/20 border-emerald-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-300 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">
                      {formatCurrency(data?.revenue.totalRevenue || 0)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {(data?.revenue.revenueGrowth || 0) >= 0 ? (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 text-xs">
                            +{data?.revenue.revenueGrowth?.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                          <span className="text-red-400 text-xs">
                            {data?.revenue.revenueGrowth?.toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-emerald-500/30 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-emerald-300">
                  Platform fees: {formatCurrency(data?.revenue.platformFees || 0)}
                </div>
              </CardContent>
            </Card>

            {/* Projects */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Projects</p>
                    <p className="text-3xl font-bold text-white">
                      {data?.projects.totalProjects || 0}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {(data?.projects.projectGrowth || 0) >= 0 ? (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-green-400" />
                          <span className="text-green-400 text-xs">
                            +{data?.projects.projectGrowth?.toFixed(1)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <ArrowDownRight className="w-3 h-3 text-red-400" />
                          <span className="text-red-400 text-xs">
                            {data?.projects.projectGrowth?.toFixed(1)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
                <div className="flex gap-4 mt-4 text-xs">
                  <span className="text-slate-400">
                    <span className="text-green-400 font-medium">{data?.projects.activeProjects}</span> Active
                  </span>
                  <span className="text-slate-400">
                    <span className="text-yellow-400 font-medium">{data?.projects.pendingProjects}</span> Pending
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Engagement */}
            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Chats</p>
                    <p className="text-3xl font-bold text-white">
                      {formatNumber(data?.engagement.totalChats || 0)}
                    </p>
                    <p className="text-slate-500 text-xs mt-1">
                      {formatNumber(data?.engagement.totalMessages || 0)} messages
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-pink-500" />
                  </div>
                </div>
                <div className="mt-4 text-xs text-slate-400">
                  <span className="text-white font-medium">{data?.engagement.activeChatsToday}</span> active today
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Growth Chart Placeholder */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-sm">Today</p>
                    <p className="text-2xl font-bold text-white">{data?.overview.newUsersToday || 0}</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-sm">This Week</p>
                    <p className="text-2xl font-bold text-white">{data?.overview.newUsersThisWeek || 0}</p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4 text-center">
                    <p className="text-slate-400 text-sm">This Month</p>
                    <p className="text-2xl font-bold text-white">{data?.overview.newUsersThisMonth || 0}</p>
                  </div>
                </div>
                <div className="h-48 flex items-center justify-center text-slate-500">
                  <BarChart3 className="w-8 h-8 mr-2" />
                  <span>Chart visualization</span>
                </div>
              </CardContent>
            </Card>

            {/* Revenue Chart Placeholder */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {formatCurrency(data?.revenue.monthlyRevenue || 0)}
                    </p>
                  </div>
                  <div className="bg-slate-800 rounded-lg p-4">
                    <p className="text-slate-400 text-sm">Avg Project Value</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(data?.revenue.averageProjectValue || 0)}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-400 text-sm mb-2">Total Project Budget</p>
                  <p className="text-3xl font-bold text-white">
                    {formatCurrency(data?.projects.totalBudget || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <CardTitle className="text-white">Top Categories</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {(data?.topCategories || []).length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No data available</div>
                  ) : (
                    data?.topCategories.map((category, index) => (
                      <div key={category.name} className="p-4 flex items-center justify-between hover:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-amber-500' :
                            index === 1 ? 'bg-slate-400' :
                            index === 2 ? 'bg-amber-700' :
                            'bg-slate-600'
                          }`}>
                            {index + 1}
                          </div>
                          <span className="text-white font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{category.count} projects</p>
                          <p className="text-emerald-400 text-sm">{formatCurrency(category.revenue)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {(data?.recentActivity || []).length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No recent activity</div>
                  ) : (
                    data?.recentActivity.slice(0, 8).map((activity, index) => (
                      <div key={index} className="p-4 hover:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white text-sm">{activity.description}</p>
                            {activity.userId && (
                              <p className="text-slate-500 text-xs">
                                by {activity.userId.firstName} {activity.userId.lastName}
                              </p>
                            )}
                          </div>
                          <span className="text-slate-500 text-xs">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
