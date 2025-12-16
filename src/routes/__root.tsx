import { createRootRoute, Outlet } from "@tanstack/react-router";

import { AppShell } from "@/components/layout/AppShell";
import { DevAuthProbe } from "@/components/DevAuthProbe";

export const Route = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
      {import.meta.env.DEV && <DevAuthProbe />}
    </AppShell>
  ),
});

