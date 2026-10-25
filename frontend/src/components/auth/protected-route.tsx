import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import type { UserRole } from "@/types/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRole }) => {
  const { user, isAuthenticated, isLoading, getDefaultDashboardRoute } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-near-black flex items-center justify-center font-mono text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-electric-lime border-t-transparent animate-spin" />
          <p className="text-xs uppercase tracking-wider text-muted-gray">Verifying credentials...</p>
        </div>
      </div>
    );
  }

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
