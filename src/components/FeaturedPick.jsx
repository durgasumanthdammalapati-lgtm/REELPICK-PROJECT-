import Poster from "./Poster";
import { HeartIcon, StarIcon } from "./Icons";

/* One big recommendation at the top of the Discover page. */
export default function FeaturedPick({ movie, matchLabel, liked, onToggleLike, onOpen }) {
  return (
    <section className="featured" aria-labelledby="featured-heading">
      <h2 id="featured-heading" className="featured-heading">
        Tonight's pick
      </h2>
      <div className="featured-card">
        <div className="featured-poster">
          <Poster movie={movie} />
        </div>
        <div className="featured-info">
          <h3>{movie.title}</h3>
          <p className="meta">
            {movie.year}, directed by {movie.director}
          </p>
          <div className="chips">
            {matchLabel && <span className="chip chip-accent">{matchLabel}</span>}
            {movie.genres.map((g) => (
              <span key={g} className="chip">
                {g}
              </span>
            ))}
            <span className="chip chip-rating">
              <StarIcon /> {movie.rating.toFixed(1)}
            </span>
          </div>
          <p className="featured-desc">{movie.description}</p>
          <div className="dialog-actions">
            <button
              type="button"
              className={`btn ${liked ? "btn-on" : ""}`}
              aria-pressed={liked}
              onClick={() => onToggleLike(movie.id)}
            >
              <HeartIcon filled={liked} /> {liked ? "In your picks" : "Add to my picks"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => onOpen(movie.id)}>
              View details
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
