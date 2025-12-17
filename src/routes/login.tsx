import { createFileRoute } from "@tanstack/react-router";

import { Login } from "@/pages/Login";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next?: string } => {
    return {
      next: typeof search.next === "string" ? search.next : undefined,
    };
  },
  component: Login,
});
