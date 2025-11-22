import { Router, Response } from 'express';
import { AuthRequest, authenticateToken } from '@/middleware/auth.middleware';
import uploadService from '@/services/upload/upload.service';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Upload avatar
router.post('/avatar', async (req: AuthRequest, res: Response) => {
  try {
    const upload = uploadService.getMulterConfig('image').single('avatar');

    upload(req as any, res as any, async (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const avatarUrl = await uploadService.createAvatar(req.file);

      res.json({ url: avatarUrl });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image
router.post('/image', async (req: AuthRequest, res: Response) => {
  try {
    const upload = uploadService.getMulterConfig('image').single('image');

    upload(req as any, res as any, async (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const { original, thumbnail } = await uploadService.createThumbnail(req.file);

      res.json({ original, thumbnail });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple images
router.post('/images', async (req: AuthRequest, res: Response) => {
  try {
    const upload = uploadService.getMulterConfig('image').array('images', 10);

    upload(req as any, res as any, async (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (!req.files || !Array.isArray(req.files)) {
        res.status(400).json({ error: 'No files uploaded' });
        return;
      }

      const results = await Promise.all(
        req.files.map((file) => uploadService.createThumbnail(file))
      );

      res.json({ images: results });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Upload document
router.post('/document', async (req: AuthRequest, res: Response) => {
  try {
    const upload = uploadService.getMulterConfig('document').single('document');

    upload(req as any, res as any, async (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const url = `/uploads/documents/${req.file.filename}`;

      res.json({ url, name: req.file.originalname, size: req.file.size });
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete file
router.delete('/', async (req: AuthRequest, res: Response) => {
  try {
    const { filePath } = req.body;

    if (!filePath) {
      res.status(400).json({ error: 'File path required' });
      return;
    }

    await uploadService.deleteFile(filePath);

    res.json({ message: 'File deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
