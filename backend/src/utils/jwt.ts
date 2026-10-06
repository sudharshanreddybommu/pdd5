import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { config } from '../config/index.js';

export interface TokenPayload {
  userId: string;
  email: string;
  phone?: string;
  role: 'PATIENT' | 'DOCTOR';
}

export function generateToken(payload: TokenPayload, rememberMe: boolean = false): string {
  const expiresIn = rememberMe ? '30d' : (config.jwtExpiresIn as any || '7d');
  return jwt.sign(payload, config.jwtSecret, { expiresIn });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtSecret) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function setAuthCookie(res: Response, token: string, rememberMe: boolean = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  res.cookie('opmd_auth_token', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie('opmd_auth_token', {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax'
  });
}
