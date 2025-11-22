'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import api from '@/lib/api';

interface DashboardStats {
  activeCampaigns: number;
  totalInfluencers: number;
  completedProjects: number;
  totalSpent: number;
}

interface Campaign {
  id: string;
  title: string;
  status: string;
  budget: number;
  applicants: number;
  deadline: string;
}

interface Influencer {
  id: string;
  name: string;
  category: string;
  followers: number;
  engagement: number;
  status: string;
}

export default function BusinessDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeCampaigns: 0,
    totalInfluencers: 0,
    completedProjects: 0,
    totalSpent: 0,
  });
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);
  const [topInfluencers, setTopInfluencers] = useState<Influencer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const { data: statsData } = await api.get('/business/dashboard/stats');
      setStats(statsData);

      // Fetch recent campaigns
      const { data: campaignsData } = await api.get('/business/projects?limit=5');
      setRecentCampaigns(campaignsData.projects);

      // Fetch top influencers
      const { data: influencersData } = await api.get('/business/influencers?limit=5');
      setTopInfluencers(influencersData.influencers);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: 'success',
      draft: 'gray',
      completed: 'info',
      pending: 'warning',
      in_progress: 'primary',
      rejected: 'danger',
    };
    return <Badge variant={variants[status] || 'gray'}>{status.replace('_', ' ')}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
            <div className="flex gap-3">
              <Link href="/business/influencers">
                <Button variant="outline">Find Influencers</Button>
              </Link>
              <Link href="/business/projects/new">
                <Button variant="secondary">Create Campaign</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
                </div>
                <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Influencers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalInfluencers}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedProjects}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                  <p className="text-3xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Campaigns</CardTitle>
                <Link href="/business/projects" className="text-sm text-secondary-600 hover:text-secondary-700">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentCampaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No campaigns yet</p>
                  <Link href="/business/projects/new">
                    <Button className="mt-4" size="sm" variant="secondary">Create Campaign</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{campaign.title}</h3>
                        {getStatusBadge(campaign.status)}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Budget: ${campaign.budget}</span>
                        <span>{campaign.applicants} applicants</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Due: {new Date(campaign.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Influencers */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Working With</CardTitle>
                <Link href="/business/influencers" className="text-sm text-secondary-600 hover:text-secondary-700">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {topInfluencers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No influencers yet</p>
                  <Link href="/business/influencers">
                    <Button className="mt-4" size="sm" variant="outline">Find Influencers</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {topInfluencers.map((influencer) => (
                    <div key={influencer.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{influencer.name}</h3>
                          <p className="text-xs text-gray-500">{influencer.category}</p>
                        </div>
                        {getStatusBadge(influencer.status)}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>{(influencer.followers / 1000).toFixed(1)}K followers</span>
                        <span>{influencer.engagement.toFixed(1)}% engagement</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Campaign Performance Chart Placeholder */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">Performance analytics coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/business/projects/new">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-secondary-500 hover:shadow-md transition-all cursor-pointer">
                  <h3 className="font-semibold text-gray-900 mb-2">Create Campaign</h3>
                  <p className="text-sm text-gray-600">Launch a new influencer campaign</p>
                </div>
              </Link>

              <Link href="/business/influencers">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-secondary-500 hover:shadow-md transition-all cursor-pointer">
                  <h3 className="font-semibold text-gray-900 mb-2">Find Influencers</h3>
                  <p className="text-sm text-gray-600">Search verified influencers</p>
                </div>
              </Link>

              <Link href="/business/analytics">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-secondary-500 hover:shadow-md transition-all cursor-pointer">
                  <h3 className="font-semibold text-gray-900 mb-2">View Analytics</h3>
                  <p className="text-sm text-gray-600">Track campaign performance</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
