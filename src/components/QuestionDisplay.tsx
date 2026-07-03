import type { Question } from '../types';

interface QuestionDisplayProps {
  question: Question;
}

export function QuestionDisplay({ question }: QuestionDisplayProps) {
  return (
    <div className="question-display">
      <span className="question-display__category">{question.category}</span>
      <p className="question-display__text">{question.question}</p>
    </div>
  );
}
