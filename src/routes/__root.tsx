import { createRootRoute, Outlet } from "@tanstack/react-router";

import { DevAuthProbe } from "@/components/DevAuthProbe";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createRootRoute({
  component: () => (
    <AppShell>
      <Outlet />
      {import.meta.env.DEV && <DevAuthProbe />}
    </AppShell>
  ),
});
