import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import config from '@/config';
import { AppError } from '@/middleware/error.middleware';

export class UploadService {
  private uploadDir = path.join(__dirname, '../../../uploads');

  constructor() {
    this.ensureUploadDirs();
  }

  private async ensureUploadDirs() {
    const dirs = ['images', 'documents', 'avatars', 'temp'].map((dir) =>
      path.join(this.uploadDir, dir)
    );

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }
  }

  getMulterConfig(type: 'image' | 'document' | 'any' = 'any'): multer.Multer {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const subDir = type === 'image' ? 'images' : type === 'document' ? 'documents' : 'temp';
        cb(null, path.join(this.uploadDir, subDir));
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = `${uuidv4()}${ext}`;
        cb(null, filename);
      },
    });

    const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (type === 'image') {
        if (config.upload.allowedImageTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new AppError('Invalid image type', 400));
        }
      } else if (type === 'document') {
        if (config.upload.allowedFileTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new AppError('Invalid document type', 400));
        }
      } else {
        cb(null, true);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: config.upload.maxFileSize,
        files: config.upload.maxFiles,
      },
    });
  }

  async processImage(
    filePath: string,
    options: {
      resize?: { width: number; height?: number };
      quality?: number;
      format?: 'jpeg' | 'png' | 'webp';
    } = {}
  ): Promise<string> {
    const ext = options.format || 'jpeg';
    const outputPath = filePath.replace(path.extname(filePath), `.${ext}`);

    let sharpInstance = sharp(filePath);

    if (options.resize) {
      sharpInstance = sharpInstance.resize(options.resize.width, options.resize.height, {
        fit: 'inside',
      });
    }

    switch (ext) {
      case 'jpeg':
        sharpInstance = sharpInstance.jpeg({ quality: options.quality || 85 });
        break;
      case 'png':
        sharpInstance = sharpInstance.png({ quality: options.quality || 85 });
        break;
      case 'webp':
        sharpInstance = sharpInstance.webp({ quality: options.quality || 85 });
        break;
    }

    await sharpInstance.toFile(outputPath);

    // Delete original if different
    if (outputPath !== filePath) {
      await fs.unlink(filePath);
    }

    return outputPath;
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      const fullPath = path.join(this.uploadDir, filePath);
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  }

  async createAvatar(file: Express.Multer.File): Promise<string> {
    const avatarPath = await this.processImage(file.path, {
      resize: { width: 200, height: 200 },
      format: 'webp',
      quality: 80,
    });

    const relativePath = path.relative(this.uploadDir, avatarPath);
    return `/uploads/${relativePath.replace(/\\/g, '/')}`;
  }

  async createThumbnail(file: Express.Multer.File): Promise<{
    original: string;
    thumbnail: string;
  }> {
    // Process original
    const originalPath = await this.processImage(file.path, {
      resize: { width: 1920 },
      format: 'webp',
      quality: 85,
    });

    // Create thumbnail
    const thumbnailPath = originalPath.replace('.webp', '_thumb.webp');
    await sharp(originalPath)
      .resize(400, 300, { fit: 'cover' })
      .webp({ quality: 75 })
      .toFile(thumbnailPath);

    return {
      original: `/uploads/${path.relative(this.uploadDir, originalPath).replace(/\\/g, '/')}`,
      thumbnail: `/uploads/${path.relative(this.uploadDir, thumbnailPath).replace(/\\/g, '/')}`,
    };
  }

  getFileUrl(relativePath: string): string {
    return `${config.frontendUrl}${relativePath}`;
  }
}

export default new UploadService();
