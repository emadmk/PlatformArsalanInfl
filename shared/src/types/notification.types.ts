import { z } from 'zod';

export enum NotificationType {
  PROJECT_CREATED = 'project_created',
  PROJECT_APPROVED = 'project_approved',
  PROJECT_REJECTED = 'project_rejected',
  APPLICATION_RECEIVED = 'application_received',
  APPLICATION_ACCEPTED = 'application_accepted',
  APPLICATION_REJECTED = 'application_rejected',
  TASK_ASSIGNED = 'task_assigned',
  TASK_SUBMITTED = 'task_submitted',
  TASK_APPROVED = 'task_approved',
  TASK_REJECTED = 'task_rejected',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_SENT = 'payment_sent',
  WITHDRAWAL_APPROVED = 'withdrawal_approved',
  WITHDRAWAL_REJECTED = 'withdrawal_rejected',
  NEW_MESSAGE = 'new_message',
  CONTRACT_SIGNED = 'contract_signed',
  ACCOUNT_VERIFIED = 'account_verified',
  ACCOUNT_BANNED = 'account_banned',
}

// Notification Schema
export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.nativeEnum(NotificationType),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  readAt: z.date().optional(),
  link: z.string().optional(),
  createdAt: z.date(),
});

export type Notification = z.infer<typeof NotificationSchema>;

// Push Notification Payload
export const PushNotificationPayloadSchema = z.object({
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(),
  url: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
});

export type PushNotificationPayload = z.infer<typeof PushNotificationPayloadSchema>;
