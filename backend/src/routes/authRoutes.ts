import { Router } from 'express';
import {
  registerPatient,
  registerDoctor,
  getWebAuthnRegisterOptions,
  verifyWebAuthnRegistration,
  getWebAuthnLoginOptions,
  verifyWebAuthnLogin,
  loginWithPassword,
  forgotPassword,
  resetPassword,
  getMe,
  logout
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Signups
router.post('/register/patient', authLimiter, registerPatient);
router.post('/register/doctor', authLimiter, registerDoctor);

// Password Reset
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// WebAuthn / Passkey / Biometric Registration
router.post('/webauthn/register-options', authLimiter, getWebAuthnRegisterOptions);
router.post('/webauthn/verify-registration', authLimiter, verifyWebAuthnRegistration);

// WebAuthn / Passkey / Biometric Login
router.post('/webauthn/login-options', authLimiter, getWebAuthnLoginOptions);
router.post('/webauthn/verify-login', authLimiter, verifyWebAuthnLogin);

// Password Fallback & Session
router.post('/login', authLimiter, loginWithPassword);
router.post('/login-password', authLimiter, loginWithPassword);
router.get('/me', authenticate, getMe);
router.post('/logout', logout);

export default router;
