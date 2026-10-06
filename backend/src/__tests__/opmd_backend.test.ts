import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { seedInitialData } from '../database/seed.js';

describe('OPMD Care Authentication & Core Backend Suite', () => {
  beforeAll(async () => {
    await seedInitialData(true);
  });

  afterAll(async () => {
    await seedInitialData(true);
  });

  it('GET /api/health returns healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  it('Patient Direct Registration: creates account without OTP/email dependency', async () => {
    const res = await request(app)
      .post('/api/auth/register/patient')
      .send({
        fullName: 'Test Patient Direct',
        phone: '9988776655',
        email: 'testpatientdirect@example.com',
        password: 'SecurePass@123'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('PATIENT');
    expect(res.body.user.phone).toBe('9988776655');
  });

  it('Doctor Direct Registration: creates registered doctor without admin approval', async () => {
    const res = await request(app)
      .post('/api/auth/register/doctor')
      .send({
        fullName: 'Dr. Anita Desai',
        phone: '9988776644',
        email: 'dranita@example.com',
        password: 'DoctorPass@123',
        qualification: 'MDS, Oral Medicine & Radiology',
        specialization: 'Oral Cancer & OPMD Specialist',
        registrationNumber: 'DCI-99887',
        experienceYears: 12,
        hospitalName: 'Apollo Dental & Oral Oncology Center',
        hospitalAddress: 'Road No 36, Jubilee Hills',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '500033',
        hospitalPhone: '+91 40 2360 7777',
        consultationFee: 750,
        availableDays: 'Mon, Tue, Wed, Thu, Fri',
        availableHours: '10:00 AM - 05:00 PM',
        upiId: 'anita.opmd@okhdfcbank'
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe('DOCTOR');
    expect(res.body.doctor.verificationStatus).toBe('REGISTERED');
  });

  it('WebAuthn: generates registration options for an authenticated user', async () => {
    const regRes = await request(app)
      .post('/api/auth/register/patient')
      .send({
        fullName: 'Biometric Test User',
        phone: '9123456780',
        email: 'bio.test@example.com',
        password: 'BioUserPass@123'
      });

    const token = regRes.body.token;

    const optRes = await request(app)
      .post('/api/auth/webauthn/register-options')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(optRes.status).toBe(200);
    expect(optRes.body.options).toBeDefined();
    expect(optRes.body.options.challenge).toBeDefined();
    expect(optRes.body.options.rp.name).toBe('OPMD Care');
  });

  it('WebAuthn: generates login options for registered phone number', async () => {
    const res = await request(app)
      .post('/api/auth/webauthn/login-options')
      .send({ phone: '9876543210' }); // Seeded patient Rahul Verma

    expect(res.status).toBe(200);
    expect(res.body.options).toBeDefined();
    expect(res.body.options.challenge).toBeDefined();
    expect(res.body.user.role).toBe('PATIENT');
  });

  it('Credential Login Fallback: succeeds with valid phone or email and password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ phoneOrEmail: '9876543210', password: 'Patient@12345' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('PATIENT');
  });

  it('Doctor Login: succeeds with registered doctor credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ phoneOrEmail: '9988776644', password: 'DoctorPass@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('DOCTOR');
  });

  it('Route Protection: blocks Patient token from accessing Doctor endpoints', async () => {
    const patientLogin = await request(app)
      .post('/api/auth/login')
      .send({ phoneOrEmail: '9876543210', password: 'Patient@12345' });
    
    const patientToken = patientLogin.body.token;

    const res = await request(app)
      .get('/api/doctor/dashboard/stats')
      .set('Authorization', `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Unauthorized access');
  });

  it('Doctor Directory: returns registered oral specialists', async () => {
    const res = await request(app).get('/api/doctor/find');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.doctors)).toBe(true);
  });

  it('Forgot Password & Reset Password: sends link and updates password', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'testpatientdirect@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.devToken).toBeDefined();

    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: res.body.devToken,
        newPassword: 'BrandNewPassword@123',
        confirmPassword: 'BrandNewPassword@123'
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testpatientdirect@example.com',
        password: 'BrandNewPassword@123'
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });

  it('Symptoms Catalog: returns all 18 clinical OPMD indicators', async () => {
    const res = await request(app).get('/api/screening/symptoms/catalog');
    expect(res.status).toBe(200);
    expect(res.body.symptoms.length).toBe(18);
  });
});
