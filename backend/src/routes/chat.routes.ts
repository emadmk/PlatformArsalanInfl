import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth.middleware';
import chatService from '@/services/chat/chat.service';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all chats for user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const chats = await chatService.getChats(req.user!.id);
    res.json({ chats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single chat
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const chat = await chatService.getChatById(req.params.id, req.user!.id);
    res.json({ chat });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Create new chat
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const chat = await chatService.createChat({
      type: req.body.type || 'direct', // Default to direct chat
      participants: [req.user!.id, ...req.body.participants],
      projectId: req.body.projectId,
      name: req.body.name,
    });

    // Populate participants before returning
    await chat.populate('participants', 'firstName lastName avatar role');

    res.status(201).json({ chat });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get messages in chat
router.get('/:id/messages', async (req: AuthRequest, res: Response) => {
  try {
    const { messages, total } = await chatService.getMessages(
      req.params.id,
      req.user!.id,
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 50
    );

    res.json({ messages, total });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Send message
router.post('/:id/messages', async (req: AuthRequest, res: Response) => {
  try {
    const message = await chatService.sendMessage({
      chatId: req.params.id,
      senderId: req.user!.id,
      ...req.body,
    });

    res.status(201).json({ message });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Mark chat as read
router.post('/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await chatService.markAsRead(req.params.id, req.user!.id);
    res.json({ message: 'Marked as read' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Delete message
router.delete('/messages/:messageId', async (req: AuthRequest, res: Response) => {
  try {
    await chatService.deleteMessage(req.params.messageId, req.user!.id);
    res.json({ message: 'Message deleted' });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Edit message
router.put('/messages/:messageId', async (req: AuthRequest, res: Response) => {
  try {
    const message = await chatService.editMessage(
      req.params.messageId,
      req.user!.id,
      req.body.content
    );

    res.json({ message });
  } catch (error: any) {
    res.status(error.statusCode || 500).json({ error: error.message });
  }
});

// Get unread count
router.get('/unread/count', async (req: AuthRequest, res: Response) => {
  try {
    const count = await chatService.getUnreadCount(req.user!.id);
    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
