import { useState, useEffect, type FormEvent } from "react";

import { Link, useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/features/auth/AuthProvider";
import {
  signInEmailPassword,
  signUpEmailPassword,
} from "@/features/auth/authService";

type AuthMode = "login" | "signup";

export const Login = () => {
  const navigate = useNavigate();
  const { isAuthed, loading, setError: setAuthError } = useAuth();
  const search = useSearch({ from: "/login" });
  const nextPath =
    (search as { next?: string; mode?: "login" | "signup" }).next || "/app";
  const searchMode = (search as { next?: string; mode?: "login" | "signup" })
    .mode;

  const [mode, setMode] = useState<AuthMode>(
    searchMode === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect authenticated users away from login page
  useEffect(() => {
    if (!loading && isAuthed) {
      navigate({ to: nextPath });
    }
  }, [isAuthed, loading, navigate, nextPath]);

  // Show loading while checking auth state or if already authenticated (redirect pending)
  if (loading || isAuthed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const authFn = mode === "login" ? signInEmailPassword : signUpEmailPassword;
    const result = await authFn(email, password);

    setIsSubmitting(false);

    if (result.success) {
      setAuthError(null);
      navigate({ to: nextPath });
    } else if (result.error) {
      setError(result.error.message);
      setAuthError(result.error);
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setError(null);
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border bg-card p-12 shadow-sm">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {mode === "login" ? "Sign In" : "Create Account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "login"
                ? "Enter your credentials to continue"
                : "Enter your details to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                minLength={6}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:bg-destructive/20 dark:border-destructive/50"
              >
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting
                ? "Please wait…"
                : mode === "login"
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>

          <div className="space-y-2 text-center text-sm">
            {mode === "login" && (
              <div>
                <Link
                  to="/reset-password"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">
                {mode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
              </span>
              <Button
                type="button"
                variant="link"
                onClick={toggleMode}
                className="p-0 h-auto font-medium"
              >
                {mode === "login" ? "Sign up" : "Sign in"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
