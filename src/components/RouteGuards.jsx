import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/** Logged-out visitors are sent to /login and returned here after signing in. */
export function ProtectedRoute() {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** Login and signup pages are skipped when you are already signed in. */
export function PublicOnlyRoute() {
  const { currentUser } = useAuth();
  const location = useLocation();
  if (currentUser) {
    const destination = (location.state && location.state.from) || "/discover";
    return <Navigate to={destination} replace />;
  }
  return <Outlet />;
}
