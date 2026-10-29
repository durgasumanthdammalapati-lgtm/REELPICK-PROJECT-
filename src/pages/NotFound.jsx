import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="auth">
      <div className="auth-card">
        <h1>Page not found</h1>
        <p className="auth-sub">The page you are looking for does not exist or has moved.</p>
        <Link to="/" className="btn btn-on">
          Back to home
        </Link>
      </div>
    </section>
  );
}

