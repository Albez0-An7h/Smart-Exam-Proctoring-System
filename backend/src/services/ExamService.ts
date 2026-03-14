import { ExamRepository } from '../repositories/ExamRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { QuestionFactory } from './QuestionFactory';

const examRepo = new ExamRepository();
const questionRepo = new QuestionRepository();

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

    // Use QuestionFactory to validate type
    QuestionFactory.createQuestion({ id: 'temp', ...questionData, examId });

    return questionRepo.create({ ...questionData, examId });
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
}
