import { useEffect, useRef } from "react";
import Poster from "./Poster";
import { CloseIcon, HeartIcon, StarIcon } from "./Icons";

/* Full movie details in a native <dialog>: Esc closes it, focus is kept inside, and clicking outside closes it. */
export default function MovieDialog({ movie, liked, onToggleLike, onSimilar, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (movie && !dialog.open) dialog.showModal();
    if (!movie && dialog.open) dialog.close();
  }, [movie]);

  return (
    <dialog
      ref={ref}
      className="movie-dialog"
      aria-labelledby="dialog-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {movie && (
        <div className="dialog-grid">
          <button type="button" className="dialog-close" onClick={onClose} aria-label="Close details">
            <CloseIcon />
          </button>

          <Poster movie={movie} />

          <div className="dialog-info">
            <h2 id="dialog-title">{movie.title}</h2>
            <p className="meta">
              {movie.year}, directed by {movie.director}
            </p>

            <div className="chips">
              {movie.genres.map((g) => (
                <span key={g} className="chip">
                  {g}
                </span>
              ))}
            </div>

            <p className="dialog-rating">
              <StarIcon /> <strong>{movie.rating.toFixed(1)}</strong> <span className="meta">out of 10</span>
            </p>

            <p className="dialog-desc">{movie.description}</p>
            <p className="meta">Themes: {movie.tags.join(", ")}</p>

            <div className="dialog-actions">
              <button
                type="button"
                className={`btn ${liked ? "btn-on" : ""}`}
                aria-pressed={liked}
                onClick={() => onToggleLike(movie.id)}
              >
                <HeartIcon filled={liked} /> {liked ? "In your picks" : "Add to my picks"}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => onSimilar(movie.id)}>
                Find similar movies
              </button>
            </div>
          </div>
        </div>
      )}
    </dialog>
  );
}
