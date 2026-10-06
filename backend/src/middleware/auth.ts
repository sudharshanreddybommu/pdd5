import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.js';
import { memoryDb } from '../database/db.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    phone?: string;
    email: string;
    role: 'PATIENT' | 'DOCTOR';
    isVerified: boolean;
    profileId?: string;
  };
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.opmd_auth_token) {
      token = req.cookies.opmd_auth_token;
    }

    if (!token) {
      res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
      return;
    }

    const user = memoryDb.users.find(u => u.id === payload.userId);
    if (!user) {
      res.status(401).json({ success: false, message: 'User account not found.' });
      return;
    }

    let profileId: string | undefined;
    if (user.role === 'PATIENT') {
      const p = memoryDb.patientProfiles.find(pr => pr.userId === user.id);
      profileId = p?.id;
    } else if (user.role === 'DOCTOR') {
      const d = memoryDb.doctorProfiles.find(dr => dr.userId === user.id);
      profileId = d?.id;
    }

    req.user = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified ?? true,
      profileId
    };

    next();
  } catch (error) {
    res.status(500).json({ success: false, message: 'Authentication error.' });
  }
}

export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.opmd_auth_token) {
      token = req.cookies.opmd_auth_token;
    }

    if (!token) {
      next();
      return;
    }

    const payload = verifyToken(token);
    if (!payload) {
      next();
      return;
    }

    const user = memoryDb.users.find(u => u.id === payload.userId);
    if (!user) {
      next();
      return;
    }

    let profileId: string | undefined;
    if (user.role === 'PATIENT') {
      const p = memoryDb.patientProfiles.find(pr => pr.userId === user.id);
      profileId = p?.id;
    } else if (user.role === 'DOCTOR') {
      const d = memoryDb.doctorProfiles.find(dr => dr.userId === user.id);
      profileId = d?.id;
    }

    req.user = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified ?? true,
      profileId
    };

    next();
  } catch (error) {
    next();
  }
}

export function requireRole(allowedRoles: Array<'PATIENT' | 'DOCTOR'>) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Unauthorized access.`
      });
      return;
    }

    next();
  };
}
