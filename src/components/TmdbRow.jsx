import TmdbCard from "./TmdbCard";

function SkeletonCard() {
  return (
    <div className="card skeleton" aria-hidden="true">
      <div className="sk-poster" />
      <div className="card-body">
        <div className="sk-line" />
        <div className="sk-line sk-short" />
      </div>
    </div>
  );
}

/** A titled row of TMDB movies with loading and error states. */
export default function TmdbRow({ title, hint, state }) {
  const { items, loading, error } = state;
  if (!loading && !error && items.length === 0) return null;

  return (
    <section className="row" aria-busy={loading}>
      <div className="row-head">
        <div>
          <h2>{title}</h2>
          {hint && <p className="hint">{hint}</p>}
        </div>
      </div>

      {error && (
        <p className="form-error" role="alert">
          Could not load movies from TMDB. {error}
        </p>
      )}

      {loading && (
        <div className="grid">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && (
        <div className="grid">
          {items.map((movie) => (
            <TmdbCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
