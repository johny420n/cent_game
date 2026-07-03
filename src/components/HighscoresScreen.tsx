import type { HighscoreEntry } from '../types';

interface HighscoresScreenProps {
  highscores: HighscoreEntry[];
  onBack: () => void;
}

export function HighscoresScreen({ highscores, onBack }: HighscoresScreenProps) {
  return (
    <div className="highscores-screen">
      <h1 className="highscores-screen__title">Hall of Fame</h1>

      {highscores.length === 0 ? (
        <p className="highscores-empty">No highscores yet. Play a game to get on the board!</p>
      ) : (
        <table className="highscores-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Score</th>
              <th>Questions</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {highscores.map((entry, i) => (
              <tr key={i}>
                <td className="highscores-table__rank">{i + 1}</td>
                <td>{entry.name}</td>
                <td className="highscores-table__score">{entry.score} / {entry.questionsPlayed}</td>
                <td>{entry.questionsPlayed}</td>
                <td>{entry.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="back-btn" onClick={onBack}>
        Back to Menu
      </button>
    </div>
  );
}
