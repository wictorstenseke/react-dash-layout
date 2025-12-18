import { createFileRoute } from "@tanstack/react-router";

import { Login } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  validateSearch: (
    search: Record<string, unknown>
  ): { next?: string; mode?: "login" | "signup" } => {
    return {
      next: typeof search.next === "string" ? search.next : undefined,
      mode:
        search.mode === "login" || search.mode === "signup"
          ? search.mode
          : undefined,
    };
  },
  component: Login,
});
