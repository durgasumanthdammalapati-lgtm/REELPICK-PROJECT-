import Poster from "./Poster";
import { HeartIcon, StarIcon } from "./Icons";

export default function MovieCard({ movie, liked, onToggleLike, onOpen, badge }) {
  return (
    <article className="card">
      <div className="card-media">
        <button
          type="button"
          className="card-open"
          onClick={() => onOpen(movie.id)}
          aria-label={`View details for ${movie.title}`}
        >
          <Poster movie={movie} badge={badge} />
          <span className="overlay" aria-hidden="true">
            <span className="overlay-text">{movie.description}</span>
            <span className="overlay-cta">View details</span>
          </span>
        </button>

        <button
          type="button"
          className={`heart ${liked ? "is-liked" : ""}`}
          aria-pressed={liked}
          aria-label={liked ? `Remove ${movie.title} from your picks` : `Add ${movie.title} to your picks`}
          onClick={() => onToggleLike(movie.id)}
        >
          <HeartIcon filled={liked} />
        </button>
      </div>

      <div className="card-body">
        <h3 className="card-title">{movie.title}</h3>
        <p className="meta">
          {movie.year}, {movie.genres.slice(0, 2).join(", ")}
        </p>
        <p className="rating">
          <StarIcon /> {movie.rating.toFixed(1)}
        </p>
      </div>
    </article>
  );
}
