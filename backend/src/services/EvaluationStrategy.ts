export interface EvaluationStrategy<TData> {
  evaluate(answer: string, correctAnswer: TData): number;
}

export class MCQEvaluationStrategy implements EvaluationStrategy<string> {
  /** Returns 1 if answer matches correctAnswer, 0 otherwise. Caller multiplies by marks. */
  evaluate(answer: string, correctAnswer: string): number {
    return answer.trim() === correctAnswer.trim() ? 1 : 0;
  }
}

export class CodingEvaluationStrategy implements EvaluationStrategy<{ input: string; expectedOutput: string }[]> {
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

export class EvaluationEngine<TData> {
  constructor(private readonly strategy: EvaluationStrategy<TData>) {}

  executeEvaluation(answer: string, data: TData): number {
    return this.strategy.evaluate(answer, data);
  }
}
