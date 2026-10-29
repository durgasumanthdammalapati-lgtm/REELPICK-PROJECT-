/*
 * Small client for The Movie Database (TMDB) API v3.
 * Put your key in a .env file:  VITE_TMDB_API_KEY=your_key_here
 * Both the v3 "API Key" and the v4 "API Read Access Token" work.
 */

const KEY = (import.meta.env.VITE_TMDB_API_KEY || "").trim();
const BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

/** False when no key is configured. The app then falls back to local data. */
export const tmdbEnabled = KEY.length > 0;

// A v3 key is 32 characters. A v4 read token is a long JWT.
const isBearerToken = KEY.length > 40;

// TMDB genre ids -> names (these ids are fixed).
const GENRES = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};

async function get(path, params = {}) {
  if (!tmdbEnabled) throw new Error("TMDB API key is not set.");

  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const headers = { accept: "application/json" };
  if (isBearerToken) headers.Authorization = `Bearer ${KEY}`;
  else url.searchParams.set("api_key", KEY);

  const res = await fetch(url, { headers });
  if (res.status === 401) throw new Error("TMDB rejected the API key. Check your .env file.");
  if (!res.ok) throw new Error(`TMDB request failed (${res.status}).`);
  return res.json();
}

/** Full poster URL from a TMDB poster_path (or null). */
export function imageUrl(path, size = "w342") {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

export const tmdbMovieUrl = (id) => `https://www.themoviedb.org/movie/${id}`;

/** Convert a raw TMDB movie into the shape the app's cards expect. */
export function normalizeMovie(r) {
  return {
    id: r.id,
    source: "tmdb",
    title: r.title,
    year: r.release_date ? Number(r.release_date.slice(0, 4)) : "",
    genres: (r.genre_ids || []).map((g) => GENRES[g]).filter(Boolean),
    rating: r.vote_average || 0,
    overview: r.overview || "",
    posterUrl: imageUrl(r.poster_path),
  };
}

/** Find the TMDB entry for one of our local movies (used to get its poster). */
export async function searchMovie(title, year) {
  const data = await get("/search/movie", { query: title, year, include_adult: "false" });
  const hit = data.results && data.results[0];
  if (!hit) return { tmdbId: null, posterPath: null, overview: "" };
  return { tmdbId: hit.id, posterPath: hit.poster_path, overview: hit.overview || "" };
}

/** Raw TMDB recommendations for one movie id. */
export async function getRecommendations(tmdbId) {
  const data = await get(`/movie/${tmdbId}/recommendations`);
  return data.results || [];
}

/** Raw list of movies trending this week. */
export async function getTrending() {
  const data = await get("/trending/movie/week");
  return data.results || [];
}
