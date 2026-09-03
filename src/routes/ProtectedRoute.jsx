import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Spinner from "../components/ui/Spinner.jsx";

/** Blocks unauthenticated users, redirecting to /login and remembering
 *  where they were headed so we can send them back after signing in. */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner label="Checking your session…" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

/** Restricts a route subtree to one or more roles. Renders the child routes'
 *  Outlet only if the current user's role is allowed; otherwise redirects to
 *  that user's own dashboard so people can never navigate into another
 *  role's pages by editing the URL. */
export function RoleRoute({ allow }) {
  const { role } = useAuth();

  if (!allow.includes(role)) {
    return <Navigate to={homePathForRole(role)} replace />;
  }

  return <Outlet />;
}

export function homePathForRole(role) {
  switch (role) {
    case "Patient":
      return "/patient";
    case "Nurse":
      return "/nurse";
    case "Proxy":
      return "/proxy";
    case "Admin":
      return "/admin";
    default:
      return "/login";
  }
}
