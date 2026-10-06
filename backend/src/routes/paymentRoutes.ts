import { Router } from 'express';
import {
  submitPaymentProof,
  verifyDoctorPayment
} from '../controllers/paymentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/proof/submit', submitPaymentProof);
router.post('/verify', requireRole(['DOCTOR']), verifyDoctorPayment);

export default router;
