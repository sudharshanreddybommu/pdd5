import { Router } from 'express';
import { getDatabaseOverview } from '../controllers/adminController.js';

const router = Router();

router.get('/database/overview', getDatabaseOverview);

export default router;
