import * as React from "react";

import {
  ArrowDown01Icon,
  ArrowReloadHorizontalIcon,
  SpotifyIcon,
  Unlink04Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  useConnectSpotify,
  useDisconnectSpotify,
  useSpotifyStatus,
} from "@/features/spotify/useSpotifyAuth";
import { cn } from "@/lib/utils";

type SpotifyConnectButtonProps = {
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
};

export const SpotifyConnectButton = ({
  size = "default",
}: SpotifyConnectButtonProps) => {
  const { isLinked, displayName, loading } = useSpotifyStatus();
  const connectSpotify = useConnectSpotify();
  const disconnectSpotify = useDisconnectSpotify();

  const handleConnect = () => {
    const currentUrl = window.location.pathname + window.location.search;
    connectSpotify.mutate(currentUrl);
  };

  const handleDisconnectClick = () => {
    setDialogOpen(true);
    setMenuOpen(false);
  };

  const handleDisconnectConfirm = () => {
    disconnectSpotify.mutate();
    setDialogOpen(false);
    setConfirmed(false);
  };

  const isPending = connectSpotify.isPending || loading;
  const isDisconnecting = disconnectSpotify.isPending;
  const isConnected = isLinked && !loading;
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const [menuWidth, setMenuWidth] = React.useState<number | undefined>(
    undefined
  );
  const buttonGroupRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (menuOpen && buttonGroupRef.current) {
      setMenuWidth(buttonGroupRef.current.offsetWidth);
    }
  }, [menuOpen]);

  const primaryLabel = (() => {
    if (loading) return "Checking…";
    if (connectSpotify.isPending) return "Connecting…";
    if (isConnected) {
      if (displayName) return `Connected as ${displayName}`;
      return "Spotify Connected";
    }
    return "Connect Spotify";
  })();

  if (!isConnected) {
    return (
      <Button
        type="button"
        variant="outline"
        size={size}
        className={cn("gap-1 pl-2 pr-2.5 border border-yellow-500/50!")}
        onClick={handleConnect}
        disabled={isPending}
        aria-label="Connect Spotify"
      >
        <HugeiconsIcon
          icon={SpotifyIcon}
          strokeWidth={2}
          className="text-yellow-500"
        />
        <span className="hidden sm:inline">{primaryLabel}</span>
        <span className="sm:hidden">Connect</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
      <DropdownMenuTrigger
        nativeButton={false}
        render={
          <div ref={buttonGroupRef} className="inline-flex">
            <ButtonGroup aria-label="Spotify connection actions">
              <Button
                type="button"
                variant="outline"
                size={size}
                className={cn("gap-1 pl-2 pr-2.5 border border-green-500/50!")}
                aria-label="Spotify connected"
              >
                <HugeiconsIcon
                  icon={SpotifyIcon}
                  strokeWidth={2}
                  className="text-green-500"
                />
                <span className="hidden sm:inline">{primaryLabel}</span>
                <span className="sm:hidden">Connected</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className={cn("border border-green-500/50!")}
                aria-label="Open Spotify connection menu"
              >
                <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} />
              </Button>
            </ButtonGroup>
          </div>
        }
      />

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        style={menuWidth ? { width: `${menuWidth}px` } : undefined}
      >
        <DropdownMenuItem onClick={handleConnect} disabled={isPending}>
          <HugeiconsIcon icon={ArrowReloadHorizontalIcon} strokeWidth={2} />
          Reconnect Spotify
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDisconnectClick}
          disabled={isDisconnecting}
          variant="destructive"
        >
          <HugeiconsIcon icon={Unlink04Icon} strokeWidth={2} />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            setConfirmed(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Disconnect Spotify Account
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect your Spotify account? This
              will remove all access to your Spotify data and you'll need to
              reconnect to use Spotify features again.
            </DialogDescription>
          </DialogHeader>
          <Label
            htmlFor="confirm-disconnect"
            className="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 has-aria-checked:border-destructive has-aria-checked:bg-destructive/10 dark:has-aria-checked:border-destructive dark:has-aria-checked:bg-destructive/20 cursor-pointer"
          >
            <Checkbox
              id="confirm-disconnect"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(checked === true)}
              className="data-[state=checked]:border-destructive data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground dark:data-[state=checked]:border-destructive dark:data-[state=checked]:bg-destructive"
            />
            <div className="grid gap-1.5 font-normal">
              <p className="text-sm leading-none font-medium">
                I understand the action of disconnect
              </p>
              <p className="text-muted-foreground text-sm">
                This will permanently remove your Spotify connection and you'll
                need to reconnect to use Spotify features again.
              </p>
            </div>
          </Label>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setConfirmed(false);
              }}
              disabled={isDisconnecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisconnectConfirm}
              disabled={!confirmed || isDisconnecting}
            >
              {isDisconnecting ? "Disconnecting…" : "Disconnect"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DropdownMenu>
  );
};
