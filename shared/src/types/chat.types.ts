import { z } from 'zod';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  CONTRACT = 'contract',
  SYSTEM = 'system',
}

export enum ChatType {
  DIRECT = 'direct',
  PROJECT = 'project',
  SUPPORT = 'support',
}

// Message Schema
export const MessageSchema = z.object({
  id: z.string(),
  chatId: z.string(),
  senderId: z.string(),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  content: z.string(),
  attachments: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
  })).optional(),
  metadata: z.record(z.any()).optional(),
  isRead: z.boolean().default(false),
  readBy: z.array(z.string()).default([]),
  readAt: z.date().optional(),
  isEdited: z.boolean().default(false),
  editedAt: z.date().optional(),
  isDeleted: z.boolean().default(false),
  deletedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;

// Chat Schema
export const ChatSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ChatType).default(ChatType.DIRECT),
  participants: z.array(z.string()).min(2),
  projectId: z.string().optional(),
  name: z.string().optional(),
  avatar: z.string().optional(),
  lastMessage: MessageSchema.optional(),
  lastMessageAt: z.date().optional(),
  unreadCount: z.record(z.number()).default({}),
  isActive: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Chat = z.infer<typeof ChatSchema>;

// Typing Indicator Schema
export const TypingIndicatorSchema = z.object({
  chatId: z.string(),
  userId: z.string(),
  userName: z.string(),
  timestamp: z.date(),
});

export type TypingIndicator = z.infer<typeof TypingIndicatorSchema>;
