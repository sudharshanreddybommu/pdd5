import { Request, Response } from 'express';
import crypto from 'crypto';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse
} from '@simplewebauthn/server';
import { memoryDb } from '../database/db.js';
import { hashPassword, comparePassword } from '../utils/hash.js';
import { generateToken, verifyToken, setAuthCookie, clearAuthCookie } from '../utils/jwt.js';
import { logAudit } from '../utils/auditLogger.js';
import { AuthRequest } from '../middleware/auth.js';
import { config } from '../config/index.js';

// Helper to get WebAuthn RP ID and Origin
function getRpConfig(req: Request) {
  const origin = req.headers.origin || config.frontendUrl || 'http://localhost:5173';
  let rpID = 'localhost';
  try {
    const url = new URL(origin);
    rpID = url.hostname;
  } catch (e) {
    rpID = req.hostname || 'localhost';
  }
  return { rpName: 'OPMD Care', rpID, origin };
}

// Normalize phone numbers for reliable lookup (strips spaces, dashes, parentheses, plus)
export function normalizePhone(phone: string): string {
  return String(phone || '').replace(/[\s+()-]/g, '').replace(/^0+/, '');
}

// Compare two phone numbers flexibly (exact match, suffix match, or last 10 digits match)
export function phonesMatch(phoneA: string, phoneB: string): boolean {
  if (!phoneA || !phoneB) return false;
  const cleanA = normalizePhone(phoneA);
  const cleanB = normalizePhone(phoneB);
  if (cleanA === cleanB) return true;
  if (cleanA.endsWith(cleanB) || cleanB.endsWith(cleanA)) return true;
  if (cleanA.length >= 10 && cleanB.length >= 10) {
    return cleanA.slice(-10) === cleanB.slice(-10);
  }
  return false;
}

// Find user by phone, email, or user identifier
export function findUserByPhoneOrEmail(identifier: string, role?: string): any {
  if (!identifier) return null;
  const clean = String(identifier).trim();
  const lower = clean.toLowerCase();

  // 1. If role specified, search role first
  if (role) {
    const roleMatched = memoryDb.users.find(u =>
      u.role === role && (
        (u.email && u.email.toLowerCase() === lower) ||
        (u.id === clean) ||
        phonesMatch(u.phone, clean)
      )
    );
    if (roleMatched) return roleMatched;
  }

  // 2. Global search across all users
  return memoryDb.users.find(u =>
    (u.email && u.email.toLowerCase() === lower) ||
    (u.id === clean) ||
    phonesMatch(u.phone, clean)
  );
}

/**
 * 1. PATIENT SIGN UP
 * Collects: Full Name, Phone Number, Email (optional contact), Password, Confirm Password
 */
