import { prisma } from '../index';

export class SubmissionRepository {
  async upsert(attemptId: string, questionId: string, answer: string) {
    return prisma.submission.upsert({
      where: { attemptId_questionId: { attemptId, questionId } },
      create: { attemptId, questionId, answer },
      update: { answer },
    });
  }

  async updateScore(attemptId: string, questionId: string, score: number) {
    return prisma.submission.update({
      where: { attemptId_questionId: { attemptId, questionId } },
      data: { score },
    });
  }

  async findByAttempt(attemptId: string) {
    return prisma.submission.findMany({ where: { attemptId }, include: { question: { include: { testCases: true } } } });
  }
}
