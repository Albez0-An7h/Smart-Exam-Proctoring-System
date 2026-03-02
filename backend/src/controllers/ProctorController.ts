import { Request, Response } from 'express';
import { ProctorService } from '../services/ProctorService';

const proctorService = new ProctorService();

export class ProctorController {
  async logEvent(req: Request, res: Response) {
    try {
      const { id: attemptId } = req.params;
      const { eventType } = req.body;
      if (!eventType) {
        res.status(400).json({ error: 'eventType is required' });
        return;
      }
      const result = await proctorService.logEvent(String(attemptId), eventType);
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getLogs(req: Request, res: Response) {
    try {
      const { id: attemptId } = req.params;
      const logs = await proctorService.getLogsForAttempt(String(attemptId));
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
}
