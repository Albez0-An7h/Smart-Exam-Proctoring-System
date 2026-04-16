import { Router } from 'express';
import { ProctorController } from '../controllers/ProctorController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const proctorController = new ProctorController();

router.post('/attempts/:id/events', authenticate, proctorController.logEvent.bind(proctorController));

router.get('/attempts/:id/events', authenticate, proctorController.getLogs.bind(proctorController));

export default router;
