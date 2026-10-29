import { useNavigate } from "react-router-dom";
import { movies } from "../data/movies";
import { useAuth } from "../context/AuthContext";
import { useLikes } from "../hooks/useLikes";
import Thumb from "../components/Thumb";

export default function Profile() {
  const { currentUser, logout, deleteAccount } = useAuth();
  const { liked, toggleLike, clearLikes } = useLikes(currentUser.id);
  const navigate = useNavigate();

  const likedMovies = liked.map((id) => movies.find((m) => m.id === id)).filter(Boolean);
  const memberSince = new Date(currentUser.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleDelete = () => {
    const ok = window.confirm("Delete your account and all your picks? This cannot be undone.");
    if (ok) {
      deleteAccount();
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="profile">
      <header className="masthead">
        <h1>{currentUser.name}</h1>
        <p>
          {currentUser.email}. Member since {memberSince}.
        </p>
      </header>

      <section className="row">
        <div className="row-head">
          <h2>Movies you liked ({likedMovies.length})</h2>
          {likedMovies.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={clearLikes}>
              Clear all
            </button>
          )}
        </div>

        {likedMovies.length === 0 ? (
          <p className="hint">You have not liked any movies yet. Head to Discover to start.</p>
        ) : (
          <ul className="liked-list">
            {likedMovies.map((m) => (
              <li key={m.id}>
                <Thumb movie={m} />
                <div className="liked-text">
                  <strong>{m.title}</strong>
                  <span className="meta">
                    {m.year}, {m.genres.join(", ")}
                  </span>
                </div>
                <button type="button" className="remove" aria-label={`Remove ${m.title}`} onClick={() => toggleLike(m.id)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="row">
        <h2>Account</h2>
        <div className="account-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
          >
            Log out
          </button>
          <button type="button" className="btn btn-danger" onClick={handleDelete}>
            Delete account
          </button>
        </div>
      </section>
    </div>
  );
}
