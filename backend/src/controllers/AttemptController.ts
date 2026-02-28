import { Request, Response } from 'express';
import { AttemptService } from '../services/AttemptService';

const attemptService = new AttemptService();

export class AttemptController {
  async startExam(req: Request, res: Response) {
    try {
      const studentId = req.user!.id;
      const { id: examId } = req.params;
      const attempt = await attemptService.startExam(studentId, String(examId));
      res.status(201).json(attempt);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async saveAnswer(req: Request, res: Response) {
    try {
      const studentId = req.user!.id;
      const { id: attemptId } = req.params;
      const { questionId, answer } = req.body;
      if (!questionId || answer === undefined) {
        res.status(400).json({ error: 'questionId and answer are required' });
        return;
      }
      const submission = await attemptService.saveAnswer(String(attemptId), studentId, questionId, answer);
      res.json(submission);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async submitExam(req: Request, res: Response) {
    try {
      const studentId = req.user!.id;
      const { id: attemptId } = req.params;
      const result = await attemptService.submitExam(String(attemptId), studentId);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getResult(req: Request, res: Response) {
    try {
      const studentId = req.user!.id;
      const { id: attemptId } = req.params;
      const result = await attemptService.getAttemptResult(String(attemptId), studentId);
      res.json(result);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async getHistory(req: Request, res: Response) {
    try {
      const studentId = req.user!.id;
      const history = await attemptService.getStudentHistory(studentId);
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
