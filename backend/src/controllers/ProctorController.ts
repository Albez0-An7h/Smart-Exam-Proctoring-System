import { Request, Response } from 'express';
import { ProctorService } from '../services/ProctorService';
import { getErrorMessage } from '../utils/http';

export class ProctorController {
  constructor(private readonly proctorService: ProctorService = new ProctorService()) {}

  async logEvent(req: Request, res: Response) {
    try {
      const { id: attemptId } = req.params;
      const { eventType } = req.body;
      if (!eventType) {
        res.status(400).json({ error: 'eventType is required' });
        return;
      }
      const result = await this.proctorService.logEvent(String(attemptId), eventType);
      res.status(201).json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: getErrorMessage(err) });
    }
  }

  async getLogs(req: Request, res: Response) {
    try {
      const { id: attemptId } = req.params;
      const logs = await this.proctorService.getLogsForAttempt(String(attemptId));
      res.json(logs);
    } catch (err: unknown) {
      res.status(500).json({ error: getErrorMessage(err) });
    }
  }
}
