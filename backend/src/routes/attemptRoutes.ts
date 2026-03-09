import { Router } from 'express';
import { AttemptController } from '../controllers/AttemptController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';

const router = Router();
const attemptController = new AttemptController();

// Start exam attempt (student)
router.post('/exams/:id/start', authenticate, requireRole('STUDENT'), attemptController.startExam.bind(attemptController));

// Auto-save an answer
router.post('/attempts/:id/answer', authenticate, requireRole('STUDENT'), attemptController.saveAnswer.bind(attemptController));

// Submit the exam
router.post('/attempts/:id/submit', authenticate, requireRole('STUDENT'), attemptController.submitExam.bind(attemptController));

// View attempt result
router.get('/attempts/:id/result', authenticate, attemptController.getResult.bind(attemptController));

// View all past attempts for student
router.get('/attempts/history', authenticate, requireRole('STUDENT'), attemptController.getHistory.bind(attemptController));

export default router;
