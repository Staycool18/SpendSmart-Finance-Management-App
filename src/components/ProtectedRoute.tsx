// src/components/ProtectedRoute.tsx
import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/Authcontext";

const ProtectedRoute = () => {
  const authContext = useAuth;
  const location = useLocation();

  // Handle case where context might be undefined
  if (!authContext) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const { isAuthenticated, hasBankConnection } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to connect-bank if trying to access protected routes without connection
  const protectedPaths = ["/dashboard", "/transactions"];
  if (protectedPaths.includes(location.pathname) && !hasBankConnection) {
    return <Navigate to="/connect-bank" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;