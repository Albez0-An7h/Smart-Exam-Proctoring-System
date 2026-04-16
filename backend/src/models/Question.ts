export enum QuestionType {
  MCQ = 'MCQ',
  SUBJECTIVE = 'SUBJECTIVE',
  CODING = 'CODING'
}

export abstract class Question {
  constructor(
    public id: string,
    public examId: string,
    public text: string,
    public marks: number,
    public type: QuestionType
  ) {}

  /**
   * Abstract method for evaluating a specific question's answer.
   */
  abstract evaluate(answer: string | any): number;
}

export class MCQQuestion extends Question {
  constructor(
    id: string,
    examId: string,
    text: string,
    marks: number,
    public options: string[],
    public correctAnswer: string
  ) {
    super(id, examId, text, marks, QuestionType.MCQ);
  }

  evaluate(answer: string): number {
    return 0;
  }
}

export class CodingQuestion extends Question {
  constructor(
    id: string,
    examId: string,
    text: string,
    marks: number,
    public starterCode: string
  ) {
    super(id, examId, text, marks, QuestionType.CODING);
  }

  evaluate(answer: string): number {
    return 0;
  }
}

export class SubjectiveQuestion extends Question {
  constructor(id: string, examId: string, text: string, marks: number) {
    super(id, examId, text, marks, QuestionType.SUBJECTIVE);
  }

  evaluate(answer: string): number {
    return 0;
  }
}
