import { Request, Response } from 'express';
import { ExamService } from '../services/ExamService';

const examService = new ExamService();

export class ExamController {
  async createExam(req: Request, res: Response) {
    try {
      const { title, duration } = req.body;
      const teacherId = req.user!.id;
      const exam = await examService.createExam(title, duration, teacherId);
      res.status(201).json(exam);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async addQuestion(req: Request, res: Response) {
    try {
      const { id: examId } = req.params;
      const teacherId = req.user!.id;
      const question = await examService.addQuestion(String(examId), teacherId, req.body);
      res.status(201).json(question);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async publishExam(req: Request, res: Response) {
    try {
      const { id: examId } = req.params;
      const teacherId = req.user!.id;
      const exam = await examService.publishExam(String(examId), teacherId);
      res.json(exam);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  async getMyExams(req: Request, res: Response) {
    try {
      const teacherId = req.user!.id;
      const exams = await examService.getTeacherExams(teacherId);
      res.json(exams);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPublishedExams(req: Request, res: Response) {
    try {
      const exams = await examService.getPublishedExams();
      res.json(exams);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  async getExamById(req: Request, res: Response) {
    try {
      const exam = await examService.getExamById(String(req.params.id));
      res.json(exam);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  async getExamViolations(req: Request, res: Response) {
    try {
      const { id: examId } = req.params;
      const teacherId = req.user!.id;
      const violations = await examService.getExamViolations(String(examId), teacherId);
      res.json(violations);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