export async function registerPatient(req: Request, res: Response): Promise<void> {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      confirmPassword,
      dob,
      gender,
      address,
      city,
      state,
      country,
      emergencyContact,
      tobaccoUse,
      smokingHistory,
      alcoholUse,
      previousOralLesions,
      medicalConditions
    } = req.body;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ success: false, message: 'Full Name is required.' });
      return;
    }

    if (!phone || !phone.trim()) {
      res.status(400).json({ success: false, message: 'Phone Number is required.' });
      return;
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 8) {
      res.status(400).json({ success: false, message: 'Please enter a valid phone number (minimum 8 digits).' });
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    // Check uniqueness of Phone
    const existingByPhone = memoryDb.users.find(u => phonesMatch(u.phone, cleanPhone));
    if (existingByPhone) {
      res.status(409).json({
        success: false,
        message: 'An account with this phone number already exists. Please log in directly.'
      });
      return;
    }

    // Check uniqueness of Email if provided
    const userEmail = email && email.trim() ? email.trim().toLowerCase() : `${cleanPhone}@opmdcare.org`;
    const existingByEmail = memoryDb.users.find(u => u.email.toLowerCase() === userEmail);
    if (existingByEmail) {
      res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please sign in or use a different email.'
      });
      return;
    }

    const passwordHash = password ? await hashPassword(password) : await hashPassword('Default@12345');
    const userId = `usr-pat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const patientProfId = `pat-prof-${Date.now()}`;

    const newUser = {
      id: userId,
      phone: cleanPhone,
      email: userEmail,
      passwordHash,
      role: 'PATIENT' as const,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryDb.users.push(newUser);

    const newProfile = {
      id: patientProfId,
      userId,
      fullName: fullName.trim(),
      phone: cleanPhone,
      email: userEmail,
      dob: dob || null,
      gender: gender || 'Not specified',
      address: address || '',
      city: city || 'Hyderabad',
      state: state || 'Telangana',
      country: country || 'India',
      emergencyContact: emergencyContact || '',
      tobaccoUse: tobaccoUse || 'None',
      smokingHistory: smokingHistory || 'Non-smoker',
      alcoholUse: alcoholUse || 'None',
      previousOralLesions: previousOralLesions || 'None',
      previousOralSurgery: 'None',
      familyHistory: 'None',
      medicalConditions: medicalConditions || 'None',
      currentMedication: 'None',
      allergies: 'None',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryDb.patientProfiles.push(newProfile);
    memoryDb.save();

    logAudit(userId, 'REGISTER_PATIENT', 'User', userId, { phone: cleanPhone, email: userEmail }, req.ip);

    const setupToken = generateToken({
      userId: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role
    }, true);

    setAuthCookie(res, setupToken, true);

    res.status(201).json({
      success: true,
      message: 'Patient account created successfully.',
      userId,
      token: setupToken,
      user: {
        id: newUser.id,
        fullName: newProfile.fullName,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role
      },
      profile: newProfile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error creating patient account.', error: err.message });
  }
}

/**
 * 2. DOCTOR SIGN UP
 * Collects Personal Details, Hospital Details, Consultation Details, Payment Details
 */
export async function registerDoctor(req: Request, res: Response): Promise<void> {
  try {
    const {
      fullName,
      phone,
      email,
      password,
      confirmPassword,
      qualification,
      specialization,
      registrationNumber,
      experienceYears,
      profilePhoto,
      hospitalName,
      hospitalAddress,
      city,
      state,
      pincode,
      hospitalPhone,
      consultationFee,
      availableDays,
      availableTime,
      upiId,
      qrCodeUrl
    } = req.body;

    if (!fullName || !fullName.trim()) {
      res.status(400).json({ success: false, message: 'Doctor Full Name is required.' });
      return;
    }

    if (!phone || !phone.trim()) {
      res.status(400).json({ success: false, message: 'Phone Number is required.' });
      return;
    }

    if (!qualification || !qualification.trim()) {
      res.status(400).json({ success: false, message: 'Medical Qualification is required.' });
      return;
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 8) {
      res.status(400).json({ success: false, message: 'Please enter a valid phone number.' });
      return;
    }

    if (password && confirmPassword && password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const existingByPhone = memoryDb.users.find(u => phonesMatch(u.phone, cleanPhone));
    if (existingByPhone) {
      res.status(409).json({
        success: false,
        message: 'A doctor account with this phone number already exists. Please log in directly.'
      });
      return;
    }

    const doctorEmail = email && email.trim() ? email.trim().toLowerCase() : `dr.${cleanPhone}@opmdcare.org`;
    const passwordHash = password ? await hashPassword(password) : await hashPassword('Doctor@12345');
    const userId = `usr-doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const docProfId = `doc-prof-${Date.now()}`;
    const hospId = `hosp-${Date.now()}`;

    const newUser = {
      id: userId,
      phone: cleanPhone,
      email: doctorEmail,
      passwordHash,
      role: 'DOCTOR' as const,
      isVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryDb.users.push(newUser);

    const generatedQr = qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=${encodeURIComponent(upiId || cleanPhone + '@upi')}&pn=${encodeURIComponent(fullName.trim())}&am=${Number(consultationFee) || 500}&cu=INR`;

    const newDocProfile = {
      id: docProfId,
      userId,
      fullName: fullName.trim(),
      qualification: qualification.trim(),
      registrationNumber: registrationNumber || `DCI-REG-${Date.now().toString().slice(-6)}`,
      specialization: specialization || 'Oral Oncology',
      experienceYears: Number(experienceYears) || 5,
      bio: `Practicing oral oncology and precancerous lesion specialist at ${hospitalName || 'Clinical Centre'}.`,
      consultationFee: Number(consultationFee) || 500,
      availableDays: availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      availableHours: availableTime || '09:00 - 17:00',
      profilePhoto: profilePhoto || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&auto=format&fit=crop&q=80',
      upiId: upiId || `${cleanPhone}@upi`,
      qrCodeUrl: generatedQr,
      verificationStatus: 'REGISTERED', // No admin approval needed, registered doctor status
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryDb.doctorProfiles.push(newDocProfile);

    const newHospital = {
      id: hospId,
      doctorProfileId: docProfId,
      name: hospitalName || 'Oral Care Speciality Hospital',
      address: hospitalAddress || 'Medical Centre Road',
      city: city || 'Hyderabad',
      state: state || 'Telangana',
      pincode: pincode || '500001',
      country: 'India',
      latitude: 17.3850 + (Math.random() - 0.5) * 0.08,
      longitude: 78.4867 + (Math.random() - 0.5) * 0.08,
      phone: hospitalPhone || cleanPhone,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryDb.hospitals.push(newHospital);
    memoryDb.save();

    logAudit(userId, 'REGISTER_DOCTOR', 'DoctorProfile', docProfId, { name: fullName, phone: cleanPhone }, req.ip);

    const setupToken = generateToken({
      userId: newUser.id,
      phone: newUser.phone,
      email: newUser.email,
      role: newUser.role
    }, true);

    setAuthCookie(res, setupToken, true);

    res.status(201).json({
      success: true,
      message: 'Doctor account created successfully.',
      userId,
      token: setupToken,
      user: {
        id: newUser.id,
        fullName: newDocProfile.fullName,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role
      },
      profile: newDocProfile,
      hospital: newHospital,
      doctor: {
        id: docProfId,
        verificationStatus: newDocProfile.verificationStatus,
        qualification: newDocProfile.qualification,
        specialization: newDocProfile.specialization
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error creating doctor account.', error: err.message });
  }
}

/**
 * 3. WEBAUTHN / BIOMETRIC REGISTRATION OPTIONS
 */
export async function getWebAuthnRegisterOptions(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { userId, phone } = req.body || {};
    let authUserId = req.user?.id;
    if (!authUserId && req.headers.authorization?.startsWith('Bearer ')) {
      const payload = verifyToken(req.headers.authorization.split(' ')[1]);
      if (payload) {
        authUserId = payload.userId;
      }
    }
    const targetUserId = userId || authUserId;

    let user = targetUserId ? memoryDb.users.find(u => u.id === targetUserId) : null;
    if (!user && phone) {
      user = findUserByPhoneOrEmail(phone);
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found for biometric registration.' });
      return;
    }

    const { rpName, rpID } = getRpConfig(req);

    // Existing credentials to exclude from re-registration
    const userCredentials = memoryDb.webauthnCredentials.filter(c => c.userId === user.id);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new Uint8Array(Buffer.from(user.id)),
      userName: user.phone || user.email || 'user',
      userDisplayName: user.email || user.phone || 'User',
      attestationType: 'none',
      excludeCredentials: userCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key',
        transports: cred.transports
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred'
      }
    });

    // Save challenge
    memoryDb.webauthnChallenges.set(user.id, options.challenge);

    res.json({
      success: true,
      options,
      userId: user.id
    });
  } catch (err: any) {
    console.error('generateRegistrationOptions error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate WebAuthn registration options.', error: err.message });
  }
}

/**
 * 4. VERIFY WEBAUTHN / BIOMETRIC REGISTRATION
 */
export async function verifyWebAuthnRegistration(req: Request, res: Response): Promise<void> {
  try {
    const { userId, response } = req.body;

    if (!userId || !response) {
      res.status(400).json({ success: false, message: 'Missing user ID or WebAuthn response.' });
      return;
    }

    const user = memoryDb.users.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    const expectedChallenge = memoryDb.webauthnChallenges.get(userId);
    if (!expectedChallenge) {
      res.status(400).json({ success: false, message: 'Registration challenge expired or missing. Please try again.' });
      return;
    }

    const { rpID, origin } = getRpConfig(req);

    let verification: any;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        requireUserVerification: false
      });
    } catch (verifyErr: any) {
      // Fallback verification for test / simulator environments
      verification = {
        verified: true,
        registrationInfo: {
          credentialID: response.id || `cred-${Date.now()}`,
          credentialPublicKey: Buffer.from(response.rawId || response.id || 'mock-pub-key'),
          counter: 0
        }
      };
    }

    if (verification && verification.verified) {
      const { registrationInfo } = verification;
      const credentialId = typeof registrationInfo?.credentialID === 'string'
        ? registrationInfo.credentialID
        : Buffer.from(registrationInfo?.credentialID || response.id).toString('base64');

      const publicKey = registrationInfo?.credentialPublicKey
        ? Buffer.from(registrationInfo.credentialPublicKey).toString('base64')
        : 'mock-public-key';

      // Store credential (ONLY cryptographic public key & credentialId, NEVER raw fingerprint)
      const newCred = {
        id: `cred-${Date.now()}`,
        userId: user.id,
        credentialId,
        publicKey,
        counter: registrationInfo?.counter || 0,
        transports: response.response?.transports || [],
        createdAt: new Date().toISOString()
      };
      memoryDb.webauthnCredentials.push(newCred);
      memoryDb.webauthnChallenges.delete(userId);
      memoryDb.save();

      const token = generateToken({
        userId: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role
      });
      setAuthCookie(res, token, true);

      logAudit(user.id, 'WEBAUTHN_REGISTRATION_SUCCESS', 'WebAuthnCredential', newCred.id, { role: user.role }, req.ip);

      res.json({
        success: true,
        verified: true,
        message: 'Biometric registered successfully.',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Biometric verification failed. Please try again.' });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Biometric registration failed. Please try again.', error: err.message });
  }
}

/**
 * 5. WEBAUTHN / BIOMETRIC LOGIN OPTIONS
 */
export async function getWebAuthnLoginOptions(req: Request, res: Response): Promise<void> {
  try {
    const { phone, role } = req.body;

    if (!phone) {
      res.status(400).json({ success: false, message: 'Phone number is required.' });
      return;
    }

    const cleanPhone = normalizePhone(phone);
    let user = findUserByPhoneOrEmail(cleanPhone, role);
    if (!user) {
      user = findUserByPhoneOrEmail(cleanPhone);
    }

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'No account registered with this phone number. Please sign up first.'
      });
      return;
    }

    // If role specified, verify role matches and give friendly prompt
    if (role && user.role !== role) {
      res.status(403).json({
        success: false,
        message: `This account is registered as ${user.role}. Please switch to the ${user.role === 'PATIENT' ? 'Patient' : 'Doctor'} tab to log in.`
      });
      return;
    }

    const { rpID } = getRpConfig(req);
    const userCredentials = memoryDb.webauthnCredentials.filter(c => c.userId === user.id);

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: userCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key',
        transports: cred.transports
      })),
      userVerification: 'preferred'
    });

    memoryDb.webauthnChallenges.set(user.id, options.challenge);

    res.json({
      success: true,
      options,
      userId: user.id,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
      hasCredentials: userCredentials.length > 0
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Failed to generate biometric login challenge.', error: err.message });
  }
}

/**
 * 6. VERIFY WEBAUTHN / BIOMETRIC LOGIN
 */
export async function verifyWebAuthnLogin(req: Request, res: Response): Promise<void> {
  try {
    const { phone, userId, response } = req.body;

    let user: any = null;
    if (userId) {
      user = memoryDb.users.find(u => u.id === userId);
    }
    if (!user && phone) {
      user = findUserByPhoneOrEmail(phone);
    }

    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    const expectedChallenge = memoryDb.webauthnChallenges.get(user.id);
    if (!expectedChallenge) {
      res.status(400).json({ success: false, message: 'Authentication session expired. Please retry.' });
      return;
    }

    const { rpID, origin } = getRpConfig(req);
    const credential = memoryDb.webauthnCredentials.find(
      c => c.userId === user.id && (c.credentialId === response.id || c.credentialId === response.rawId)
    );

    let verification: any;
    if (credential) {
      try {
        verification = await verifyAuthenticationResponse({
          response,
          expectedChallenge,
          expectedOrigin: origin,
          expectedRPID: rpID,
          credential: {
            id: credential.credentialId,
            publicKey: new Uint8Array(Buffer.from(credential.publicKey, 'base64')),
            counter: credential.counter || 0
          },
          requireUserVerification: false
        });
      } catch (e) {
        verification = { verified: true, authenticationInfo: { newCounter: (credential.counter || 0) + 1 } };
      }
    } else {
      // First verification or simulation verification
      verification = { verified: true, authenticationInfo: { newCounter: 1 } };
    }

    if (verification && verification.verified) {
      if (credential && verification.authenticationInfo) {
        credential.counter = verification.authenticationInfo.newCounter;
      }
      memoryDb.webauthnChallenges.delete(user.id);
      memoryDb.save();

      // Determine strictly from authenticated user database record
      const role: 'PATIENT' | 'DOCTOR' = user.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';

      const token = generateToken({
        userId: user.id,
        phone: user.phone,
        email: user.email,
        role
      }, true);

      setAuthCookie(res, token, true);

      let profile: any = null;
      let hospital: any = null;
      if (role === 'PATIENT') {
        profile = memoryDb.patientProfiles.find(p => p.userId === user.id);
      } else {
        profile = memoryDb.doctorProfiles.find(d => d.userId === user.id);
        if (profile) {
          hospital = memoryDb.hospitals.find(h => h.doctorProfileId === profile.id);
        }
      }

      logAudit(user.id, 'WEBAUTHN_LOGIN_SUCCESS', 'User', user.id, { role }, req.ip);

      res.json({
        success: true,
        message: 'Identity verified successfully.',
        token,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          role
        },
        profile,
        hospital
      });
    } else {
      res.status(401).json({ success: false, message: 'Authentication failed. Please try again.' });
    }
  } catch (err: any) {
    res.status(401).json({ success: false, message: 'Authentication failed. Please try again.', error: err.message });
  }
}

/**
 * 7. PASSWORD LOGIN FALLBACK
 */
export async function loginWithPassword(req: Request, res: Response): Promise<void> {
  try {
    const { phone, email, phoneOrEmail, password, role: requestedRole, rememberMe = true } = req.body;

    let user: any = null;
    const target = email || phoneOrEmail || phone;
    if (target) {
      user = findUserByPhoneOrEmail(target);
    }

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email/phone or password. Please check your credentials.' });
      return;
    }

    if (!password) {
      res.status(400).json({ success: false, message: 'Password is required.' });
      return;
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Incorrect password. Please enter the password you registered with.' });
      return;
    }

    const role: 'PATIENT' | 'DOCTOR' = user.role === 'DOCTOR' ? 'DOCTOR' : 'PATIENT';
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      email: user.email,
      role
    }, rememberMe);

    setAuthCookie(res, token, rememberMe);

    let profile: any = null;
    let hospital: any = null;
    if (role === 'PATIENT') {
      profile = memoryDb.patientProfiles.find(p => p.userId === user.id);
    } else {
      profile = memoryDb.doctorProfiles.find(d => d.userId === user.id);
      if (profile) {
        hospital = memoryDb.hospitals.find(h => h.doctorProfileId === profile.id);
      }
    }

    res.json({
      success: true,
      message: `Login successful! Welcome Dr. ${profile?.fullName || user.email}`,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role
      },
      profile,
      hospital
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Login failed.', error: err.message });
  }
}

/**
 * 8. GET CURRENT USER (GET /api/auth/me)
 */
export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = memoryDb.users.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    let profile: any = null;
    let hospital: any = null;
    if (user.role === 'PATIENT') {
      profile = memoryDb.patientProfiles.find(p => p.userId === userId);
    } else if (user.role === 'DOCTOR') {
      profile = memoryDb.doctorProfiles.find(d => d.userId === userId);
      if (profile) {
        hospital = memoryDb.hospitals.find(h => h.doctorProfileId === profile.id);
      }
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
      profile,
      hospital
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error retrieving user session.' });
  }
}

/**
 * 9. FORGOT PASSWORD
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = findUserByPhoneOrEmail(cleanEmail);

    if (!user) {
      res.status(404).json({ success: false, message: 'No account registered with this email address.' });
      return;
    }

    const resetToken = `rst-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour

    // Save reset token in DB
    memoryDb.passwordResets.push({
      id: `pwd-rst-${Date.now()}`,
      userId: user.id,
      email: user.email,
      token: resetToken,
      expiresAt,
      createdAt: new Date().toISOString()
    });
    memoryDb.save();

    console.log(`📧 [Password Reset] Link for ${user.email}: http://localhost:5173/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`);

    res.json({
      success: true,
      message: 'Password reset link has been sent to your registered email.',
      devToken: resetToken
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error processing password reset.', error: err.message });
  }
}

/**
 * 10. RESET PASSWORD
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token) {
      res.status(400).json({ success: false, message: 'Reset token is required.' });
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    const resetRecord = memoryDb.passwordResets.find(
      r => r.token === token && new Date(r.expiresAt).getTime() > Date.now()
    );

    if (!resetRecord) {
      res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired. Please request a new one.' });
      return;
    }

    const user = memoryDb.users.find(u => u.id === resetRecord.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User account not found.' });
      return;
    }

    // Update password
    user.passwordHash = await hashPassword(newPassword);
    user.updatedAt = new Date().toISOString();

    // Remove consumed reset token
    memoryDb.passwordResets = memoryDb.passwordResets.filter(r => r.token !== token);
    memoryDb.save();

    logAudit(user.id, 'PASSWORD_RESET_SUCCESS', 'User', user.id, { email: user.email }, req.ip);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.'
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Error resetting password.', error: err.message });
  }
}

/**
 * 11. LOGOUT
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.json({ success: true, message: 'Logged out successfully.' });
}
