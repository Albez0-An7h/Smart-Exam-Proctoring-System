import { Router } from 'express';
import { AttemptController } from '../controllers/AttemptController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';

const router = Router();
const attemptController = new AttemptController();

router.post('/exams/:id/start', authenticate, requireRole('STUDENT'), attemptController.startExam.bind(attemptController));

router.post('/attempts/:id/answer', authenticate, requireRole('STUDENT'), attemptController.saveAnswer.bind(attemptController));

router.post('/attempts/:id/submit', authenticate, requireRole('STUDENT'), attemptController.submitExam.bind(attemptController));

router.get('/attempts/:id/result', authenticate, attemptController.getResult.bind(attemptController));

router.get('/attempts/history', authenticate, requireRole('STUDENT'), attemptController.getHistory.bind(attemptController));

export default router;
