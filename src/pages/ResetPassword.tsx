import { useState, type FormEvent } from "react";

import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
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
    <div className="fixed inset-0 bg-muted flex flex-col items-center justify-center p-6 md:p-10 overflow-hidden">
      <div className="w-full max-w-sm md:max-w-4xl max-h-full overflow-y-auto">
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="p-6 md:pt-[120px] md:pb-[120px] md:px-10">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">Reset Password</h1>
                  <p className="text-muted-foreground text-balance">
                    Enter your email to receive a password reset link
                  </p>
                </div>

                {success ? (
                  <>
                    <Field>
                      <div className="rounded-md border border-green-500/50 bg-green-500/10 px-3 py-3 text-sm text-green-700 dark:text-green-400">
                        Password reset email sent! Check your inbox for further
                        instructions.
                      </div>
                    </Field>
                    <FieldDescription className="text-center">
                      <Link
                        to="/login"
                        className="font-medium underline-offset-2 hover:underline"
                      >
                        Back to sign in
                      </Link>
                    </FieldDescription>
                  </>
                ) : (
                  <>
                    <form onSubmit={handleSubmit}>
                      <FieldGroup>
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
                            {isSubmitting ? "Please wait…" : "Send Reset Link"}
                          </Button>
                        </Field>

                        <FieldDescription className="text-center">
                          <Link
                            to="/login"
                            className="font-medium underline-offset-2 hover:underline"
                          >
                            Back to sign in
                          </Link>
                        </FieldDescription>
                      </FieldGroup>
                    </form>
                  </>
                )}
              </FieldGroup>
            </div>

            <div className="bg-muted relative hidden md:block">
              <img
                src={`${import.meta.env.BASE_URL}login-image.jpg`}
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
