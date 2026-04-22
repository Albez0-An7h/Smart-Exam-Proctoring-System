import { Request, Response } from 'express';
import { ExamService } from '../services/ExamService';
import { getAuthenticatedUser, getErrorMessage } from '../utils/http';

export class ExamController {
  constructor(private readonly examService: ExamService = new ExamService()) {}

  async createExam(req: Request, res: Response) {
    try {
      const { title, duration } = req.body;
      const teacherId = getAuthenticatedUser(req).id;
      const exam = await this.examService.createExam(title, duration, teacherId);
      res.status(201).json(exam);
    } catch (err: unknown) {
      res.status(400).json({ error: getErrorMessage(err, 'Failed to create exam') });
    }
  }

  async addQuestion(req: Request, res: Response) {
    try {
      const { id: examId } = req.params;
      const teacherId = getAuthenticatedUser(req).id;
      const question = await this.examService.addQuestion(String(examId), teacherId, req.body);
      res.status(201).json(question);
    } catch (err: unknown) {
      res.status(400).json({ error: getErrorMessage(err, 'Failed to add question') });
    }
  }

  async publishExam(req: Request, res: Response) {
    try {
      const { id: examId } = req.params;
      const teacherId = getAuthenticatedUser(req).id;
      const exam = await this.examService.publishExam(String(examId), teacherId);
      res.json(exam);
    } catch (err: unknown) {
      res.status(400).json({ error: getErrorMessage(err, 'Failed to publish exam') });
    }
  }

  async getMyExams(req: Request, res: Response) {
    try {
      const teacherId = getAuthenticatedUser(req).id;
      const exams = await this.examService.getTeacherExams(teacherId);
      res.json(exams);
    } catch (err: unknown) {
      res.status(500).json({ error: getErrorMessage(err) });
    }
  }

  async getPublishedExams(req: Request, res: Response) {
    try {
      const exams = await this.examService.getPublishedExams();
      res.json(exams);
    } catch (err: unknown) {
      res.status(500).json({ error: getErrorMessage(err) });
    }
  }

  async getExamById(req: Request, res: Response) {
    try {
      const exam = await this.examService.getExamById(String(req.params.id));
      res.json(exam);
    } catch (err: unknown) {
      res.status(404).json({ error: getErrorMessage(err, 'Exam not found') });
    }
  }

  async getExamViolations(req: Request, res: Response) {
    try {
      const { id: examId } = req.params;
      const teacherId = getAuthenticatedUser(req).id;
      const violations = await this.examService.getExamViolations(String(examId), teacherId);
      res.json(violations);
    } catch (err: unknown) {
      res.status(400).json({ error: getErrorMessage(err, 'Failed to fetch violations') });
    }
  }
}
