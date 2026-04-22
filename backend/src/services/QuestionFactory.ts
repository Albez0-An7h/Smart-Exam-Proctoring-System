import { Question, QuestionType, MCQQuestion, CodingQuestion, SubjectiveQuestion } from '../models/Question';

interface QuestionFactoryInput {
  id: string;
  examId: string;
  type: QuestionType;
  text: string;
  marks: number;
  options?: string[];
  correctAnswer?: string;
  starterCode?: string;
}

export class QuestionFactory {
  static createQuestion(data: QuestionFactoryInput): Question {
    switch (data.type) {
      case QuestionType.MCQ:
        if (!data.options || !data.correctAnswer) {
          throw new Error('MCQ question requires options and correctAnswer');
        }
        return new MCQQuestion(data.id, data.examId, data.text, data.marks, data.options, data.correctAnswer);
      case QuestionType.CODING:
        return new CodingQuestion(data.id, data.examId, data.text, data.marks, data.starterCode ?? '');
      case QuestionType.SUBJECTIVE:
        return new SubjectiveQuestion(data.id, data.examId, data.text, data.marks);
      default:
        throw new Error('Invalid question type');
    }
  }
}
