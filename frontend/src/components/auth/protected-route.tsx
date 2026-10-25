import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isAuthenticated, getDefaultDashboardRoute } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    // Redirect unauthenticated users to login, keeping requested path
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // User is logged in but does not have permission for this role dashboard
    // Redirect them to their own authorized dashboard
    return <Navigate to={getDefaultDashboardRoute(user.role)} replace />;
  }

  return <>{children}</>;
};
