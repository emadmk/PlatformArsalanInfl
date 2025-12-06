'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { BusinessNavbar } from '@/components/shared/BusinessNavbar';
import api from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MessageCircle,
  Eye,
} from 'lucide-react';

interface Influencer {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  profile?: {
    socialMedia?: {
      totalFollowers: number;
      averageEngagement: number;
    };
    categories?: string[];
  };
}

interface Project {
  _id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: string;
  maxInfluencers: number;
  acceptedInfluencers: Influencer[];
  appliedInfluencers: Influencer[];
  rejectedInfluencers: string[];
  requirements?: {
    categories: string[];
    platforms: string[];
    minFollowers: number;
  };
  deliverables?: string;
  guidelines?: string;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchProject();
    }
  }, [params.id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/projects/${params.id}`);
      setProject(data.project);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptInfluencer = async (influencerId: string) => {
    try {
      setActionLoading(influencerId);
      await api.post(`/business/projects/${params.id}/influencers/${influencerId}/accept`);
      fetchProject();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to accept influencer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectInfluencer = async (influencerId: string) => {
    try {
      setActionLoading(influencerId);
      await api.post(`/business/projects/${params.id}/influencers/${influencerId}/reject`);
      fetchProject();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject influencer');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'gray'> = {
      active: 'success',
      draft: 'gray',
      completed: 'info',
      pending: 'warning',
      in_progress: 'primary',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status] || 'gray'}>{status.replace('_', ' ')}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFollowers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

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

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50">
        <BusinessNavbar />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist.</p>
          <Link href="/business/projects">
            <Button variant="secondary">Back to Projects</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pendingApplicants = project.appliedInfluencers?.filter(
    (inf) => !project.acceptedInfluencers?.some((a) => a._id === inf._id) &&
             !project.rejectedInfluencers?.includes(inf._id)
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <BusinessNavbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </button>

        {/* Project Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
                  {getStatusBadge(project.status)}
                </div>
                <p className="text-gray-600 mb-4">{project.description}</p>

                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    <span className="font-semibold text-green-600">{formatCurrency(project.budget)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Due: {formatDate(project.deadline)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{project.acceptedInfluencers?.length || 0}/{project.maxInfluencers} spots filled</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Created: {formatDate(project.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/business/projects/${project._id}/edit`}>
                  <Button variant="outline">Edit</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pending Applicants */}
            <Card>
              <CardHeader>
                <CardTitle>Pending Applicants ({pendingApplicants.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingApplicants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending applicants</p>
                ) : (
                  <div className="space-y-4">
                    {pendingApplicants.map((influencer) => (
                      <div key={influencer._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {influencer.avatar ? (
                            <img src={influencer.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
                              {influencer.firstName?.charAt(0)}{influencer.lastName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {influencer.firstName} {influencer.lastName}
                            </h4>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>{formatFollowers(influencer.profile?.socialMedia?.totalFollowers || 0)} followers</span>
                              <span>{(influencer.profile?.socialMedia?.averageEngagement || 0).toFixed(1)}% engagement</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/business/influencers/${influencer._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejectInfluencer(influencer._id)}
                            disabled={actionLoading === influencer._id}
                            className="text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleAcceptInfluencer(influencer._id)}
                            disabled={actionLoading === influencer._id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Accepted Influencers */}
            <Card>
              <CardHeader>
                <CardTitle>Accepted Influencers ({project.acceptedInfluencers?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent>
                {!project.acceptedInfluencers || project.acceptedInfluencers.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No accepted influencers yet</p>
                ) : (
                  <div className="space-y-4">
                    {project.acceptedInfluencers.map((influencer) => (
                      <div key={influencer._id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          {influencer.avatar ? (
                            <img src={influencer.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white font-semibold">
                              {influencer.firstName?.charAt(0)}{influencer.lastName?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {influencer.firstName} {influencer.lastName}
                            </h4>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>{formatFollowers(influencer.profile?.socialMedia?.totalFollowers || 0)} followers</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/business/messages?userId=${influencer._id}`}>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Chat
                            </Button>
                          </Link>
                          <Link href={`/business/influencers/${influencer._id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Profile
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requirements */}
            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.requirements?.categories && project.requirements.categories.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.requirements.categories.map((cat, i) => (
                        <Badge key={i} variant="primary">{cat}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {project.requirements?.platforms && project.requirements.platforms.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Platforms</h4>
                    <div className="flex flex-wrap gap-2">
                      {project.requirements.platforms.map((platform, i) => (
                        <Badge key={i} variant="info">{platform}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {project.requirements?.minFollowers && project.requirements.minFollowers > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Min Followers</h4>
                    <p className="text-gray-900">{formatFollowers(project.requirements.minFollowers)}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Deliverables */}
            {project.deliverables && (
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-wrap">{project.deliverables}</p>
                </CardContent>
              </Card>
            )}

            {/* Guidelines */}
            {project.guidelines && (
              <Card>
                <CardHeader>
                  <CardTitle>Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 whitespace-pre-wrap">{project.guidelines}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
