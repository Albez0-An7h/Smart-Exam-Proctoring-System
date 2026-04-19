import { Router } from 'express';
import { ExamController } from '../controllers/ExamController';
import { authenticate } from '../middlewares/auth';
import { requireRole } from '../middlewares/role';

const router = Router();
const examController = new ExamController();

router.get('/', authenticate, examController.getPublishedExams.bind(examController));
router.get('/my/exams', authenticate, requireRole('TEACHER'), examController.getMyExams.bind(examController));
router.get('/:id', authenticate, examController.getExamById.bind(examController));

router.post('/', authenticate, requireRole('TEACHER'), examController.createExam.bind(examController));
router.post('/:id/questions', authenticate, requireRole('TEACHER'), examController.addQuestion.bind(examController));
router.patch('/:id/publish', authenticate, requireRole('TEACHER'), examController.publishExam.bind(examController));

export default router;
