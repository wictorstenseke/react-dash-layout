import { useEffect, useRef, type ReactNode } from "react";

import { useLocation, useNavigate } from "@tanstack/react-router";

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
  const navigate = useNavigate();
  const hasRedirectedRef = useRef(false);

  // Use effect to handle navigation to prevent loops
  useEffect(() => {
    if (!loading && !isAuthed && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      const currentHref = location.href;
      const searchParams =
        currentHref !== "/" ? { next: currentHref } : undefined;

      navigate({
        to: "/login",
        search: searchParams,
        replace: true, // Use replace to avoid adding to history
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed, loading]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!isAuthed) {
    // Return null while redirecting to prevent rendering children
    return null;
  }

  // Reset redirect flag when authenticated
  if (hasRedirectedRef.current && isAuthed) {
    hasRedirectedRef.current = false;
  }

  return <>{children}</>;
};
