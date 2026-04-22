import { ExamRepository } from '../repositories/ExamRepository';
import { QuestionRepository } from '../repositories/QuestionRepository';
import { AttemptRepository } from '../repositories/AttemptRepository';
import { QuestionFactory } from './QuestionFactory';
import { QuestionType as PrismaQuestionType } from '../../generated/prisma/enums';
import { QuestionType as DomainQuestionType } from '../models/Question';
import type { CreateQuestionData } from '../repositories/QuestionRepository';

interface QuestionOptionInput {
  text: string;
  isCorrect?: boolean;
}

interface AddQuestionInput {
  type: PrismaQuestionType;
  text: string;
  marks: number;
  options?: string[] | QuestionOptionInput[];
  correctAnswer?: string | null;
  starterCode?: string;
  testCases?: { input: string; expectedOutput: string }[];
}

interface ExamViolationResult {
  attemptId: string;
  studentName: string;
  studentEmail: string;
  violationCount: number;
  logs: unknown[];
  status: string;
  score: number;
}

export class ExamService {
  constructor(
    private readonly examRepo: ExamRepository = new ExamRepository(),
    private readonly questionRepo: QuestionRepository = new QuestionRepository(),
    private readonly attemptRepo: AttemptRepository = new AttemptRepository(),
  ) {}

  private toDomainQuestionType(type: PrismaQuestionType): DomainQuestionType {
    switch (type) {
      case 'MCQ':
        return DomainQuestionType.MCQ;
      case 'CODING':
        return DomainQuestionType.CODING;
      case 'SUBJECTIVE':
        return DomainQuestionType.SUBJECTIVE;
      default:
        throw new Error('Invalid question type');
    }
  }

  private normalizeQuestionData(examId: string, questionData: AddQuestionInput): CreateQuestionData {
    const processedData: CreateQuestionData = {
      examId,
      type: questionData.type,
      text: questionData.text,
      marks: questionData.marks,
      options: Array.isArray(questionData.options) ? [] : undefined,
      correctAnswer: questionData.correctAnswer ?? undefined,
      starterCode: questionData.starterCode,
      testCases: questionData.testCases,
    };

    if (
      Array.isArray(questionData.options) &&
      questionData.options.length > 0 &&
      typeof questionData.options[0] === 'object'
    ) {
      const options = questionData.options as QuestionOptionInput[];
      const correctOpt = options.find((o) => o.isCorrect);
      processedData.correctAnswer = correctOpt?.text ?? processedData.correctAnswer;
      processedData.options = options.map((o) => o.text);
    } else if (Array.isArray(questionData.options)) {
      processedData.options = questionData.options as string[];
    }

    return processedData;
  }

  async createExam(title: string, duration: number, teacherId: string) {
    if (!title || !duration) throw new Error('Title and duration are required');
    return this.examRepo.create({ title, duration, teacherId });
  }

  async addQuestion(examId: string, teacherId: string, questionData: AddQuestionInput) {
    const exam = await this.examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.teacherId !== teacherId) throw new Error('Not authorized to modify this exam');
    if (exam.status !== 'DRAFT') throw new Error('Cannot modify a published exam');

    const processedData = this.normalizeQuestionData(examId, questionData);

    QuestionFactory.createQuestion({
      id: 'temp',
      ...processedData,
      type: this.toDomainQuestionType(processedData.type),
    });

    return this.questionRepo.create(processedData);
  }

  async publishExam(examId: string, teacherId: string) {
    const exam = await this.examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.teacherId !== teacherId) throw new Error('Not authorized');
    if (exam.questions.length === 0) throw new Error('Cannot publish exam with no questions');
    if (exam.status !== 'DRAFT') throw new Error('Exam is already published or closed');

    return this.examRepo.publish(examId);
  }

  async getPublishedExams() {
    return this.examRepo.findPublished();
  }

  async getTeacherExams(teacherId: string) {
    return this.examRepo.findByTeacher(teacherId);
  }

  async getExamById(examId: string) {
    const exam = await this.examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    return exam;
  }

  async getExamViolations(examId: string, teacherId: string): Promise<ExamViolationResult[]> {
    const exam = await this.examRepo.findById(examId);
    if (!exam) throw new Error('Exam not found');
    if (exam.teacherId !== teacherId) throw new Error('Not authorized to view violations for this exam');

    const attempts = await this.attemptRepo.findViolationsByExam(examId);
    // map to include student details and proctor log counts
    return attempts.map((a) => ({
      attemptId: a.id,
      studentName: a.student.name,
      studentEmail: a.student.email,
      violationCount: a.proctorLogs.length,
      logs: a.proctorLogs,
      status: a.status,
      score: a.totalScore,
    }));
  }
}
