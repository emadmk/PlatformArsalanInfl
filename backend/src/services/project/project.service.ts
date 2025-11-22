import { Project, IProject } from '@/models/Project.model';
import { User } from '@/models/User.model';
import { AppError } from '@/middleware/error.middleware';
import { ProjectStatus } from '@shared/types';
import mongoose from 'mongoose';
import { getElasticsearchClient } from '@/config/database';

export class ProjectService {
  async createProject(
    businessId: string,
    projectData: Partial<IProject>
  ): Promise<IProject> {
    const business = await User.findById(businessId);

    if (!business || business.role !== 'business') {
      throw new AppError('Only businesses can create projects', 403);
    }

    const project = new Project({
      ...projectData,
      businessId,
      status: ProjectStatus.PENDING_APPROVAL,
    });

    await project.save();

    // Index in Elasticsearch
    await this.indexProjectInElasticsearch(project);

    return project;
  }

  async getProjects(filters: {
    status?: ProjectStatus;
    category?: string;
    businessId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ projects: IProject[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.category) query.category = filters.category;
    if (filters.businessId) query.businessId = filters.businessId;
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } },
      ];
    }

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('businessId', 'firstName lastName profile.companyName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(query),
    ]);

    return { projects, total };
  }

  async getProjectById(projectId: string): Promise<IProject> {
    const project = await Project.findById(projectId)
      .populate('businessId', 'firstName lastName profile.companyName avatar email')
      .populate('appliedInfluencers', 'firstName lastName avatar profile')
      .populate('acceptedInfluencers', 'firstName lastName avatar profile');

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    return project;
  }

  async updateProject(
    projectId: string,
    businessId: string,
    updates: Partial<IProject>
  ): Promise<IProject> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.businessId.toString() !== businessId) {
      throw new AppError('Not authorized to update this project', 403);
    }

    // Don't allow updating certain fields
    delete updates.businessId;
    delete updates.appliedInfluencers;
    delete updates.acceptedInfluencers;

    Object.assign(project, updates);
    await project.save();

    // Update in Elasticsearch
    await this.indexProjectInElasticsearch(project);

    return project;
  }

  async deleteProject(projectId: string, businessId: string): Promise<void> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.businessId.toString() !== businessId) {
      throw new AppError('Not authorized to delete this project', 403);
    }

    if (project.status === ProjectStatus.IN_PROGRESS) {
      throw new AppError('Cannot delete project in progress', 400);
    }

    await project.deleteOne();

    // Remove from Elasticsearch
    await this.removeProjectFromElasticsearch(projectId);
  }

  async applyToProject(projectId: string, influencerId: string): Promise<IProject> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.status !== ProjectStatus.APPROVED) {
      throw new AppError('Project is not accepting applications', 400);
    }

    if (project.appliedInfluencers.includes(influencerId as any)) {
      throw new AppError('Already applied to this project', 400);
    }

    if (
      project.maxInfluencers &&
      project.acceptedInfluencers.length >= project.maxInfluencers
    ) {
      throw new AppError('Project has reached maximum influencers', 400);
    }

    project.appliedInfluencers.push(influencerId as any);
    await project.save();

    return project;
  }

  async acceptInfluencer(
    projectId: string,
    businessId: string,
    influencerId: string
  ): Promise<IProject> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.businessId.toString() !== businessId) {
      throw new AppError('Not authorized', 403);
    }

    if (!project.appliedInfluencers.includes(influencerId as any)) {
      throw new AppError('Influencer has not applied', 400);
    }

    if (project.acceptedInfluencers.includes(influencerId as any)) {
      throw new AppError('Influencer already accepted', 400);
    }

    project.acceptedInfluencers.push(influencerId as any);
    await project.save();

    return project;
  }

  async rejectInfluencer(
    projectId: string,
    businessId: string,
    influencerId: string
  ): Promise<IProject> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (project.businessId.toString() !== businessId) {
      throw new AppError('Not authorized', 403);
    }

    project.appliedInfluencers = project.appliedInfluencers.filter(
      (id) => id.toString() !== influencerId
    );

    await project.save();

    return project;
  }

  async approveProject(projectId: string, adminId: string): Promise<IProject> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    project.status = ProjectStatus.APPROVED;
    await project.save();

    return project;
  }

  async rejectProject(
    projectId: string,
    adminId: string,
    reason: string
  ): Promise<IProject> {
    const project = await Project.findById(projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    project.status = ProjectStatus.REJECTED;
    project.rejectionReason = reason;
    await project.save();

    return project;
  }

  async searchProjects(query: {
    keywords?: string;
    category?: string;
    minBudget?: number;
    maxBudget?: number;
    platforms?: string[];
    regions?: string[];
    page?: number;
    limit?: number;
  }): Promise<{ projects: IProject[]; total: number }> {
    const esClient = getElasticsearchClient();

    const must: any[] = [{ term: { status: ProjectStatus.APPROVED } }];

    if (query.keywords) {
      must.push({
        multi_match: {
          query: query.keywords,
          fields: ['title^3', 'description^2', 'tags'],
        },
      });
    }

    if (query.category) {
      must.push({ term: { category: query.category } });
    }

    if (query.minBudget || query.maxBudget) {
      must.push({
        range: {
          budget: {
            ...(query.minBudget && { gte: query.minBudget }),
            ...(query.maxBudget && { lte: query.maxBudget }),
          },
        },
      });
    }

    if (query.platforms && query.platforms.length > 0) {
      must.push({
        terms: { 'requirements.platforms': query.platforms },
      });
    }

    if (query.regions && query.regions.length > 0) {
      must.push({
        terms: { 'requirements.regions': query.regions },
      });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;

    try {
      const result = await esClient.search({
        index: 'projects',
        body: {
          query: { bool: { must } },
          from: (page - 1) * limit,
          size: limit,
          sort: [{ createdAt: 'desc' }],
        },
      });

      const projectIds = result.hits.hits.map((hit: any) => hit._id);
      const projects = await Project.find({ _id: { $in: projectIds } })
        .populate('businessId', 'firstName lastName profile.companyName avatar');

      return {
        projects,
        total: (result.hits.total as any).value,
      };
    } catch (error) {
      // Fallback to MongoDB if Elasticsearch fails
      return this.getProjects({
        ...query,
        status: ProjectStatus.APPROVED,
      });
    }
  }

  private async indexProjectInElasticsearch(project: IProject): Promise<void> {
    try {
      const esClient = getElasticsearchClient();

      await esClient.index({
        index: 'projects',
        id: project._id.toString(),
        document: {
          title: project.title,
          description: project.description,
          category: project.category,
          tags: project.tags,
          budget: project.budget,
          status: project.status,
          requirements: project.requirements,
          createdAt: project.createdAt,
        },
      });
    } catch (error) {
      // Log error but don't fail the operation
      console.error('Failed to index project in Elasticsearch:', error);
    }
  }

  private async removeProjectFromElasticsearch(projectId: string): Promise<void> {
    try {
      const esClient = getElasticsearchClient();
      await esClient.delete({
        index: 'projects',
        id: projectId,
      });
    } catch (error) {
      console.error('Failed to remove project from Elasticsearch:', error);
    }
  }
}

export default new ProjectService();
