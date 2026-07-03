import { getLadder, getMilestones, formatMoney } from '../data/moneyLadders';

interface MoneyLadderProps {
  length: number; // number of questions / prize rungs
  currentIndex: number;
  playerLabel?: string;
}

export function MoneyLadder({ length, currentIndex, playerLabel }: MoneyLadderProps) {
  const ladder = getLadder(length);
  const ms = getMilestones(length);

  return (
    <div className="money-ladder">
      {playerLabel && <div className="money-ladder__title">{playerLabel}</div>}
      {[...ladder].reverse().map((amount, reverseIdx) => {
        const idx = ladder.length - 1 - reverseIdx;
        const isCurrent = idx === currentIndex;
        const isPassed = idx < currentIndex;
        const isMilestone = ms.includes(idx);

        const classes = [
          'money-ladder__step',
          isCurrent && 'money-ladder__step--current',
          isPassed && 'money-ladder__step--passed',
          isMilestone && 'money-ladder__step--milestone',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div key={idx} className={classes}>
            <span className="money-ladder__step-num">{idx + 1}</span>
            <span className="money-ladder__step-amount">{formatMoney(amount)}</span>
          </div>
        );
      })}
    </div>
  );
}
