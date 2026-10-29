import { createContext, useContext, useEffect, useState } from "react";
import { movies } from "../data/movies";
import { searchMovie, tmdbEnabled } from "../api/tmdb";

/*
 * Looks up each local movie on TMDB once, then remembers the result in
 * localStorage so the next visit loads posters instantly.
 * extras = { [localMovieId]: { tmdbId, posterPath, overview } }
 */

const CACHE_KEY = "mr_tmdb_catalog_v1";
const CatalogContext = createContext({ extras: {}, enabled: false });

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function CatalogProvider({ children }) {
  const [extras, setExtras] = useState(() => (tmdbEnabled ? readCache() : {}));

  useEffect(() => {
    if (!tmdbEnabled) return undefined;
    const missing = movies.filter((m) => !extras[m.id]);
    if (missing.length === 0) return undefined;

    let cancelled = false;
    (async () => {
      const results = await Promise.allSettled(missing.map((m) => searchMovie(m.title, m.year)));
      if (cancelled) return;

      const found = {};
      results.forEach((r, i) => {
        // Network errors are skipped so they are retried next visit.
        if (r.status === "fulfilled") found[missing[i].id] = r.value;
      });
      if (Object.keys(found).length === 0) return;

      setExtras((prev) => {
        const merged = { ...prev, ...found };
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
        } catch {
          /* storage unavailable */
        }
        return merged;
      });
    })();

    return () => {
      cancelled = true;
    };
    // Runs once on start-up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <CatalogContext.Provider value={{ extras, enabled: tmdbEnabled }}>{children}</CatalogContext.Provider>;
}

export const useCatalog = () => useContext(CatalogContext);
