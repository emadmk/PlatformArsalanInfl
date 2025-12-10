'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { DashboardNavbar } from '@/components/shared/DashboardNavbar';
import api from '@/lib/api';

interface DashboardStats {
  activeProjects: number;
  completedTasks: number;
  totalEarnings: number;
  pendingPayments: number;
}

interface Project {
  id: string;
  title: string;
  status: string;
  budget: number;
  deadline: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  reward: number;
  projectTitle: string;
}

export default function InfluencerDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    completedTasks: 0,
    totalEarnings: 0,
    pendingPayments: 0,
  });
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch dashboard stats
      const { data: statsData } = await api.get('/influencer/dashboard/stats');
      setStats({
        activeProjects: statsData.activeProjects || 0,
        completedTasks: statsData.completedTasks || 0,
        totalEarnings: statsData.totalEarnings || 0,
        pendingPayments: statsData.pendingPayments || 0,
      });

      // Fetch recent projects
      try {
        const { data: projectsData } = await api.get('/influencer/projects?limit=5');
        setRecentProjects(projectsData.projects || []);
      } catch (err) {
        // Projects not available, keep empty
      }

      // Fetch recent tasks
      try {
        const { data: tasksData } = await api.get('/influencer/tasks?limit=5');
        setRecentTasks(tasksData.tasks || []);
      } catch (err) {
        // Tasks not available, keep empty
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      // Keep default values on error
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      active: 'success',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Safira Balance Card */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold mb-1">Safira Luxury Program</h2>
              <p className="text-purple-100 text-sm">Your potential earnings from referrals</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-4xl font-bold">$800</p>
                <p className="text-purple-200 text-sm">Available Balance</p>
              </div>
              <Link href="/dashboard/safira">
                <Button className="bg-white text-purple-600 hover:bg-purple-50 px-6 py-3 font-semibold">
                  Withdraw Now
                  <svg className="ml-2 w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Active Projects</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeProjects}</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Completed Tasks</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.completedTasks}</p>
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
                  <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-gray-900">${stats.totalEarnings.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
                  <p className="text-3xl font-bold text-gray-900">${stats.pendingPayments.toFixed(2)}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Projects */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Projects</CardTitle>
                <Link href="/dashboard/projects" className="text-sm text-primary-600 hover:text-primary-700">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No projects yet</p>
                  <Link href="/dashboard/projects">
                    <Button className="mt-4" size="sm">Browse Projects</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProjects.map((project) => (
                    <div key={project.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        {getStatusBadge(project.status)}
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span>Budget: ${project.budget}</span>
                        <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {recentTasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <div key={task.id} className="border-b border-gray-200 pb-4 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{task.title}</h3>
                          <p className="text-xs text-gray-500">{task.projectTitle}</p>
                        </div>
                        {getStatusBadge(task.status)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Reward: ${task.reward}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/dashboard/safira">
                <div className="p-4 border-2 border-purple-200 bg-purple-50 rounded-lg hover:border-purple-500 hover:shadow-md transition-all cursor-pointer">
                  <h3 className="font-semibold text-purple-900 mb-2">Safira Program</h3>
                  <p className="text-sm text-purple-600">Earn $40 per referral</p>
                </div>
              </Link>

              <Link href="/dashboard/projects">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer">
                  <h3 className="font-semibold text-gray-900 mb-2">Browse Projects</h3>
                  <p className="text-sm text-gray-600">Find new collaboration opportunities</p>
                </div>
              </Link>

              <Link href="/dashboard/wallet">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all cursor-pointer">
                  <h3 className="font-semibold text-gray-900 mb-2">Manage Wallet</h3>
                  <p className="text-sm text-gray-600">View balance and withdraw funds</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
