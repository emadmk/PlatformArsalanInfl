import { Task, ITask } from '@/models/Task.model';
import { Project } from '@/models/Project.model';
import { User } from '@/models/User.model';
import { AppError } from '@/middleware/error.middleware';
import { TaskStatus, ProjectStatus } from 'shared';
import walletService from '../payment/wallet.service';
import config from '@/config';

export class TaskService {
  async createTask(taskData: Partial<ITask>): Promise<ITask> {
    const project = await Project.findById(taskData.projectId);

    if (!project) {
      throw new AppError('Project not found', 404);
    }

    if (!project.acceptedInfluencers.includes(taskData.influencerId as any)) {
      throw new AppError('Influencer not accepted for this project', 403);
    }

    const task = new Task(taskData);
    await task.save();

    // Lock funds for this task
    await walletService.lockFunds(
      project.businessId.toString(),
      task.amount,
      task._id.toString()
    );

    return task;
  }

  async getTasks(filters: {
    projectId?: string;
    influencerId?: string;
    status?: TaskStatus;
    page?: number;
    limit?: number;
  }): Promise<{ tasks: ITask[]; total: number }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (filters.projectId) query.projectId = filters.projectId;
    if (filters.influencerId) query.influencerId = filters.influencerId;
    if (filters.status) query.status = filters.status;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('projectId', 'title budget businessId')
        .populate('influencerId', 'firstName lastName avatar')
        .sort({ deadline: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Task.countDocuments(query),
    ]);

    return { tasks, total };
  }

  async getTaskById(taskId: string): Promise<ITask> {
    const task = await Task.findById(taskId)
      .populate('projectId')
      .populate('influencerId', 'firstName lastName avatar email')
      .populate('review.reviewedBy', 'firstName lastName');

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    return task;
  }

  async updateTask(
    taskId: string,
    influencerId: string,
    updates: Partial<ITask>
  ): Promise<ITask> {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.influencerId.toString() !== influencerId) {
      throw new AppError('Not authorized', 403);
    }

    // Only allow updating certain fields
    const allowedUpdates: (keyof ITask)[] = ['submittedWork', 'deliverables'];
    const updateKeys = Object.keys(updates) as (keyof ITask)[];

    updateKeys.forEach((key) => {
      if (allowedUpdates.includes(key)) {
        (task as any)[key] = updates[key];
      }
    });

    await task.save();

    return task;
  }

  async submitTask(
    taskId: string,
    influencerId: string,
    submission: {
      links: string[];
      screenshots: string[];
      notes?: string;
    }
  ): Promise<ITask> {
    const task = await Task.findById(taskId);

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    if (task.influencerId.toString() !== influencerId) {
      throw new AppError('Not authorized', 403);
    }

    if (task.status === TaskStatus.COMPLETED) {
      throw new AppError('Task already completed', 400);
    }

    task.submittedWork = {
      ...submission,
      submittedAt: new Date(),
    };
    task.status = TaskStatus.UNDER_REVIEW;

    await task.save();

    return task;
  }

  async reviewTask(
    taskId: string,
    reviewerId: string,
    review: {
      approved: boolean;
      rating?: number;
      feedback?: string;
    }
  ): Promise<ITask> {
    const task = await Task.findById(taskId).populate('projectId');

    if (!task) {
      throw new AppError('Task not found', 404);
    }

    const project = task.projectId as any;

    if (project.businessId.toString() !== reviewerId) {
      throw new AppError('Not authorized to review this task', 403);
    }

    if (review.approved) {
      task.status = TaskStatus.APPROVED;
      task.completedAt = new Date();

      // Calculate commission
      const commissionRate = config.commission.defaultRate / 100;
      const commission = task.amount * commissionRate;
      const influencerAmount = task.amount - commission;

      // Release funds to influencer
      await walletService.unlockFunds(
        reviewerId,
        task.amount,
        task._id.toString()
      );

      await walletService.transferFunds(
        reviewerId,
        task.influencerId.toString(),
        influencerAmount,
        'Task payment',
        { taskId: task._id.toString(), commission }
      );

      // Update influencer stats
      await User.findByIdAndUpdate(task.influencerId, {
        $inc: {
          'profile.totalProjects': 1,
        },
      });
    } else {
      task.status = TaskStatus.REJECTED;
    }

    task.review = {
      approved: review.approved,
      rating: review.rating,
      feedback: review.feedback,
      reviewedBy: reviewerId as any,
      reviewedAt: new Date(),
    };

    await task.save();

    return task;
  }

  async getTasksByDeadline(
    influencerId: string,
    days: number = 7
  ): Promise<ITask[]> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return Task.find({
      influencerId,
      status: { $in: [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS] },
      deadline: { $lte: endDate },
    })
      .populate('projectId', 'title businessId')
      .sort({ deadline: 1 });
  }

  async getOverdueTasks(influencerId: string): Promise<ITask[]> {
    return Task.find({
      influencerId,
      status: { $in: [TaskStatus.ASSIGNED, TaskStatus.IN_PROGRESS] },
      deadline: { $lt: new Date() },
    })
      .populate('projectId', 'title businessId')
      .sort({ deadline: 1 });
  }
}

export default new TaskService();
