import { useState, type FormEvent } from "react";

import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordReset } from "@/features/auth/authService";

export const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    const result = await sendPasswordReset(email);

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
    } else if (result.error) {
      setError(result.error.message);
    }
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border bg-card p-12 shadow-sm">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Reset Password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email to receive a password reset link
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="rounded-md border border-green-500/50 bg-green-500/10 px-3 py-3 text-sm text-green-700 dark:text-green-400">
                Password reset email sent! Check your inbox for further
                instructions.
              </div>
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium underline-offset-4 hover:underline"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
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

                {error && (
                  <div
                    role="alert"
                    className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:bg-destructive/20 dark:border-destructive/50"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Please wait…" : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center text-sm">
                <Link
                  to="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
