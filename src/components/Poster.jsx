import { genreHue } from "../utils/genreHue";
import { usePoster } from "../hooks/usePoster";

/* Movie poster image. If no image can be loaded, a colored placeholder with the title is shown. */
export default function Poster({ movie, badge }) {
  const { url, onError } = usePoster(movie);

  return (
    <span className="poster" style={{ "--h": genreHue(movie.genres[0]) }}>
      {!url && (
        <>
          <span className="poster-year" aria-hidden="true">
            {movie.year}
          </span>
          <span className="poster-title" aria-hidden="true">
            {movie.title}
          </span>
        </>
      )}
      {url && <img key={url} className="poster-img" src={url} alt={`${movie.title} poster`} loading="lazy" onError={onError} />}
      {badge && <span className="badge">{badge}</span>}
    </span>
  );
}
