import { SubmissionRepository } from '../repositories/SubmissionRepository';
import { EvaluationEngine, MCQEvaluationStrategy, CodingEvaluationStrategy } from './EvaluationStrategy';

interface CodingTestCase {
  input: string;
  expectedOutput: string;
}

export class EvaluationService {
  constructor(private readonly submissionRepo: SubmissionRepository = new SubmissionRepository()) {}

  async evaluateAttempt(attemptId: string): Promise<number> {
    const submissions = await this.submissionRepo.findByAttempt(attemptId);
    let totalScore = 0;

    for (const sub of submissions) {
      const qData = sub.question;
      let score = 0;

      if (qData.type === 'MCQ') {
        const engine = new EvaluationEngine(new MCQEvaluationStrategy());
        const raw = engine.executeEvaluation(sub.answer, qData.correctAnswer ?? '');
        score = raw * qData.marks;
      } else if (qData.type === 'CODING') {
        const engine = new EvaluationEngine(new CodingEvaluationStrategy());
        const totalCases = qData.testCases.length;
        if (totalCases > 0) {
          const passRatio = engine.executeEvaluation(sub.answer, qData.testCases as CodingTestCase[]);
          score = Math.round(passRatio * qData.marks);
        }
      } else {
        score = 0;
      }

      await this.submissionRepo.updateScore(attemptId, qData.id, score);
      totalScore += score;
    }

    return totalScore;
  }
}
