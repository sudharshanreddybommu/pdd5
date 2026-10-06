import { Router } from 'express';
import {
  requestAppointment,
  getAppointmentDetails
} from '../controllers/appointmentController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/request', requestAppointment);
router.get('/:id', getAppointmentDetails);

export default router;
