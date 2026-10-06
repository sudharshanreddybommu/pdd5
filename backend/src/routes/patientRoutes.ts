import { Router } from 'express';
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientScreenings,
  getPatientAppointments
} from '../controllers/patientController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);
router.use(requireRole(['PATIENT']));

router.get('/profile', getPatientProfile);
router.put('/profile', updatePatientProfile);
router.get('/screenings', getPatientScreenings);
router.get('/appointments', getPatientAppointments);

export default router;
