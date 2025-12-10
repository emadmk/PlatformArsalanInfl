'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { DashboardNavbar } from '@/components/shared/DashboardNavbar';
import api from '@/lib/api';

interface SafiraSlot {
  number: number;
  filled: boolean;
  amount: number;
  filledAt?: string;
}

interface SafiraConversion {
  id: string;
  type: string;
  amount: number;
  productName: string;
  slotNumber?: number;
  status: string;
  timestamp: string;
  customerIsNew: boolean;
}

interface PlatformStat {
  platform: string;
  count: number;
  percentage: number;
}

interface SafiraDashboardData {
  overview: {
    referralCode: string;
    referralUrl: string;
    currentCycle: number;
    cycleStartedAt: string;
  };
  slots: {
    total: number;
    filled: number;
    empty: number;
    progress: number;
    details: SafiraSlot[];
  };
  earnings: {
    totalLocked: number;
    totalEarned: number;
    availableBalance: number;
    totalWithdrawn: number;
    amountPerSlot: number;
    potentialEarnings: number;
  };
  stats: {
    totalClicks: number;
    totalPageViews: number;
    totalSignups: number;
    totalConversions: number;
    conversionRate: string;
  };
  activity: {
    lastActivityAt?: string;
    lastConversionAt?: string;
  };
  recentConversions: SafiraConversion[];
  breakdown?: {
    byPlatform?: PlatformStat[];
    byEventType?: Record<string, number>;
  };
}

interface SocialLinks {
  instagram: string;
  tiktok: string;
  youtube: string;
  twitter: string;
  facebook: string;
}

interface SafiraTask {
  id: string;
  title: string;
  description: string;
  action?: string;
  actionUrl?: string;
  completed: boolean;
}

