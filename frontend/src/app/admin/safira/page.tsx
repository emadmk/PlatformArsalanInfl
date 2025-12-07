'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AdminNavbar } from '@/components/shared/AdminNavbar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import api from '@/lib/api';
import {
  Shield,
  DollarSign,
  Users,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Eye,
  Settings,
  BarChart3,
  Link as LinkIcon,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';

interface SafiraStats {
  totalInfluencers: number;
  activeInfluencers: number;
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  pendingPayouts: number;
  conversionRate: number;
  averageOrderValue: number;
}

interface TopInfluencer {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  totalConversions: number;
  totalRevenue: number;
  totalCommissions: number;
  conversionRate: number;
  status: string;
}

interface RecentConversion {
  _id: string;
  influencerId: {
    firstName: string;
    lastName: string;
  };
  orderId: string;
  orderTotal: number;
  commission: number;
  status: string;
  createdAt: string;
}

export default function AdminSafiraPage() {
  const [stats, setStats] = useState<SafiraStats>({
    totalInfluencers: 0,
    activeInfluencers: 0,
    totalConversions: 0,
    totalRevenue: 0,
    totalCommissions: 0,
    pendingPayouts: 0,
    conversionRate: 0,
    averageOrderValue: 0,
  });
  const [topInfluencers, setTopInfluencers] = useState<TopInfluencer[]>([]);
  const [recentConversions, setRecentConversions] = useState<RecentConversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, influencersRes, conversionsRes] = await Promise.all([
        api.get('/admin/safira/stats'),
        api.get('/admin/safira/influencers?limit=5&sort=-totalRevenue'),
        api.get('/admin/safira/conversions?limit=10&sort=-createdAt'),
      ]);

      setStats(statsRes.data);
      setTopInfluencers(influencersRes.data.influencers || []);
      setRecentConversions(conversionsRes.data.conversions || []);
    } catch (error) {
      console.error('Error fetching Safira data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.post('/admin/safira/sync');
      await fetchData();
    } catch (error) {
      console.error('Error syncing Safira data:', error);
      alert('Failed to sync data');
    } finally {
      setSyncing(false);
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
      completed: 'success',
      failed: 'danger',
      inactive: 'gray',
    };
    return <Badge variant={variants[status] || 'gray'}>{status}</Badge>;
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
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Safira Integration</h1>
                  <p className="text-slate-400">Manage influencer affiliate program</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSync}
                disabled={syncing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Data'}
              </Button>
              <Link href="/admin/safira/settings">
                <Button variant="secondary">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-500/30">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-300 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-green-400 text-xs">+12.5% from last month</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-amber-500/30 rounded-2xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Total Conversions</p>
                    <p className="text-3xl font-bold text-white">{stats.totalConversions.toLocaleString()}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {stats.conversionRate.toFixed(1)}% conversion rate
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/20 rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Active Influencers</p>
                    <p className="text-3xl font-bold text-white">{stats.activeInfluencers}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      of {stats.totalInfluencers} total
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">Pending Payouts</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(stats.pendingPayouts)}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      Avg order: {formatCurrency(stats.averageOrderValue)}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Link href="/admin/safira/influencers">
              <Card className="bg-slate-900 border-slate-800 hover:border-blue-500/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Influencer Stats</p>
                      <p className="text-slate-500 text-sm">View all influencers</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/safira/conversions">
              <Card className="bg-slate-900 border-slate-800 hover:border-green-500/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Conversions</p>
                      <p className="text-slate-500 text-sm">View all orders</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/safira/links">
              <Card className="bg-slate-900 border-slate-800 hover:border-purple-500/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <LinkIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Affiliate Links</p>
                      <p className="text-slate-500 text-sm">Manage links</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/admin/safira/settings">
              <Card className="bg-slate-900 border-slate-800 hover:border-orange-500/50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <Settings className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Settings</p>
                      <p className="text-slate-500 text-sm">Configure Safira</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Influencers */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Top Influencers</CardTitle>
                  <Link href="/admin/safira/influencers" className="text-blue-500 text-sm hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {topInfluencers.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No influencers yet</div>
                  ) : (
                    topInfluencers.map((influencer, index) => (
                      <div key={influencer._id} className="p-4 flex items-center justify-between hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-amber-500' :
                            index === 1 ? 'bg-slate-400' :
                            index === 2 ? 'bg-amber-700' :
                            'bg-slate-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {influencer.userId?.firstName} {influencer.userId?.lastName}
                            </p>
                            <p className="text-slate-500 text-sm">
                              {influencer.totalConversions} conversions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">
                            {formatCurrency(influencer.totalRevenue)}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {influencer.conversionRate?.toFixed(1)}% rate
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Conversions */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="border-b border-slate-800">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Recent Conversions</CardTitle>
                  <Link href="/admin/safira/conversions" className="text-blue-500 text-sm hover:underline">
                    View All
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-800">
                  {recentConversions.length === 0 ? (
                    <div className="p-6 text-center text-slate-500">No conversions yet</div>
                  ) : (
                    recentConversions.map((conversion) => (
                      <div key={conversion._id} className="p-4 hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">
                              Order #{conversion.orderId?.substring(0, 8)}
                            </p>
                            {getStatusBadge(conversion.status)}
                          </div>
                          <span className="text-slate-500 text-xs">{formatDate(conversion.createdAt)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">
                            via {conversion.influencerId?.firstName} {conversion.influencerId?.lastName}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-white">
                              {formatCurrency(conversion.orderTotal)}
                            </span>
                            <span className="text-emerald-400">
                              +{formatCurrency(conversion.commission)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Commission Settings Info */}
          <Card className="bg-slate-900 border-slate-800 mt-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Commission Structure</h3>
                    <p className="text-slate-400">Current commission rates and payout settings</p>
                  </div>
                </div>
                <Link href="/admin/safira/settings">
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Base Commission Rate</p>
                  <p className="text-2xl font-bold text-white mt-1">10%</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Cookie Duration</p>
                  <p className="text-2xl font-bold text-white mt-1">30 days</p>
                </div>
                <div className="bg-slate-800 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Minimum Payout</p>
                  <p className="text-2xl font-bold text-white mt-1">$50</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
