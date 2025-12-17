import { useAuth } from "@/features/auth/AuthProvider";

/**
 * Protected app page - placeholder for the main authenticated experience.
 * This route is wrapped with RequireAuth.
 */
export const App = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email}` : ""}!
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground">
        <h2 className="mb-4 font-semibold">Your Workspace</h2>
        <p className="text-sm text-muted-foreground">
          This is a placeholder for the authenticated dashboard experience.
          Build out your features here.
        </p>
      </div>
    </div>
  );
};
