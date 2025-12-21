import { useState, useEffect, type FormEvent } from "react";

import { Link, useNavigate, useSearch } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
    <div className="fixed inset-0 bg-muted flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
      <div className="w-full max-w-sm md:max-w-4xl max-h-full overflow-y-auto">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <form onSubmit={handleSubmit} className="p-6 md:pt-[120px] md:pb-[120px] md:px-10">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">
                    {mode === "login" ? "Welcome back" : "Create an account"}
                  </h1>
                  <p className="text-muted-foreground text-balance">
                    {mode === "login"
                      ? "Login to your Trackboard account"
                      : "Enter your details to get started"}
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    {mode === "login" && (
                      <Link
                        to="/reset-password"
                        className="ml-auto text-sm underline-offset-2 hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    )}
                  </div>
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
                </Field>

                {error && (
                  <div
                    role="alert"
                    className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:bg-destructive/20 dark:border-destructive/50"
                  >
                    {error}
                  </div>
                )}

                <Field>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Please wait…"
                      : mode === "login"
                        ? "Sign In"
                        : "Create Account"}
                  </Button>
                </Field>

                <FieldDescription className="text-center">
                  {mode === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={toggleMode}
                    className="p-0 h-auto font-medium underline-offset-2"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </Button>
                </FieldDescription>
              </FieldGroup>
            </form>

            <div className="bg-muted relative hidden md:block">
              <img
                src="/login-image.jpg"
                alt="Audio mixer and music production setup"
                className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
