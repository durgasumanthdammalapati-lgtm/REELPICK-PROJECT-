import { tmdbEnabled } from "../api/tmdb";

export default function Footer() {
  return (
    <footer className="footer">
      <p>
        Reelpick is a demo project. Accounts and picks are saved in this browser only, not on a server.
      </p>
      {tmdbEnabled && (
        <p>This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
      )}
    </footer>
  );
}
