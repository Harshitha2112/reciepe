import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";

/**
 * Wraps a route and redirects to /login if the user is not authenticated.
 * Optionally restricts to specific roles via the `roles` prop.
 */
const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
