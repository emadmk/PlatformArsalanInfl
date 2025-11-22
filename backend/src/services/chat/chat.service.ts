import { Chat, Message, IChat, IMessage } from '@/models/Chat.model';
import { AppError } from '@/middleware/error.middleware';
import { ChatType } from 'shared';
import mongoose from 'mongoose';

export class ChatService {
  async createChat(data: {
    type: ChatType;
    participants: string[];
    projectId?: string;
    name?: string;
  }): Promise<IChat> {
    // Check if chat already exists
    if (data.type === ChatType.DIRECT && data.participants.length === 2) {
      const existingChat = await Chat.findOne({
        type: ChatType.DIRECT,
        participants: { $all: data.participants },
      });

      if (existingChat) {
        return existingChat;
      }
    }

    const chat = new Chat(data);
    await chat.save();

    return chat;
  }

  async getChats(userId: string): Promise<IChat[]> {
    const chats = await Chat.find({
      participants: userId,
      isActive: true,
    })
      .populate('participants', 'firstName lastName avatar role')
      .populate('lastMessage')
      .sort({ lastMessageAt: -1 });

    return chats;
  }

  async getChatById(chatId: string, userId: string): Promise<IChat> {
    const chat = await Chat.findById(chatId)
      .populate('participants', 'firstName lastName avatar role email')
      .populate('projectId', 'title');

    if (!chat) {
      throw new AppError('Chat not found', 404);
    }

    if (!chat.participants.some((p: any) => p._id.toString() === userId)) {
      throw new AppError('Not authorized to view this chat', 403);
    }

    return chat;
  }

  async sendMessage(data: {
    chatId: string;
    senderId: string;
    content: string;
    type?: any;
    attachments?: any[];
  }): Promise<IMessage> {
    const chat = await Chat.findById(data.chatId);

    if (!chat) {
      throw new AppError('Chat not found', 404);
    }

    if (!chat.participants.some((p) => p.toString() === data.senderId)) {
      throw new AppError('Not authorized to send messages in this chat', 403);
    }

    const message = new Message({
      chatId: data.chatId,
      senderId: data.senderId,
      content: data.content,
      type: data.type || 'text',
      attachments: data.attachments || [],
    });

    await message.save();

    // Update chat
    chat.lastMessage = message._id as any;
    chat.lastMessageAt = new Date();

    // Update unread counts
    chat.participants.forEach((participantId) => {
      if (participantId.toString() !== data.senderId) {
        const count = chat.unreadCount.get(participantId.toString()) || 0;
        chat.unreadCount.set(participantId.toString(), count + 1);
      }
    });

    await chat.save();

    return message.populate('senderId', 'firstName lastName avatar');
  }

  async getMessages(
    chatId: string,
    userId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<{ messages: IMessage[]; total: number }> {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new AppError('Chat not found', 404);
    }

    if (!chat.participants.some((p) => p.toString() === userId)) {
      throw new AppError('Not authorized', 403);
    }

    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      Message.find({ chatId, isDeleted: false })
        .populate('senderId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ chatId, isDeleted: false }),
    ]);

    return { messages: messages.reverse(), total };
  }

  async markAsRead(chatId: string, userId: string): Promise<void> {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      throw new AppError('Chat not found', 404);
    }

    // Reset unread count for user
    chat.unreadCount.set(userId, 0);
    await chat.save();

    // Mark messages as read
    await Message.updateMany(
      {
        chatId,
        senderId: { $ne: userId },
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
        $addToSet: { readBy: userId },
      }
    );
  }

  async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    if (message.senderId.toString() !== userId) {
      throw new AppError('Not authorized to delete this message', 403);
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();
  }

  async editMessage(
    messageId: string,
    userId: string,
    newContent: string
  ): Promise<IMessage> {
    const message = await Message.findById(messageId);

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    if (message.senderId.toString() !== userId) {
      throw new AppError('Not authorized to edit this message', 403);
    }

    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    return message;
  }

  async getUnreadCount(userId: string): Promise<number> {
    const chats = await Chat.find({
      participants: userId,
      isActive: true,
    });

    return chats.reduce((total, chat) => {
      return total + (chat.unreadCount.get(userId) || 0);
    }, 0);
  }
}

export default new ChatService();
