import { prisma } from '../index';
import { QuestionType } from '../../generated/prisma/enums';

interface CreateQuestionData {
  examId: string;
  type: QuestionType;
  text: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  starterCode?: string;
  testCases?: { input: string; expectedOutput: string }[];
}

export class QuestionRepository {
  async create(data: CreateQuestionData) {
    const { testCases, ...questionData } = data;
    return prisma.question.create({
      data: {
        ...questionData,
        options: questionData.options ?? [],
        testCases: testCases ? { create: testCases } : undefined,
      },
      include: { testCases: true },
    });
  }

  async findById(id: string) {
    return prisma.question.findUnique({ where: { id }, include: { testCases: true } });
  }

  async findByExam(examId: string) {
    return prisma.question.findMany({ where: { examId }, include: { testCases: true } });
  }
}
