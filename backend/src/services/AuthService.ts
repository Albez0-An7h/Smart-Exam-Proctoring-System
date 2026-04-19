import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { signToken } from '../utils/jwt';
import { Role } from '../../generated/prisma/enums';

const userRepo = new UserRepository();

export class AuthService {
  async register(name: string, email: string, password: string, role: string) {
    const existing = await userRepo.findByEmail(email);
    if (existing) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await userRepo.create({ name, email, password: hashed, role: role as Role });

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  async login(email: string, password: string) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid email or password');

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
