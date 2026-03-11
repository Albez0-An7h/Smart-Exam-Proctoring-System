import { Router } from 'express';
import { ProctorController } from '../controllers/ProctorController';
import { authenticate } from '../middlewares/auth';

const router = Router();
const proctorController = new ProctorController();

// Log a proctoring event (called by frontend on tab-switch, blur, etc.)
router.post('/attempts/:id/events', authenticate, proctorController.logEvent.bind(proctorController));

// Get all proctor logs for an attempt (teacher/admin)
router.get('/attempts/:id/events', authenticate, proctorController.getLogs.bind(proctorController));

export default router;
