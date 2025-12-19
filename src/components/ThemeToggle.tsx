import { useEffect, useState } from "react";

import { Moon02Icon, Sun03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const getInitialIsDark = (): boolean => {
  if (typeof window === "undefined") {
    return true; // Default to dark
  }

  const stored = window.localStorage.getItem("theme");

  if (stored === "dark") return true;
  if (stored === "light") return false;

  return true; // Default to dark instead of system preference
};

export function ThemeToggle() {
  const [isDark, setIsDark] = useState<boolean>(() => getInitialIsDark());

  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isDark) {
      document.documentElement.classList.add("dark");
      window.localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      window.localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isModifierPressed = event.metaKey || event.ctrlKey;
      if (!isModifierPressed) return;

      if (event.key.toLowerCase() === "j") {
        event.preventDefault();
        setIsDark((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <HugeiconsIcon icon={isDark ? Sun03Icon : Moon02Icon} />
          </Button>
        }
      />
      <TooltipContent side="bottom">
        <div className="flex items-center gap-2">
          <span>Switch theme</span>
          <KbdGroup aria-hidden="true">
            <Kbd>⌘</Kbd>
            <Kbd>J</Kbd>
          </KbdGroup>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
