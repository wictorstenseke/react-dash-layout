import * as React from "react";

import { ArrowDown01Icon, SpotifyIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useConnectSpotify,
  useSpotifyStatus,
} from "@/features/spotify/useSpotifyAuth";

type SpotifyConnectButtonProps = {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
};

export const SpotifyConnectButton = ({
  variant = "default",
  size = "default",
}: SpotifyConnectButtonProps) => {
  const { isLinked, displayName, loading } = useSpotifyStatus();
  const connectSpotify = useConnectSpotify();

  const handleConnect = () => {
    const currentUrl = window.location.pathname + window.location.search;
    connectSpotify.mutate(currentUrl);
  };

  const isPending = connectSpotify.isPending || loading;
  const isConnected = isLinked && !loading;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const primaryLabel = (() => {
    if (loading) return "Checking…";
    if (connectSpotify.isPending) return "Connecting…";
    if (isConnected) {
      if (displayName) return `Connected as ${displayName}`;
      return "Spotify Connected";
    }
    return "Connect Spotify";
  })();

  const handleLabelClick = () => {
    // Programmatically click the trigger button to ensure consistent positioning
    triggerRef.current?.click();
  };

  if (!isConnected) {
    return (
      <Button
        type="button"
        variant={variant}
        size={size}
        className="gap-1 pl-2 pr-2.5"
        onClick={handleConnect}
        disabled={isPending}
        aria-label="Connect Spotify"
      >
        <HugeiconsIcon icon={SpotifyIcon} strokeWidth={2} />
        <span className="hidden sm:inline">{primaryLabel}</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <ButtonGroup aria-label="Spotify connection actions">
        <Button
          type="button"
          variant={variant}
          size={size}
          className="gap-1 pl-2 pr-2.5"
          onClick={handleLabelClick}
          aria-label="Spotify connected"
        >
          <HugeiconsIcon icon={SpotifyIcon} strokeWidth={2} />
          <span className="hidden sm:inline">{primaryLabel}</span>
          <span className="sm:hidden">Connected</span>
        </Button>

        <DropdownMenuTrigger
          render={
            <Button
              ref={triggerRef}
              type="button"
              variant={variant}
              size="icon-sm"
              aria-label="Open Spotify connection menu"
            >
              <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
            </Button>
          }
        />
      </ButtonGroup>

      <DropdownMenuContent
        align="end"
        sideOffset={6}
        className="w-auto min-w-max"
      >
        <DropdownMenuItem onClick={handleConnect} disabled={isPending}>
          Reconnect Spotify
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>View account (coming soon)</DropdownMenuItem>
        <DropdownMenuItem disabled>Check Premium status</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
