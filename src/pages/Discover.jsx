import { useMemo, useState } from "react";
import { movies } from "../data/movies";
import { recommendFromLiked, collaborativePicks, similarTo } from "../utils/recommender";
import { useAuth } from "../context/AuthContext";
import { useLikes } from "../hooks/useLikes";
import { useCatalog } from "../context/CatalogContext";
import { useTmdbRecommendations, useTrending } from "../hooks/useTmdb";
import MovieRow from "../components/MovieRow";
import Filters from "../components/Filters";
import PicksPanel from "../components/PicksPanel";
import FeaturedPick from "../components/FeaturedPick";
import MovieDialog from "../components/MovieDialog";
import TmdbRow from "../components/TmdbRow";
import ApiNotice from "../components/ApiNotice";

const SORTERS = {
  rating: (a, b) => b.rating - a.rating,
  year: (a, b) => b.year - a.year,
  title: (a, b) => a.title.localeCompare(b.title),
};

const matchLabel = (s) => `${Math.round(s * 100)}% match`;

export default function Discover() {
  const { currentUser } = useAuth();
  const { liked, toggleLike, clearLikes } = useLikes(currentUser.id);
  const { extras, enabled } = useCatalog();

  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All");
  const [sort, setSort] = useState("rating");
  const [similarId, setSimilarId] = useState(null);
  const [openId, setOpenId] = useState(null);

  const library = useMemo(() => {
    const q = query.trim().toLowerCase();
    return movies
      .filter(
        (m) =>
          (genre === "All" || m.genres.includes(genre)) &&
          (!q || m.title.toLowerCase().includes(q) || m.director.toLowerCase().includes(q))
      )
      .sort(SORTERS[sort]);
  }, [query, genre, sort]);

  const contentRecs = useMemo(() => recommendFromLiked(liked, 7), [liked]);
  const collabRecs = useMemo(() => collaborativePicks(liked, 6), [liked]);
  const similar = useMemo(() => (similarId ? similarTo(similarId, 6) : []), [similarId]);
  const apiRecs = useTmdbRecommendations(liked, extras);
  const trending = useTrending(6);

  const similarTitle = similarId ? movies.find((m) => m.id === similarId)?.title : "";
  const openMovie = openId ? movies.find((m) => m.id === openId) : null;

  // Big feature at the top: your best match, or the top-rated movie when nothing is liked yet.
  const topRated = useMemo(() => [...movies].sort(SORTERS.rating)[0], []);
  const best = contentRecs[0];
  const featured = best ? { movie: best.movie, label: matchLabel(best.score) } : { movie: topRated, label: "" };

  const shared = { liked, onToggleLike: toggleLike, onOpen: setOpenId };

  const handleSimilar = (id) => {
    setOpenId(null);
    setSimilarId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <header className="masthead">
        <h1>Hi, {currentUser.name.split(" ")[0]}. What should you watch tonight?</h1>
        <p>Tap the heart on movies you enjoyed to get matching picks.</p>
      </header>

      <ApiNotice />

      <div className="layout">
        <main>
          {similarId && (
            <MovieRow
              title={`Movies similar to ${similarTitle}`}
              items={similar}
              badgeFor={matchLabel}
              action={
                <button type="button" className="btn btn-ghost" onClick={() => setSimilarId(null)}>
                  Close
                </button>
              }
              {...shared}
            />
          )}

          <FeaturedPick
            movie={featured.movie}
            matchLabel={featured.label}
            liked={liked.includes(featured.movie.id)}
            onToggleLike={toggleLike}
            onOpen={setOpenId}
          />

          {liked.length === 0 ? (
            <section className="empty">
              <h2>Recommended for you</h2>
              <p>Tap the heart on any movie below. Your matches will show up here.</p>
            </section>
          ) : (
            <>
              <MovieRow
                title="Recommended for you"
                hint="Based on the genres, directors and themes of your liked movies."
                items={contentRecs.slice(1)}
                badgeFor={matchLabel}
                {...shared}
              />
              <MovieRow
                title="Viewers with your taste also liked"
                hint="Based on what people with similar picks rated highly."
                items={collabRecs}
                badgeFor={(s) => `${s.toFixed(1)} / 5 predicted`}
                {...shared}
              />
            </>
          )}

          {enabled && liked.length > 0 && (
            <TmdbRow title="More to explore" hint="Live suggestions from TMDB based on your picks." state={apiRecs} />
          )}
          {enabled && (
            <TmdbRow title="Trending this week" hint="What people are watching right now." state={trending} />
          )}

          <section className="row">
            <div className="row-head">
              <h2>All movies</h2>
            </div>

            <Filters
              query={query}
              onQuery={setQuery}
              genre={genre}
              onGenre={setGenre}
              sort={sort}
              onSort={setSort}
            />

            {library.length === 0 ? (
              <p className="hint">No movies match. Try a different search or genre.</p>
            ) : (
              <MovieRow items={library.map((movie) => ({ movie, score: null }))} {...shared} />
            )}
          </section>
        </main>

        <PicksPanel liked={liked} onRemove={toggleLike} onClear={clearLikes} />
      </div>

      <MovieDialog
        movie={openMovie}
        liked={openMovie ? liked.includes(openMovie.id) : false}
        onToggleLike={toggleLike}
        onSimilar={handleSimilar}
        onClose={() => setOpenId(null)}
      />
    </>
  );
}
