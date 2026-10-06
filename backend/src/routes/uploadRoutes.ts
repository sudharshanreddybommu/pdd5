import { Router, Request, Response } from 'express';
import { uploadMiddleware, processUploadedFile } from '../utils/uploader.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.post('/single', uploadMiddleware.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file uploaded.' });
      return;
    }

    const url = await processUploadedFile(req.file);
    res.json({
      success: true,
      url,
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'File upload failed.', error: err.message });
  }
});

router.post('/screening-views', uploadMiddleware.fields([
  { name: 'front', maxCount: 1 },
  { name: 'left', maxCount: 1 },
  { name: 'right', maxCount: 1 }
]), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const urls: { front?: string; left?: string; right?: string } = {};

    if (files?.front?.[0]) {
      urls.front = await processUploadedFile(files.front[0]);
    }
    if (files?.left?.[0]) {
      urls.left = await processUploadedFile(files.left[0]);
    }
    if (files?.right?.[0]) {
      urls.right = await processUploadedFile(files.right[0]);
    }

    res.json({
      success: true,
      urls
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Image uploads failed.', error: err.message });
  }
});

export default router;
