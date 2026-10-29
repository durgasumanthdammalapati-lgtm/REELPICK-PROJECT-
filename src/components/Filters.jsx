import { allGenres } from "../data/movies";

export default function Filters({ query, onQuery, genre, onGenre, sort, onSort }) {
  return (
    <div className="filters">
      <div className="toolbar">
        <label className="field grow">
          <span>Search</span>
          <input
            type="search"
            placeholder="Title or director"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Sort by</span>
          <select value={sort} onChange={(e) => onSort(e.target.value)}>
            <option value="rating">Rating</option>
            <option value="year">Newest</option>
            <option value="title">Title</option>
          </select>
        </label>
      </div>

      <div className="chip-row" role="group" aria-label="Filter by genre">
        {["All", ...allGenres].map((g) => (
          <button
            key={g}
            type="button"
            className={`chip chip-btn ${g === genre ? "is-active" : ""}`}
            aria-pressed={g === genre}
            onClick={() => onGenre(g)}
          >
            {g}
          </button>
        ))}
      </div>
    </div>
  );
}
