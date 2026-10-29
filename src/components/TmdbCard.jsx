import Poster from "./Poster";
import { StarIcon } from "./Icons";
import { tmdbMovieUrl } from "../api/tmdb";

/** Card for a movie that comes from the TMDB API (not in the local library). */
export default function TmdbCard({ movie }) {
  return (
    <article className="card">
      <div className="card-media">
        <Poster movie={movie} />
      </div>

      <div className="card-body">
        <h3 className="card-title">{movie.title}</h3>
        <p className="meta">{[movie.year, movie.genres.slice(0, 2).join(", ")].filter(Boolean).join(", ")}</p>
        <p className="rating">
          <StarIcon /> {movie.rating.toFixed(1)}
        </p>
        {movie.overview && <p className="overview">{movie.overview}</p>}

        <div className="actions">
          <a className="btn btn-ghost btn-sm" href={tmdbMovieUrl(movie.id)} target="_blank" rel="noopener noreferrer">
            View on TMDB
          </a>
        </div>
      </div>
    </article>
  );
}
