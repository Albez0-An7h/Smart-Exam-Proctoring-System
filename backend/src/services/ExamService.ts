import { ExamRepository } from '../repositories/ExamRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { AttemptRepository } from '../repositories/AttemptRepository';
import { QuestionFactory } from './QuestionFactory';

const examRepo = new ExamRepository();
const questionRepo = new QuestionRepository();
const attemptRepo = new AttemptRepository();

export class ExamService {
  async createExam(title: string, duration: number, teacherId: string) {
    if (!title || !duration) throw new Error('Title and duration are required');
    return examRepo.create({ title, duration, teacherId });
  }

  async addQuestion(examId: string, teacherId: string, questionData: any) {
    const exam = await examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.teacherId !== teacherId) throw new Error('Not authorized to modify this exam');
    if (exam.status !== 'DRAFT') throw new Error('Cannot modify a published exam');

    // The DB stores options as TEXT[]. If the frontend sends option objects
    // ({ text, isCorrect }), flatten them to strings and derive correctAnswer.
    let processedData = { ...questionData };
    if (
      Array.isArray(questionData.options) &&
      questionData.options.length > 0 &&
      typeof questionData.options[0] === 'object'
    ) {
      const correctOpt = questionData.options.find((o: any) => o.isCorrect);
      processedData.correctAnswer = correctOpt?.text ?? processedData.correctAnswer ?? null;
      processedData.options = questionData.options.map((o: any) => o.text as string);
    }

    QuestionFactory.createQuestion({ id: 'temp', ...processedData, examId });

    return questionRepo.create({ ...processedData, examId });
  }

  async publishExam(examId: string, teacherId: string) {
    const exam = await examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.teacherId !== teacherId) throw new Error('Not authorized');
    if (exam.questions.length === 0) throw new Error('Cannot publish exam with no questions');
    if (exam.status !== 'DRAFT') throw new Error('Exam is already published or closed');

    return examRepo.publish(examId);
  }

  async getPublishedExams() {
    return examRepo.findPublished();
  }

  async getTeacherExams(teacherId: string) {
    return examRepo.findByTeacher(teacherId);
  }

  async getExamById(examId: string) {
    const exam = await examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    return exam;
  }

  async getExamViolations(examId: string, teacherId: string) {
    const exam = await examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.teacherId !== teacherId) throw new Error('Not authorized to view violations for this exam');

    const attempts = await attemptRepo.findViolationsByExam(examId);
    // map to include student details and proctor log counts
    return attempts.map((a: any) => ({
      attemptId: a.id,
      studentName: a.student.name,
      studentEmail: a.student.email,
      violationCount: a.proctorLogs.length,
      logs: a.proctorLogs,
      status: a.status,
      score: a.totalScore
    }));
  }
}
