import {
  Add01Icon,
  SquareLock01Icon,
  SquareUnlock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { ProfileMenu } from "@/components/ProfileMenu";
import { SpotifyConnectButton } from "@/components/SpotifyConnectButton";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type DashboardMode = "edit" | "match";

type AppHeaderProps = {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
  onCreateGroup: () => void;
  className?: string;
};

export const AppHeader = ({
  mode,
  onModeChange,
  onCreateGroup,
  className,
}: AppHeaderProps) => {
  const handleLogoClick = () => {
    window.open("/", "_blank");
  };

  return (
    <header
      className={cn(
        "sticky top-0 left-0 right-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 py-4",
        className
      )}
    >
      <div className="flex w-full items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center">
          <button
            onClick={handleLogoClick}
            className="flex items-center justify-center rounded-md p-1.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Open landing page in new tab"
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
          </button>
        </div>

        {/* Center: Button Group */}
        <div className="flex items-center justify-center">
          <ButtonGroup orientation="horizontal">
            <Button
              variant="outline"
              size="sm"
              onClick={onCreateGroup}
              disabled={mode === "match"}
            >
              <HugeiconsIcon icon={Add01Icon} />
              <span>Create Group</span>
            </Button>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onModeChange(mode === "edit" ? "match" : "edit")
                    }
                    aria-label={
                      mode === "edit" ? "Lock edits" : "Unlock edits"
                    }
                    className={cn(
                      mode === "match" &&
                        "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700 dark:bg-blue-500 dark:border-blue-500 dark:hover:bg-blue-600 dark:hover:border-blue-600"
                    )}
                  >
                    <HugeiconsIcon
                      icon={
                        mode === "edit" ? SquareUnlock01Icon : SquareLock01Icon
                      }
                      className="mr-1.5"
                    />
                    <span>
                      {mode === "edit" ? "Lock edits" : "Unlock edits"}
                    </span>
                  </Button>
                }
              />
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <span>
                    {mode === "edit"
                      ? "Disable edits when playing to prevent unwanted edits"
                      : "Enable your edit actions"}
                  </span>
                  <KbdGroup>
                    <Kbd>⌘</Kbd>
                    <Kbd>L</Kbd>
                  </KbdGroup>
                </div>
              </TooltipContent>
            </Tooltip>
          </ButtonGroup>
        </div>

        {/* Right: Spotify Connect and Profile */}
        <div className="flex items-center gap-2">
          <SpotifyConnectButton size="sm" />
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};
