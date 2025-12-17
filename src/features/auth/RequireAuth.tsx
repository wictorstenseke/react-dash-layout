import type { ReactNode } from "react";

import { Navigate, useLocation } from "@tanstack/react-router";

import { useAuth } from "./AuthProvider";

type RequireAuthProps = {
  children: ReactNode;
};

/**
 * Protects routes that require authentication.
 * - Shows loading placeholder while auth state is being determined
 * - Redirects to /login with ?next= param if not authenticated
 * - Renders children if authenticated
 */
export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthed, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!isAuthed) {
    // Store the intended destination in the ?next= query param
    const currentPath = location.pathname + location.search;
    const nextParam =
      currentPath !== "/" ? `?next=${encodeURIComponent(currentPath)}` : "";

    return <Navigate to={`/login${nextParam}`} />;
  }

  return <>{children}</>;
};
