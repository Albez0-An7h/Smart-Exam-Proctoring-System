import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { getErrorMessage } from '../utils/http';

export class AuthController {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role } = req.body;
      if (!name || !email || !password || !role) {
        res.status(400).json({ error: 'name, email, password, and role are required' });
        return;
      }
      const result = await this.authService.register(name, email, password, role);
      res.status(201).json(result);
    } catch (err: unknown) {
      res.status(400).json({ error: getErrorMessage(err, 'Registration failed') });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ error: 'email and password are required' });
        return;
      }
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (err: unknown) {
      res.status(401).json({ error: getErrorMessage(err, 'Login failed') });
    }
  }
}
