import { createFileRoute } from "@tanstack/react-router";

import { RequireAuth } from "@/features/auth/RequireAuth";
import { App } from "@/pages/App";

export const Route = createFileRoute("/app")({
  component: () => (
    <RequireAuth>
      <App />
    </RequireAuth>
  ),
});
