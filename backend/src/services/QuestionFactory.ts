import { Question, QuestionType, MCQQuestion, CodingQuestion, SubjectiveQuestion } from '../models/Question';

export class QuestionFactory {
  static createQuestion(data: any): Question {
    switch (data.type) {
      case QuestionType.MCQ:
        return new MCQQuestion(data.id, data.examId, data.text, data.marks, data.options, data.correctAnswer);
      case QuestionType.CODING:
        return new CodingQuestion(data.id, data.examId, data.text, data.marks, data.starterCode);
      case QuestionType.SUBJECTIVE:
        return new SubjectiveQuestion(data.id, data.examId, data.text, data.marks);
      default:
        throw new Error('Invalid question type');
    }
  }
}
