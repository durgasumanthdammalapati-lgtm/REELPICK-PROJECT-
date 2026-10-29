import { useEffect, useMemo, useState } from "react";
import { useCatalog } from "../context/CatalogContext";
import { imageUrl } from "../api/tmdb";

/*
 * Picks the best image for a movie and falls back automatically:
 *   1. the real TMDB poster (only when an API key is set)
 *   2. the image in /public/posters
 *   3. nothing (the caller shows a colored placeholder)
 */
export function usePoster(movie) {
  const { extras } = useCatalog();

  const sources = useMemo(() => {
    if (movie.source === "tmdb") return movie.posterUrl ? [movie.posterUrl] : [];
    const entry = extras[movie.id];
    const tmdb = entry && entry.posterPath ? imageUrl(entry.posterPath) : null;
    return [tmdb, movie.poster].filter(Boolean);
  }, [movie, extras]);

  const key = sources.join("|");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [key]);

  return {
    url: sources[index] || null,
    onError: () => setIndex((i) => i + 1),
  };
}
