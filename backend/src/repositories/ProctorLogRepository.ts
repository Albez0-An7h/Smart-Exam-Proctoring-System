import { prisma } from '../app';

export class ProctorLogRepository {
  async create(attemptId: string, eventType: string) {
    return prisma.proctorLog.create({ data: { attemptId, eventType } });
  }

  async findByAttempt(attemptId: string) {
    return prisma.proctorLog.findMany({ where: { attemptId }, orderBy: { timestamp: 'desc' } });
  }

  async countByAttempt(attemptId: string) {
    return prisma.proctorLog.count({ where: { attemptId } });
  }
}
