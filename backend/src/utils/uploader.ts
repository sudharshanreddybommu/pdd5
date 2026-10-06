import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';

// Setup Cloudinary if credentials provided
if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
  });
}

// Local storage fallback
if (!fs.existsSync(config.uploadsDir)) {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) {
      return cb(null, true);
    }
    cb(new Error('Only JPEG, PNG, WEBP and PDF files are allowed'));
  },
});

export async function processUploadedFile(file: Express.Multer.File): Promise<string> {
  // If Cloudinary configured, upload to Cloudinary
  if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
    try {
      const uploadRes = await cloudinary.uploader.upload(file.path, {
        folder: 'opmd_care_medical',
        resource_type: 'auto',
      });
      // Optionally clean up local temp file
      try { fs.unlinkSync(file.path); } catch (e) {}
      return uploadRes.secure_url;
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to local file URL:', err);
    }
  }

  // Fallback to local server static path
  return `/uploads/${file.filename}`;
}
