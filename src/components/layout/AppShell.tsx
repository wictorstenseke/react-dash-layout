import type { ReactNode } from "react";

import { Link } from "@tanstack/react-router";

import { ProfileMenu } from "@/components/ProfileMenu";
import { SpotifyConnectButton } from "@/components/SpotifyConnectButton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { useCommandPalette } from "@/contexts/CommandPaletteContext";
import { useAuth } from "@/features/auth/AuthProvider";

interface AppShellProps {
  children: ReactNode;
}

const getModifierKey = (): string => {
  if (typeof navigator === "undefined") return "Ctrl";
  const platform = navigator.platform.toUpperCase();
  const userAgent = navigator.userAgent.toUpperCase();
  return platform.indexOf("MAC") >= 0 || userAgent.indexOf("MAC") >= 0
    ? "⌘"
    : "Ctrl";
};

export function AppShell({ children }: AppShellProps) {
  const { isAuthed, loading } = useAuth();
  const { setOpen } = useCommandPalette();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto grid h-14 max-w-screen-2xl grid-cols-3 items-center px-4 sm:px-6 lg:px-8">
          {/* Left: Logo + Nav */}
          <div className="flex">
            <Link
              to="/"
              className="mr-6 flex items-center justify-center rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7 text-foreground"
              >
                <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" />
                <path d="M10 15.5C10 16.3284 9.32843 17 8.5 17C7.67157 17 7 16.3284 7 15.5C7 14.6716 7.67157 14 8.5 14C9.32843 14 10 14.6716 10 15.5ZM10 15.5V11C10 10.1062 10 9.65932 10.2262 9.38299C10.4524 9.10667 10.9638 9.00361 11.9865 8.7975C13.8531 8.42135 15.3586 7.59867 16 7V13.5M16 13.75C16 14.4404 15.4404 15 14.75 15C14.0596 15 13.5 14.4404 13.5 13.75C13.5 13.0596 14.0596 12.5 14.75 12.5C15.4404 12.5 16 13.0596 16 13.75Z" />
              </svg>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                to="/"
                className="transition-colors hover:text-foreground/80"
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-foreground/60" }}
              >
                Home
              </Link>
              <Link
                to="/app"
                className="transition-colors hover:text-foreground/80"
                activeProps={{ className: "text-foreground" }}
                inactiveProps={{ className: "text-foreground/60" }}
              >
                Trackboard
              </Link>
            </nav>
          </div>
          {/* Center: SpotifyConnectButton */}
          <div className="flex items-center justify-center">
            {!loading && isAuthed && (
              <SpotifyConnectButton variant="outline" size="sm" />
            )}
          </div>
          {/* Right: CommandPalette Input, ProfileMenu, Sign in/up buttons, or ThemeToggle */}
          <div className="flex items-center justify-end gap-2">
            {!loading && isAuthed && (
              <div className="relative flex items-center">
                <Input
                  readOnly
                  placeholder="See actions..."
                  onClick={() => setOpen(true)}
                  className="h-8 w-48 cursor-pointer pr-20 hover:bg-muted/50 hover:border-border transition-colors"
                />
                <div className="absolute right-2 flex items-center">
                  <KbdGroup>
                    <Kbd>{getModifierKey()}</Kbd>
                    <Kbd>K</Kbd>
                  </KbdGroup>
                </div>
              </div>
            )}
            {!loading && !isAuthed && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link to="/login" search={{ mode: "login" }} />}
                  nativeButton={false}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  render={<Link to="/login" search={{ mode: "signup" }} />}
                  nativeButton={false}
                >
                  Sign up
                </Button>
              </>
            )}
            {!loading && isAuthed ? <ProfileMenu /> : <ThemeToggle />}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto max-w-screen-2xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
