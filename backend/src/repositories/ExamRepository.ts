import { prisma } from '../app';

export class ExamRepository {
  async create(data: { title: string; duration: number; teacherId: string }) {
    return prisma.exam.create({ data });
  }

  async findById(id: string) {
    return prisma.exam.findUnique({
      where: { id },
      include: { questions: { include: { testCases: true } }, teacher: { select: { id: true, name: true, email: true } } },
    });
  }

  async findPublished() {
    return prisma.exam.findMany({
      where: { status: 'PUBLISHED' },
      include: { teacher: { select: { name: true } }, _count: { select: { questions: true } } },
    });
  }

  async findByTeacher(teacherId: string) {
    return prisma.exam.findMany({
      where: { teacherId },
      include: { _count: { select: { questions: true, attempts: true } } },
    });
  }

  async publish(id: string) {
    return prisma.exam.update({ where: { id }, data: { status: 'PUBLISHED' } });
  }

  async close(id: string) {
    return prisma.exam.update({ where: { id }, data: { status: 'CLOSED' } });
  }
}
