import { useEffect, useState } from "react";

import {
  Add01Icon,
  ArrowReloadHorizontalIcon,
  GithubIcon,
  LoginSquare01Icon,
  Logout01Icon,
  Moon02Icon,
  Sun03Icon,
  UserAdd02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { useNavigate } from "@tanstack/react-router";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useAuth } from "@/features/auth/AuthProvider";
import { signOutUser } from "@/features/auth/authService";

type CommandPaletteProps = {
  onCreateGroup?: () => void;
  onResetLayout?: () => void;
  onToggleTheme?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  landingMode?: boolean;
};

const getInitialIsDark = (): boolean => {
  if (typeof window === "undefined") {
    return true; // Default to dark
  }

  const stored = window.localStorage.getItem("theme");

  if (stored === "dark") return true;
  if (stored === "light") return false;

  return true; // Default to dark instead of system preference
};

export const CommandPalette = ({
  onCreateGroup,
  onResetLayout,
  onToggleTheme,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  landingMode = false,
}: CommandPaletteProps) => {
  const [internalOpen, setInternalOpen] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;
  const setOpen = controlledOnOpenChange ?? setInternalOpen;
  const [isDark, setIsDark] = useState<boolean>(() => getInitialIsDark());
  const { user } = useAuth();
  const navigate = useNavigate();

  // Sync theme state with DOM
  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    // Check on mount
    updateTheme();

    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Open command palette with cmd+k or ctrl+k
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  // Handle cmd+n shortcut to create group
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onCreateGroup?.();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onCreateGroup]);

  // Handle cmd+j shortcut to toggle theme
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onToggleTheme?.();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onToggleTheme]);

  const handleSignOut = async () => {
    setOpen(false);
    const result = await signOutUser();
    if (result.success) {
      navigate({ to: "/login" });
    }
  };

  const handleCreateGroup = () => {
    setOpen(false);
    onCreateGroup?.();
  };

  const handleResetLayout = () => {
    setOpen(false);
    onResetLayout?.();
  };

  const handleToggleTheme = () => {
    setOpen(false);
    onToggleTheme?.();
  };

  const handleSignIn = () => {
    setOpen(false);
    navigate({ to: "/login", search: { mode: "login" } });
  };

  const handleSignUp = () => {
    setOpen(false);
    navigate({ to: "/login", search: { mode: "signup" } });
  };

  const handleViewGitHub = () => {
    setOpen(false);
    window.open(
      "https://github.com/wictorstenseke/react-dash-layout",
      "_blank",
      "noopener,noreferrer"
    );
  };

  // Landing page mode - show only Sign In, Sign Up, View on GitHub
  if (landingMode) {
    return (
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem onSelect={handleSignIn}>
                <HugeiconsIcon
                  icon={LoginSquare01Icon}
                  strokeWidth={2}
                  className="mr-2"
                />
                <span>Sign In</span>
              </CommandItem>
              <CommandItem onSelect={handleSignUp}>
                <HugeiconsIcon
                  icon={UserAdd02Icon}
                  strokeWidth={2}
                  className="mr-2"
                />
                <span>Create account</span>
              </CommandItem>
              <CommandItem onSelect={handleViewGitHub}>
                <HugeiconsIcon
                  icon={GithubIcon}
                  strokeWidth={2}
                  className="mr-2"
                />
                <span>View on GitHub</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    );
  }

  // App mode - show full command palette
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Actions">
            <CommandItem onSelect={handleCreateGroup}>
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                className="mr-2"
              />
              <span>Create Group</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={handleResetLayout}>
              <HugeiconsIcon
                icon={ArrowReloadHorizontalIcon}
                strokeWidth={2}
                className="mr-2"
              />
              <span>Reset Layout</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Appearance">
            <CommandItem onSelect={handleToggleTheme}>
              <HugeiconsIcon
                icon={isDark ? Sun03Icon : Moon02Icon}
                strokeWidth={2}
                className="mr-2"
              />
              <span>Toggle Theme</span>
              <CommandShortcut>⌘J</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          {user && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Account">
                <CommandItem onSelect={handleSignOut}>
                  <HugeiconsIcon
                    icon={Logout01Icon}
                    strokeWidth={2}
                    className="mr-2"
                  />
                  <span>Sign Out</span>
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  );
};