export default function SafiraDashboard() {
  const [data, setData] = useState<SafiraDashboardData | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLinks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [tasks, setTasks] = useState<SafiraTask[]>([
    {
      id: '1',
      title: 'Follow SafiraLux on Instagram',
      description: 'Follow our official Instagram page to get started',
      action: 'Follow Now',
      actionUrl: 'https://www.instagram.com/safiralux.co/',
      completed: false
    },
    {
      id: '2',
      title: 'Share 3 Stories',
      description: 'Post 3 of our promotional videos to your Instagram stories. Download them below and add your referral link!',
      completed: false
    },
    {
      id: '3',
      title: 'Create Your Own Video',
      description: 'Record a short video recommending SafiraLux to your followers. Include your referral link in the story!',
      completed: false
    },
    {
      id: '4',
      title: 'Share Our Video',
      description: 'Repost one of our brand videos to your stories with your referral link',
      completed: false
    },
    {
      id: '5',
      title: 'Story Our Post',
      description: 'Share one of our Instagram posts to your story and tag us',
      completed: false
    },
    {
      id: '6',
      title: 'Explain Our Product',
      description: 'Create content explaining what SafiraLux offers to your audience',
      completed: false
    }
  ]);

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: true } : task
    ));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, linksRes] = await Promise.all([
        api.get('/influencer/safira/dashboard'),
        api.get('/influencer/safira/referral-link'),
      ]);
      setData(dashboardRes.data);
      setSocialLinks(linksRes.data.socialLinks);
    } catch (error) {
      console.error('Failed to fetch Safira dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(platform);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;

    setWithdrawLoading(true);
    try {
      await api.post('/influencer/safira/withdraw', {
        amount: parseFloat(withdrawAmount),
      });
      alert('Withdrawal request submitted! Admin will review and process your request.');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchDashboardData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to submit withdrawal request');
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Data</h2>
            <p className="text-gray-600 mb-4">Please try again later or contact support.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      {/* Page Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold">Safira Luxury Program</h1>
          <p className="text-purple-100 mt-1">Earn $40 for every successful referral</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Start Tasks - How It Works */}
        <Card className="mb-8 border-2 border-purple-200">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-purple-900">Get Started in Minutes!</CardTitle>
                <p className="text-sm text-purple-600 mt-1">Complete these quick tasks to maximize your earnings</p>
              </div>
              <Badge variant="primary">{tasks.filter(t => t.completed).length}/{tasks.length} Done</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {tasks.filter(task => !task.completed).map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex items-center gap-3">
                      {task.actionUrl && (
                        <a
                          href={task.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
                        >
                          {task.action}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      <button
                        onClick={() => handleTaskComplete(task.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-green-500 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Mark as Done
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {tasks.filter(task => !task.completed).length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">All Tasks Completed!</h3>
                  <p className="text-gray-600">Great job! Now share your referral link and start earning.</p>
                </div>
              )}
            </div>

            {/* Training Section Link */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-blue-900">Want to learn more?</h4>
                  <p className="text-sm text-blue-700">Visit our training section for tips on increasing your sales (optional)</p>
                </div>
                <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-100">
                  View Training
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Referral Link Section */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Your Referral Link</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                readOnly
                value={data.overview.referralUrl}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm"
              />
              <Button
                onClick={() => copyToClipboard(data.overview.referralUrl, 'main')}
                variant={copySuccess === 'main' ? 'success' : 'primary'}
              >
                {copySuccess === 'main' ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Referral Code: <span className="font-mono font-semibold">{data.overview.referralCode}</span>
            </p>
          </div>

          {/* Social Media Links */}
          {socialLinks && (
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Copy for Social Platforms</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(socialLinks).map(([platform, link]) => (
                  <button
                    key={platform}
                    onClick={() => copyToClipboard(link, platform)}
                    className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                      copySuccess === platform
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : 'bg-white border-gray-200 hover:border-purple-500 text-gray-700'
                    }`}
                  >
                    {getPlatformIcon(platform)}
                    <span className="text-sm capitalize">
                      {copySuccess === platform ? 'Copied!' : platform}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Slots Progress Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Your Progress</CardTitle>
              <Badge variant={data.slots.filled === data.slots.total ? 'success' : 'primary'}>
                Cycle {data.overview.currentCycle}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{data.slots.filled} of {data.slots.total} slots filled</span>
                <span>{data.slots.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${data.slots.progress}%` }}
                />
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-10 gap-2 mb-6">
              {data.slots.details.map((slot) => (
                <div
                  key={slot.number}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-semibold transition-all ${
                    slot.filled
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-400 border-2 border-dashed border-gray-300'
                  }`}
                  title={slot.filled ? `Filled on ${new Date(slot.filledAt!).toLocaleDateString()}` : 'Empty slot'}
                >
                  {slot.number}
                </div>
              ))}
            </div>

            {/* Slot Legend */}
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-500 to-pink-500" />
                <span className="text-gray-600">Filled (${data.earnings.amountPerSlot} each)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-100 border-2 border-dashed border-gray-300" />
                <span className="text-gray-600">Empty</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <p className="text-purple-100 text-sm mb-1">Total Locked</p>
              <p className="text-3xl font-bold">${data.earnings.totalLocked}</p>
              <p className="text-purple-200 text-xs mt-2">
                {data.slots.empty} slots × ${data.earnings.amountPerSlot}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <p className="text-green-100 text-sm mb-1">Total Earned</p>
              <p className="text-3xl font-bold">${data.earnings.totalEarned}</p>
              <p className="text-green-200 text-xs mt-2">
                {data.slots.filled} conversions
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <p className="text-blue-100 text-sm mb-1">Available Balance</p>
              <p className="text-3xl font-bold">${data.earnings.availableBalance}</p>
              {data.earnings.availableBalance > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-2 border-white text-white hover:bg-white/10"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  Withdraw
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-600 to-gray-700 text-white">
            <CardContent className="p-6">
              <p className="text-gray-300 text-sm mb-1">Total Withdrawn</p>
              <p className="text-3xl font-bold">${data.earnings.totalWithdrawn}</p>
              <p className="text-gray-400 text-xs mt-2">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalPageViews}</p>
              <p className="text-sm text-gray-600">Page Views</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalClicks}</p>
              <p className="text-sm text-gray-600">Click to Pay</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalSignups}</p>
              <p className="text-sm text-gray-600">Signups</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{data.stats.totalConversions}</p>
              <p className="text-sm text-gray-600">Conversions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{data.stats.conversionRate}%</p>
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Platform Breakdown */}
        {data.breakdown?.byPlatform && data.breakdown.byPlatform.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Traffic by Platform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.breakdown.byPlatform.map((platform) => (
                  <div key={platform.platform} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                      {platform.platform || 'Direct'}
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${getPlatformColor(platform.platform)}`}
                          style={{ width: `${platform.percentage}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-semibold text-gray-900">{platform.percentage}%</span>
                      <span className="text-xs text-gray-500 ml-1">({platform.count})</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Conversions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Conversions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentConversions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversions yet</h3>
                <p className="text-gray-600 mb-4">Share your referral link to start earning!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Slot</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Type</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Commission</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentConversions.map((conversion) => (
                      <tr key={conversion.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
                            {conversion.slotNumber || '-'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={conversion.type === 'INVESTMENT' ? 'primary' : 'info'}>
                            {conversion.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{conversion.productName}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-green-600">
                          +${conversion.amount}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={conversion.status === 'CONFIRMED' ? 'success' : 'warning'}>
                            {conversion.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(conversion.timestamp).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Available Balance: <span className="font-semibold text-green-600">${data.earnings.availableBalance}</span>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Withdrawal Amount ($)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={data.earnings.availableBalance}
                  min={1}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowWithdrawModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleWithdraw}
                  isLoading={withdrawLoading}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > data.earnings.availableBalance}
                >
                  Submit Request
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Withdrawal requests are reviewed by admin before processing
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper function for platform colors
function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    instagram: 'bg-gradient-to-r from-purple-500 to-pink-500',
    tiktok: 'bg-black',
    youtube: 'bg-red-500',
    twitter: 'bg-blue-400',
    facebook: 'bg-blue-600',
    direct: 'bg-gray-500',
  };
  return colors[platform?.toLowerCase()] || 'bg-purple-500';
}

// Helper function for platform icons
function getPlatformIcon(platform: string) {
  const icons: Record<string, JSX.Element> = {
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    tiktok: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
    youtube: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  };
  return icons[platform] || null;
}
