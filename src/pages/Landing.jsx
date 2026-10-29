import { Link } from "react-router-dom";
import { movies, allGenres } from "../data/movies";
import { useAuth } from "../context/AuthContext";
import Poster from "../components/Poster";
import { StarIcon } from "../components/Icons";

const byId = (id) => movies.find((m) => m.id === id);
const fan = [byId(11), byId(4), byId(10)]; // left, center, right
const popular = [...movies].sort((a, b) => b.rating - a.rating).slice(0, 4);

export default function Landing() {
  const { currentUser } = useAuth();

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <h1>Find the next movie you will actually finish.</h1>
          <p>
            Tell Reelpick a few movies you loved. It matches them by genre, director and theme, and checks what
            viewers with similar taste rated highly.
          </p>
          <div className="hero-actions">
            {currentUser ? (
              <Link to="/discover" className="btn btn-on btn-lg">
                Go to your picks
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-on btn-lg">
                  Create free account
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  Log in
                </Link>
              </>
            )}
          </div>
          <p className="hero-note">
            {movies.length} movies across {allGenres.length} genres, each with a poster and a short description.
          </p>
        </div>

        <div className="fan" aria-hidden="true">
          <div className="fan-item fan-left">
            <Poster movie={fan[0]} />
          </div>
          <div className="fan-item fan-right">
            <Poster movie={fan[2]} />
          </div>
          <div className="fan-item fan-center">
            <Poster movie={fan[1]} />
          </div>
        </div>
      </section>

      <section className="showcase">
        <h2>Popular right now</h2>
        <div className="showcase-grid">
          {popular.map((m) => (
            <article key={m.id} className="showcase-card">
              <Poster movie={m} />
              <h3>{m.title}</h3>
              <p className="meta">
                {m.year}, {m.genres.slice(0, 2).join(", ")}
              </p>
              <p className="rating">
                <StarIcon /> {m.rating.toFixed(1)}
              </p>
              <p className="showcase-desc">{m.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="steps">
        <h2>How it works</h2>
        <ol>
          <li>
            <h3>Like what you enjoyed</h3>
            <p>Browse the library and tap the heart on any movie. Search by title or director, or filter by genre.</p>
          </li>
          <li>
            <h3>Get matched picks</h3>
            <p>Reelpick builds your taste profile and ranks every other movie by how closely it matches.</p>
          </li>
          <li>
            <h3>See what similar viewers liked</h3>
            <p>A second list shows predicted ratings based on people whose picks overlap with yours.</p>
          </li>
        </ol>
      </section>

      {!currentUser && (
        <section className="cta-band">
          <h2>Ready for tonight's pick?</h2>
          <Link to="/signup" className="btn btn-on btn-lg">
            Create free account
          </Link>
        </section>
      )}
    </>
  );
}
