import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { signToken } from '../utils/jwt';
import { Role } from '../../generated/prisma/enums';

export class AuthService {
  constructor(private readonly userRepo: UserRepository = new UserRepository()) {}

  private parseRole(role: string): Role {
    if ((Object.values(Role) as string[]).includes(role)) {
      return role as Role;
    }
    throw new Error('Invalid role');
  }

  async register(name: string, email: string, password: string, role: string) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = this.parseRole(role);

    const existing = await this.userRepo.findByEmail(normalizedEmail);
    if (existing) throw new Error('Email already registered');

    const hashed = await bcrypt.hash(password, 10);
    const user = await this.userRepo.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
      role: normalizedRole,
    });

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email.trim().toLowerCase());
    if (!user) throw new Error('Invalid email or password');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Invalid email or password');

    const token = signToken({ id: user.id, email: user.email, name: user.name, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}
