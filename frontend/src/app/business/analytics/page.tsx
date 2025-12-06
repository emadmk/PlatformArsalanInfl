'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { BusinessNavbar } from '@/components/shared/BusinessNavbar';
import api from '@/lib/api';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BarChart2,
  PieChart,
  Activity,
} from 'lucide-react';

interface AnalyticsData {
  activeCampaigns: number;
  totalInfluencers: number;
  completedProjects: number;
  totalSpent: number;
  campaignsByMonth: { month: string; count: number }[];
  spendingByMonth: { month: string; amount: number }[];
  topCategories: { name: string; count: number }[];
}

export default function BusinessAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeCampaigns: 0,
    totalInfluencers: 0,
    completedProjects: 0,
    totalSpent: 0,
    campaignsByMonth: [],
    spendingByMonth: [],
    topCategories: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/business/dashboard/stats');
      setAnalytics({
        activeCampaigns: data.activeCampaigns || 0,
        totalInfluencers: data.totalInfluencers || 0,
        completedProjects: data.completedProjects || 0,
        totalSpent: data.totalSpent || 0,
        campaignsByMonth: data.campaignsByMonth || [],
        spendingByMonth: data.spendingByMonth || [],
        topCategories: data.topCategories || [],
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    trend,
  }: {
    title: string;
    value: string | number;
    icon: any;
    color: string;
    trend?: { value: number; isPositive: boolean };
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div
                className={`flex items-center mt-2 text-sm ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                <span>{trend.value}% from last month</span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 ${color} rounded-full flex items-center justify-center`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessNavbar />
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            Track your campaign performance and spending
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Active Campaigns"
            value={analytics.activeCampaigns}
            icon={Activity}
            color="bg-secondary-100 text-secondary-600"
          />
          <StatCard
            title="Total Influencers"
            value={analytics.totalInfluencers}
            icon={Users}
            color="bg-purple-100 text-purple-600"
          />
          <StatCard
            title="Completed Projects"
            value={analytics.completedProjects}
            icon={BarChart2}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            title="Total Spent"
            value={formatCurrency(analytics.totalSpent)}
            icon={DollarSign}
            color="bg-blue-100 text-blue-600"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campaign Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <BarChart2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Campaign performance chart</p>
                  <p className="text-gray-400 text-xs mt-1">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Spending Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <div className="text-center">
                  <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Spending breakdown by category</p>
                  <p className="text-gray-400 text-xs mt-1">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Campaign Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Active</span>
                  <span className="font-semibold text-green-600">{analytics.activeCampaigns}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Completed</span>
                  <span className="font-semibold text-blue-600">{analytics.completedProjects}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Total Campaigns</span>
                  <span className="font-semibold text-gray-900">
                    {analytics.activeCampaigns + analytics.completedProjects}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Influencer Engagement */}
          <Card>
            <CardHeader>
              <CardTitle>Influencer Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Influencers</span>
                  <span className="font-semibold text-purple-600">{analytics.totalInfluencers}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Avg. per Campaign</span>
                  <span className="font-semibold text-gray-900">
                    {analytics.activeCampaigns + analytics.completedProjects > 0
                      ? (
                          analytics.totalInfluencers /
                          (analytics.activeCampaigns + analytics.completedProjects)
                        ).toFixed(1)
                      : 0}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Engagement Rate</span>
                  <span className="font-semibold text-green-600">--</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Spent</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(analytics.totalSpent)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Avg. per Campaign</span>
                  <span className="font-semibold text-gray-900">
                    {analytics.activeCampaigns + analytics.completedProjects > 0
                      ? formatCurrency(
                          analytics.totalSpent /
                            (analytics.activeCampaigns + analytics.completedProjects)
                        )
                      : formatCurrency(0)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-semibold text-green-600">--</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Tips to Improve Your Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Target the Right Audience</h4>
                <p className="text-sm text-blue-700">
                  Focus on micro-influencers with high engagement rates in your niche for better ROI.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Clear Deliverables</h4>
                <p className="text-sm text-green-700">
                  Define specific content requirements and guidelines to ensure consistent brand messaging.
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Track Performance</h4>
                <p className="text-sm text-purple-700">
                  Monitor campaign metrics regularly and adjust your strategy based on what works.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
