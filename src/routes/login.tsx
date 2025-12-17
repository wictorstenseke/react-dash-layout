import { createFileRoute, redirect } from "@tanstack/react-router";

import { Login } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    return {
      next: typeof search.next === "string" ? search.next : undefined,
    };
  },
  beforeLoad: ({ context }) => {
    // If user is already authenticated, redirect to app
    // Note: This requires context to be set up with auth state
    // For now, we handle this in the component itself
  },
  component: Login,
});
