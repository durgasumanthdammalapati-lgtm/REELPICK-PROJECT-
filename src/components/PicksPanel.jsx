import { movies } from "../data/movies";
import Thumb from "./Thumb";

export default function PicksPanel({ liked, onRemove, onClear }) {
  const likedMovies = liked.map((id) => movies.find((m) => m.id === id)).filter(Boolean);

  return (
    <aside className="picks" aria-label="Your picks">
      <h2>Your picks</h2>
      {likedMovies.length === 0 ? (
        <p className="hint">Tap the heart on a movie to add it here.</p>
      ) : (
        <>
          <ul>
            {likedMovies.map((m) => (
              <li key={m.id}>
                <Thumb movie={m} />
                <span className="pick-title">{m.title}</span>
                <button
                  type="button"
                  className="remove"
                  aria-label={`Remove ${m.title}`}
                  onClick={() => onRemove(m.id)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="btn btn-ghost" onClick={onClear}>
            Clear all
          </button>
        </>
      )}
    </aside>
  );
}
