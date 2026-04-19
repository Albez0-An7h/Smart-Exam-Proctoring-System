import { prisma } from '../app';
import { Role } from '../../generated/prisma/enums';

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: { name: string; email: string; password: string; role: Role }) {
    return prisma.user.create({ data });
  }

  async findAll() {
    return prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
  }
}
