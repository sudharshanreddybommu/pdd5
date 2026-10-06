import { Router } from 'express';
import {
  submitScreening,
  getScreeningById,
  getSymptomsCatalog
} from '../controllers/screeningController.js';
import { optionalAuthenticate } from '../middleware/auth.js';

const router = Router();

router.get('/symptoms/catalog', getSymptomsCatalog);
router.post('/submit', optionalAuthenticate, submitScreening);
router.get('/:id', optionalAuthenticate, getScreeningById);

export default router;
