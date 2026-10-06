import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Limit each client IP to 2000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1',
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Limit auth attempts per client IP
  keyGenerator: (req) => (req.headers['x-forwarded-for'] as string) || req.ip || '127.0.0.1',
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  }
});

