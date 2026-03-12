import { ExamRepository } from '../repositories/ExamRepository';
import { AttemptRepository } from '../repositories/AttemptRepository';
import { SubmissionRepository } from '../repositories/SubmissionRepository';
import { EvaluationService } from './EvaluationService';
import { AttemptContext, InProgressState, SubmittedState } from '../models/AttemptState';

const examRepo = new ExamRepository();
const attemptRepo = new AttemptRepository();
const submissionRepo = new SubmissionRepository();
const evaluationService = new EvaluationService();

export class AttemptService {
  async startExam(studentId: string, examId: string) {
    const exam = await examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.status !== 'PUBLISHED') throw new Error('Exam is not published');

    // Prevent duplicate in-progress attempts
    const existing = await attemptRepo.findByStudentAndExam(studentId, examId);
    const inProgress = existing.find((a: any) => a.status === 'IN_PROGRESS');
    if (inProgress) return inProgress; // Resume existing attempt

    const attempt = await attemptRepo.create({ studentId, examId });
    return attempt;
  }

  async saveAnswer(attemptId: string, studentId: string, questionId: string, answer: string) {
    const attempt = await attemptRepo.findById(attemptId);
    if (!attempt) throw new Error('Attempt not found');
    if (attempt.studentId !== studentId) throw new Error('Forbidden');
    if (attempt.status !== 'IN_PROGRESS') throw new Error('Attempt is not in progress');

    return submissionRepo.upsert(attemptId, questionId, answer);
  }

  async submitExam(attemptId: string, studentId: string) {
    const attempt = await attemptRepo.findById(attemptId);
    if (!attempt) throw new Error('Attempt not found');
    if (attempt.studentId !== studentId) throw new Error('Forbidden');
    if (attempt.status !== 'IN_PROGRESS') throw new Error('Attempt is not in progress');

    // State transition: IN_PROGRESS → SUBMITTED
    const context = new AttemptContext();
    context.setState(new InProgressState());
    context.proceedToNextState(); // → SUBMITTED

    // Evaluate all answers
    const totalScore = await evaluationService.evaluateAttempt(attemptId);

    // State transition: SUBMITTED → EVALUATED
    context.proceedToNextState();

    await attemptRepo.updateStatus(attemptId, 'EVALUATED', { endTime: new Date(), totalScore });
    return attemptRepo.findById(attemptId);
  }

  async getAttemptResult(attemptId: string, studentId: string) {
    const attempt = await attemptRepo.findById(attemptId);
    if (!attempt) throw new Error('Attempt not found');
    if (attempt.studentId !== studentId) throw new Error('Forbidden');
    return attempt;
  }

  async getStudentHistory(studentId: string) {
    return attemptRepo.findByStudent(studentId);
  }
}
