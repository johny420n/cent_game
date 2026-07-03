const LETTERS = ['A', 'B', 'C', 'D'];

interface AnswerButtonProps {
  index: number;
  text: string;
  eliminated: boolean;
  isCorrect: boolean;
  isWrong: boolean;
  selected?: boolean;
  disabled: boolean;
  onClick: () => void;
}

export function AnswerButton({
  index,
  text,
  eliminated,
  isCorrect,
  isWrong,
  selected,
  disabled,
  onClick,
}: AnswerButtonProps) {
  const classes = [
    'answer-btn',
    eliminated && 'answer-btn--eliminated',
    isCorrect && 'answer-btn--correct',
    isWrong && 'answer-btn--wrong',
    selected && 'answer-btn--selected',
    disabled && 'answer-btn--disabled',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} onClick={onClick} disabled={eliminated || disabled}>
      <span className="answer-btn__letter">{LETTERS[index]}</span>
      <span>{text}</span>
    </button>
  );
}
