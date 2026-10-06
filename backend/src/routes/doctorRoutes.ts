import { Router } from 'express';
import {
  findDoctors,
  getDoctorById,
  getDoctorDashboardStats,
  getDoctorAppointments,
  handlePatientRequest,
  updateDoctorQR,
  updateDoctorProfile
} from '../controllers/doctorController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Public / Patient Accessible
router.get('/find', findDoctors);
router.get('/:id/public', getDoctorById);

// Protected Doctor Routes
router.get('/dashboard/stats', authenticate, requireRole(['DOCTOR']), getDoctorDashboardStats);
router.get('/appointments/list', authenticate, requireRole(['DOCTOR']), getDoctorAppointments);
router.post('/appointments/:appointmentId/action', authenticate, requireRole(['DOCTOR']), handlePatientRequest);
router.put('/profile/qr', authenticate, requireRole(['DOCTOR']), updateDoctorQR);
router.put('/profile', authenticate, requireRole(['DOCTOR']), updateDoctorProfile);

export default router;
