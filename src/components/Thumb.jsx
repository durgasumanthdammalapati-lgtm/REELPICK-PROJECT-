import { usePoster } from "../hooks/usePoster";

/* Small poster used in lists. */
export default function Thumb({ movie }) {
  const { url, onError } = usePoster(movie);
  if (!url) return <span className="thumb thumb-empty" aria-hidden="true" />;
  return <img className="thumb" src={url} alt="" loading="lazy" onError={onError} />;
}
