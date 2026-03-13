export interface EvaluationStrategy {
  evaluate(answer: string, correctAnswer: any): number;
}

export class MCQEvaluationStrategy implements EvaluationStrategy {
  /** Returns 1 if answer matches correctAnswer, 0 otherwise. Caller multiplies by marks. */
  evaluate(answer: string, correctAnswer: string): number {
    return answer.trim() === correctAnswer.trim() ? 1 : 0;
  }
}

export class CodingEvaluationStrategy implements EvaluationStrategy {
  /**
   * Returns a ratio (0.0 – 1.0) of test cases passed.
   * Each test case: { input: string, expectedOutput: string }
   * Answer is treated as the program's output for a simplistic comparison.
   */
  evaluate(answer: string, testCases: { input: string; expectedOutput: string }[]): number {
    if (!testCases || testCases.length === 0) return 0;
    let passed = 0;
    for (const tc of testCases) {
      if (answer.trim() === tc.expectedOutput.trim()) passed++;
    }
    return passed / testCases.length;
  }
}

export class EvaluationEngine {
  private strategy: EvaluationStrategy;

  constructor(strategy: EvaluationStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: EvaluationStrategy) {
    this.strategy = strategy;
  }

  executeEvaluation(answer: string, data: any): number {
    return this.strategy.evaluate(answer, data);
  }
}
