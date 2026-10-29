import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LogoMark, MoonIcon, SunIcon } from "./Icons";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const linkClass = ({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand">
          <LogoMark />
          Reelpick
        </Link>

        <nav aria-label="Main">
          {currentUser ? (
            <>
              <NavLink to="/discover" className={linkClass}>
                Discover
              </NavLink>
              <NavLink to="/profile" className={linkClass}>
                {currentUser.name.split(" ")[0]}
              </NavLink>
            </>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Log in
            </NavLink>
          )}

          <button
            type="button"
            className="icon-btn"
            onClick={toggle}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>

          {currentUser ? (
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <Link to="/signup" className="btn btn-on">
              Create account
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
