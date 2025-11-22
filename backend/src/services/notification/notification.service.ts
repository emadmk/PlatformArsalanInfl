import { Notification, INotification } from '@/models/Notification.model';
import { User } from '@/models/User.model';
import { NotificationType } from '@shared/types';
import * as OneSignal from 'onesignal-node';
import nodemailer from 'nodemailer';
import config from '@/config';

const oneSignalClient = new OneSignal.Client(
  config.oneSignal.appId || '',
  config.oneSignal.restApiKey || ''
);

export class NotificationService {
  private emailTransporter: nodemailer.Transporter;

  constructor() {
    this.emailTransporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    link?: string;
  }): Promise<INotification> {
    const notification = new Notification(data);
    await notification.save();

    // Send push notification
    await this.sendPushNotification(data.userId, {
      title: data.title,
      message: data.message,
      data: data.data,
      url: data.link,
    });

    return notification;
  }

  async getNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ userId }),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return { notifications, total, unreadCount };
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() }
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
  }

  async sendPushNotification(
    userId: string,
    payload: {
      title: string;
      message: string;
      data?: any;
      url?: string;
      icon?: string;
    }
  ): Promise<void> {
    try {
      if (!config.oneSignal.appId || !config.oneSignal.restApiKey) {
        console.log('OneSignal not configured');
        return;
      }

      const notification = {
        contents: { en: payload.message },
        headings: { en: payload.title },
        include_external_user_ids: [userId],
        ...(payload.url && { url: payload.url }),
        ...(payload.data && { data: payload.data }),
        ...(payload.icon && { large_icon: payload.icon }),
      };

      await oneSignalClient.createNotification(notification);
    } catch (error) {
      console.error('Failed to send push notification:', error);
    }
  }

  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    try {
      await this.emailTransporter.sendMail({
        from: config.email.from,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''),
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  async sendProjectApprovedNotification(userId: string, projectTitle: string) {
    await this.createNotification({
      userId,
      type: NotificationType.PROJECT_APPROVED,
      title: 'Project Approved',
      message: `Your project "${projectTitle}" has been approved and is now visible to influencers.`,
      link: '/business/projects',
    });

    const user = await User.findById(userId);
    if (user && user.email) {
      await this.sendEmail(
        user.email,
        'Project Approved',
        `<h2>Good news!</h2><p>Your project "${projectTitle}" has been approved.</p>`
      );
    }
  }

  async sendTaskAssignedNotification(userId: string, taskTitle: string, projectTitle: string) {
    await this.createNotification({
      userId,
      type: NotificationType.TASK_ASSIGNED,
      title: 'New Task Assigned',
      message: `You have been assigned a new task: "${taskTitle}" for project "${projectTitle}".`,
      link: '/influencer/tasks',
    });
  }

  async sendPaymentReceivedNotification(userId: string, amount: number) {
    await this.createNotification({
      userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Payment Received',
      message: `You have received a payment of $${amount} USDT.`,
      link: '/influencer/earnings',
    });
  }

  async sendApplicationReceivedNotification(
    userId: string,
    influencerName: string,
    projectTitle: string
  ) {
    await this.createNotification({
      userId,
      type: NotificationType.APPLICATION_RECEIVED,
      title: 'New Application',
      message: `${influencerName} has applied to your project "${projectTitle}".`,
      link: '/business/projects',
    });
  }
}

export default new NotificationService();
