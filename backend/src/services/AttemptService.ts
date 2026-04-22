import { ExamRepository } from '../repositories/ExamRepository';
import { AttemptRepository } from '../repositories/AttemptRepository';
import { SubmissionRepository } from '../repositories/SubmissionRepository';
import { EvaluationService } from './EvaluationService';
import { AttemptContext, InProgressState, SubmittedState } from '../models/AttemptState';
import { AttemptStatus } from '../../generated/prisma/enums';

interface AttemptWithStatus {
  status: string;
}

export class AttemptService {
  constructor(
    private readonly examRepo: ExamRepository = new ExamRepository(),
    private readonly attemptRepo: AttemptRepository = new AttemptRepository(),
    private readonly submissionRepo: SubmissionRepository = new SubmissionRepository(),
    private readonly evaluationService: EvaluationService = new EvaluationService(),
  ) {}

  private createContextFromStatus(status: AttemptStatus): AttemptContext {
    const context = new AttemptContext();
    switch (status) {
      case 'IN_PROGRESS':
        context.setState(new InProgressState());
        return context;
      case 'SUBMITTED':
        context.setState(new SubmittedState());
        return context;
      default:
        throw new Error(`Cannot transition attempt from status ${status}`);
    }
  }

  async startExam(studentId: string, examId: string) {
    const exam = await this.examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.status !== 'PUBLISHED') throw new Error('Exam is not published');

    const existing = await this.attemptRepo.findByStudentAndExam(studentId, examId);

    // Resume an in-progress attempt
    const inProgress = existing.find((a: AttemptWithStatus) => a.status === 'IN_PROGRESS');
    if (inProgress) return inProgress;

    // Block re-attempt if already submitted or evaluated
    const finished = existing.find((a: AttemptWithStatus) =>
      ['SUBMITTED', 'AUTO_SUBMITTED', 'EVALUATED'].includes(a.status)
    );
    if (finished) throw new Error('You have already attempted this exam.');

    const attempt = await this.attemptRepo.create({ studentId, examId });
    return attempt;
  }

  async saveAnswer(attemptId: string, studentId: string, questionId: string, answer: string) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) throw new Error('Attempt not found');
    if (attempt.studentId !== studentId) throw new Error('Forbidden');
    if (attempt.status !== 'IN_PROGRESS') throw new Error('Attempt is not in progress');

    return this.submissionRepo.upsert(attemptId, questionId, answer);
  }

  async submitExam(attemptId: string, studentId: string) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) throw new Error('Attempt not found');
    if (attempt.studentId !== studentId) throw new Error('Forbidden');
    if (attempt.status !== 'IN_PROGRESS') throw new Error('Attempt is not in progress');

    const context = this.createContextFromStatus(attempt.status);
    context.proceedToNextState();
    await this.attemptRepo.updateStatus(attemptId, context.getCurrentStatus());

    const totalScore = await this.evaluationService.evaluateAttempt(attemptId);

    context.proceedToNextState();

    await this.attemptRepo.updateStatus(attemptId, context.getCurrentStatus(), { endTime: new Date(), totalScore });
    return this.attemptRepo.findById(attemptId);
  }

  async getAttemptResult(attemptId: string, studentId: string) {
    const attempt = await this.attemptRepo.findById(attemptId);
    if (!attempt) throw new Error('Attempt not found');
    if (attempt.studentId !== studentId) throw new Error('Forbidden');
    return attempt;
  }

  async getStudentHistory(studentId: string) {
    return this.attemptRepo.findByStudent(studentId);
  }
}
