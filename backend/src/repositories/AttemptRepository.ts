import { prisma } from '../app';
import { AttemptStatus } from '../../generated/prisma/enums';

export class AttemptRepository {
  async create(data: { studentId: string; examId: string }) {
    return prisma.attempt.create({ data: { ...data, status: 'IN_PROGRESS' } });
  }

  async findById(id: string) {
    return prisma.attempt.findUnique({
      where: { id },
      include: {
        submissions: { include: { question: true } },
        proctorLogs: true,
        exam: { include: { questions: { include: { testCases: true } } } },
      },
    });
  }

  async findByStudentAndExam(studentId: string, examId: string) {
    return prisma.attempt.findMany({ where: { studentId, examId } });
  }

  async findByStudent(studentId: string) {
    return prisma.attempt.findMany({
      where: { studentId },
      include: { exam: { select: { title: true, duration: true } } },
      orderBy: { startTime: 'desc' },
    });
  }

  async updateStatus(id: string, status: AttemptStatus, extras?: { endTime?: Date; totalScore?: number }) {
    return prisma.attempt.update({ where: { id }, data: { status, ...extras } });
  }

  async findViolationsByExam(examId: string) {
    return prisma.attempt.findMany({
      where: { examId },
      include: {
        proctorLogs: true,
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }
}
