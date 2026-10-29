import MovieCard from "./MovieCard";

// A titled grid of movie cards. `items` is [{ movie, score }].
// Leave `title` out to render just the grid.
export default function MovieRow({ title, hint, items, liked, onToggleLike, onOpen, badgeFor, action }) {
  if (!items.length) return null;

  const grid = (
    <div className="grid">
      {items.map(({ movie, score }) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          liked={liked.includes(movie.id)}
          onToggleLike={onToggleLike}
          onOpen={onOpen}
          badge={badgeFor && score != null ? badgeFor(score) : undefined}
        />
      ))}
    </div>
  );

  if (!title) return grid;

  return (
    <section className="row">
      <div className="row-head">
        <div>
          <h2>{title}</h2>
          {hint && <p className="hint">{hint}</p>}
        </div>
        {action}
      </div>
      {grid}
    </section>
  );
}
