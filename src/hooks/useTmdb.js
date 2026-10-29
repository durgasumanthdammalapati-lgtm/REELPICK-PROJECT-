import { useEffect, useState } from "react";
import { getRecommendations, getTrending, normalizeMovie, tmdbEnabled } from "../api/tmdb";

const idle = { items: [], loading: false, error: "" };
const recCache = new Map(); // tmdbId -> raw recommendations (kept for this session)

/** Movies trending on TMDB this week. */
export function useTrending(limit = 6) {
  const [state, setState] = useState({ ...idle, loading: tmdbEnabled });

  useEffect(() => {
    if (!tmdbEnabled) return undefined;
    let cancelled = false;
    getTrending()
      .then((raw) => {
        if (!cancelled) {
          setState({ items: raw.filter((m) => m.poster_path).slice(0, limit).map(normalizeMovie), loading: false, error: "" });
        }
      })
      .catch((e) => {
        if (!cancelled) setState({ items: [], loading: false, error: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return state;
}

/**
 * Live recommendations based on the user's liked movies.
 * Asks TMDB for suggestions for each of the last 5 liked movies, then ranks
 * movies that show up more often (and have higher ratings) first.
 * `extras` maps local movie ids to their TMDB ids (from CatalogContext).
 */
export function useTmdbRecommendations(likedIds, extras, limit = 6) {
  const [state, setState] = useState(idle);

  const seedKey = likedIds
    .slice(-5)
    .map((id) => extras[id] && extras[id].tmdbId)
    .filter(Boolean)
    .join(",");
  const knownCount = Object.keys(extras).length;

  useEffect(() => {
    if (!tmdbEnabled || !seedKey) {
      setState(idle);
      return undefined;
    }

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: "" }));

    // Movies already in the local library are shown in the other rows.
    const local = new Set(Object.values(extras).map((e) => e.tmdbId).filter(Boolean));
    const seeds = seedKey.split(",").map(Number);

    (async () => {
      try {
        const lists = await Promise.all(
          seeds.map(async (id) => {
            if (!recCache.has(id)) recCache.set(id, await getRecommendations(id));
            return recCache.get(id);
          })
        );

        const scored = new Map();
        lists.forEach((list) =>
          list.forEach((m) => {
            if (!m.poster_path || local.has(m.id)) return;
            const entry = scored.get(m.id) || { movie: m, score: 0 };
            entry.score += 1 + (m.vote_average || 0) / 10;
            scored.set(m.id, entry);
          })
        );

        const items = [...scored.values()]
          .sort((a, b) => b.score - a.score)
          .slice(0, limit)
          .map((e) => normalizeMovie(e.movie));

        if (!cancelled) setState({ items, loading: false, error: "" });
      } catch (e) {
        if (!cancelled) setState({ items: [], loading: false, error: e.message });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seedKey, knownCount, limit]);

  return state;
}
