import { movies, userRatings } from "../data/movies";

const WEIGHTS = { genre: 3, director: 2, tag: 1.5 };

// Turn a movie into a sparse feature vector.
function vectorize(movie) {
  const vec = {};
  movie.genres.forEach((g) => (vec[`genre:${g}`] = WEIGHTS.genre));
  vec[`director:${movie.director}`] = WEIGHTS.director;
  movie.tags.forEach((t) => (vec[`tag:${t}`] = WEIGHTS.tag));
  return vec;
}

function cosine(a, b) {
  let dot = 0, magA = 0, magB = 0;
  for (const k in a) {
    magA += a[k] ** 2;
    if (k in b) dot += a[k] * b[k];
  }
  for (const k in b) magB += b[k] ** 2;
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
}

const byId = (id) => movies.find((m) => m.id === id);

/** Movies most similar to one movie. Returns [{ movie, score }] with score 0-1. */
export function similarTo(id, n = 6) {
  const target = byId(id);
  if (!target) return [];
  const tv = vectorize(target);
  return movies
    .filter((m) => m.id !== id)
    .map((m) => ({ movie: m, score: cosine(tv, vectorize(m)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/** Content-based: build a taste profile from liked ids and rank the rest. */
export function recommendFromLiked(likedIds, n = 6) {
  const liked = likedIds.map(byId).filter(Boolean);
  if (!liked.length) return [];

  const profile = {};
  liked.forEach((m) => {
    const v = vectorize(m);
    for (const k in v) profile[k] = (profile[k] || 0) + v[k] / liked.length;
  });

  const seen = new Set(likedIds);
  return movies
    .filter((m) => !seen.has(m.id))
    .map((m) => ({
      movie: m,
      score: 0.85 * cosine(profile, vectorize(m)) + 0.15 * (m.rating / 10),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

function userSimilarity(r1, r2) {
  const common = Object.keys(r1).filter((id) => id in r2);
  if (!common.length) return 0;
  let dot = 0, m1 = 0, m2 = 0;
  common.forEach((id) => {
    dot += r1[id] * r2[id];
    m1 += r1[id] ** 2;
    m2 += r2[id] ** 2;
  });
  return dot / (Math.sqrt(m1) * Math.sqrt(m2));
}

/**
 * Collaborative filtering: treat each liked movie as a 5-star rating, find
 * viewers with similar taste, and predict ratings (1-5) for unseen movies.
 */
export function collaborativePicks(likedIds, n = 6) {
  if (!likedIds.length) return [];
  const mine = Object.fromEntries(likedIds.map((id) => [id, 5]));

  const totals = {}, simSums = {};
  for (const theirs of Object.values(userRatings)) {
    const sim = userSimilarity(mine, theirs);
    if (sim <= 0) continue;
    for (const [id, rating] of Object.entries(theirs)) {
      if (id in mine) continue;
      totals[id] = (totals[id] || 0) + sim * rating;
      simSums[id] = (simSums[id] || 0) + sim;
    }
  }

  return Object.keys(totals)
    .map((id) => ({ movie: byId(Number(id)), score: totals[id] / simSums[id] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
