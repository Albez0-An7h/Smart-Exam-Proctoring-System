import { Request, Response } from 'express';
import { AttemptService } from '../services/AttemptService';
import { getAuthenticatedUser, getErrorMessage } from '../utils/http';

export class AttemptController {
  constructor(private readonly attemptService: AttemptService = new AttemptService()) {}

  async startExam(req: Request, res: Response) {
    try {
      const studentId = getAuthenticatedUser(req).id;
      const { id: examId } = req.params;
      const attempt = await this.attemptService.startExam(studentId, String(examId));
      res.status(201).json(attempt);
    } catch (err: unknown) {
      res.status(400).json({ error: getErrorMessage(err, 'Failed to start exam') });
    }
  }

  async saveAnswer(req: Request, res: Response) {
    try {
      const studentId = getAuthenticatedUser(req).id;
      const { id: attemptId } = req.params;
      const { questionId, answer } = req.body;
      if (!questionId || answer === undefined) {
        res.status(400).json({ error: 'questionId and answer are required' });
        return;
      }
      const submission = await this.attemptService.saveAnswer(String(attemptId), studentId, questionId, answer);
      res.json(submission);
    } catch (err: unknown) {
      res.status(400).json({ error: getErrorMessage(err, 'Failed to save answer') });
    }
  }

  async submitExam(req: Request, res: Response) {
    try {
      const studentId = getAuthenticatedUser(req).id;
      const { id: attemptId } = req.params;
      const result = await this.attemptService.submitExam(String(attemptId), studentId);
      res.json(result);
    } catch (err: unknown) {
      res.status(400).json({ error: getErrorMessage(err, 'Failed to submit exam') });
    }
  }

  async getResult(req: Request, res: Response) {
    try {
      const studentId = getAuthenticatedUser(req).id;
      const { id: attemptId } = req.params;
      const result = await this.attemptService.getAttemptResult(String(attemptId), studentId);
      res.json(result);
    } catch (err: unknown) {
      res.status(404).json({ error: getErrorMessage(err, 'Result not found') });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const studentId = getAuthenticatedUser(req).id;
      const history = await this.attemptService.getStudentHistory(studentId);
      res.json(history);
    } catch (err: unknown) {
      res.status(500).json({ error: getErrorMessage(err) });
    }
  }
}
