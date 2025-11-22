import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import config from '@/config';
import chatService from '@/services/chat/chat.service';
import logger from '@/config/logger';

interface AuthSocket extends Socket {
  userId?: string;
}

export const setupSocketHandlers = (io: Server) => {
  // Authentication middleware
  io.use((socket: AuthSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, config.jwt.secret) as any;
      socket.userId = decoded.id;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthSocket) => {
    const userId = socket.userId!;

    logger.info(`User connected: ${userId} (${socket.id})`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // ===== Chat Events =====

    // Join a chat room
    socket.on('chat:join', async (chatId: string) => {
      try {
        // Verify user is participant
        const chat = await chatService.getChatById(chatId, userId);
        socket.join(`chat:${chatId}`);

        logger.info(`User ${userId} joined chat ${chatId}`);

        socket.emit('chat:joined', { chatId });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Leave a chat room
    socket.on('chat:leave', (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      logger.info(`User ${userId} left chat ${chatId}`);
    });

    // Send message
    socket.on('chat:message', async (data: {
      chatId: string;
      content: string;
      type?: string;
      attachments?: any[];
    }) => {
      try {
        const message = await chatService.sendMessage({
          chatId: data.chatId,
          senderId: userId,
          content: data.content,
          type: data.type,
          attachments: data.attachments,
        });

        // Emit to all participants in the chat
        io.to(`chat:${data.chatId}`).emit('chat:message', message);

        // Send notification to other participants
        const chat = await chatService.getChatById(data.chatId, userId);
        chat.participants.forEach((participant: any) => {
          if (participant._id.toString() !== userId) {
            io.to(`user:${participant._id}`).emit('notification:new', {
              type: 'new_message',
              chatId: data.chatId,
              message: message,
            });
          }
        });

        logger.info(`Message sent in chat ${data.chatId} by ${userId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Typing indicator
    socket.on('chat:typing', async (data: { chatId: string; isTyping: boolean }) => {
      try {
        socket.to(`chat:${data.chatId}`).emit('chat:typing', {
          userId,
          chatId: data.chatId,
          isTyping: data.isTyping,
        });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Mark messages as read
    socket.on('chat:read', async (chatId: string) => {
      try {
        await chatService.markAsRead(chatId, userId);

        // Notify sender that messages were read
        socket.to(`chat:${chatId}`).emit('chat:read', {
          chatId,
          userId,
        });

        logger.info(`Messages marked as read in chat ${chatId} by ${userId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Delete message
    socket.on('chat:delete-message', async (messageId: string) => {
      try {
        await chatService.deleteMessage(messageId, userId);

        // Notify all participants
        io.emit('chat:message-deleted', { messageId });

        logger.info(`Message ${messageId} deleted by ${userId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Edit message
    socket.on('chat:edit-message', async (data: {
      messageId: string;
      content: string;
    }) => {
      try {
        const message = await chatService.editMessage(
          data.messageId,
          userId,
          data.content
        );

        // Notify all participants
        io.emit('chat:message-edited', message);

        logger.info(`Message ${data.messageId} edited by ${userId}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // ===== Notification Events =====

    // Mark notification as read
    socket.on('notification:read', (notificationId: string) => {
      // Implementation would go here
      socket.emit('notification:read-confirmed', { notificationId });
    });

    // ===== Project Events =====

    // Join project updates
    socket.on('project:subscribe', (projectId: string) => {
      socket.join(`project:${projectId}`);
      logger.info(`User ${userId} subscribed to project ${projectId}`);
    });

    // Unsubscribe from project
    socket.on('project:unsubscribe', (projectId: string) => {
      socket.leave(`project:${projectId}`);
      logger.info(`User ${userId} unsubscribed from project ${projectId}`);
    });

    // ===== Task Events =====

    // Join task updates
    socket.on('task:subscribe', (taskId: string) => {
      socket.join(`task:${taskId}`);
      logger.info(`User ${userId} subscribed to task ${taskId}`);
    });

    // Unsubscribe from task
    socket.on('task:unsubscribe', (taskId: string) => {
      socket.leave(`task:${taskId}`);
      logger.info(`User ${userId} unsubscribed from task ${taskId}`);
    });

    // ===== Generic Events =====

    // Ping/Pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${userId} (${socket.id})`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${userId}:`, error);
    });
  });

  return io;
};

// Helper function to emit to specific user
export const emitToUser = (io: Server, userId: string, event: string, data: any) => {
  io.to(`user:${userId}`).emit(event, data);
};

// Helper function to emit to chat
export const emitToChat = (io: Server, chatId: string, event: string, data: any) => {
  io.to(`chat:${chatId}`).emit(event, data);
};

// Helper function to emit to project
export const emitToProject = (io: Server, projectId: string, event: string, data: any) => {
  io.to(`project:${projectId}`).emit(event, data);
};

export default setupSocketHandlers;
