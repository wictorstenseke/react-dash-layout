import * as React from "react";

import { SpotifyIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConnectSpotify } from "@/features/spotify/useSpotifyAuth";

type SpotifyConnectDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  errorMessage?: string | null;
};

export const SpotifyConnectDialog = ({
  open,
  onOpenChange,
  errorMessage,
}: SpotifyConnectDialogProps) => {
  const connectSpotify = useConnectSpotify();

  const handleConnect = () => {
    const currentUrl = window.location.pathname + window.location.search;
    connectSpotify.mutate(currentUrl);
    // Dialog will close automatically when OAuth redirect happens
  };

  const isPending = connectSpotify.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <HugeiconsIcon
                icon={SpotifyIcon}
                strokeWidth={2}
                className="text-yellow-500"
              />
            </div>
            <DialogTitle>Connect Spotify</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            To use Trackboard's playback features, organize playlists, and
            search for tracks, you need to connect your Spotify account. This
            allows you to:
          </DialogDescription>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground pl-4">
            <li>Play tracks directly from your dashboard</li>
            <li>Import and manage your playlists</li>
            <li>Search and add tracks to your groups</li>
            <li>Control playback across your devices</li>
          </ul>
        </DialogHeader>

        {errorMessage && (
          <div
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive dark:bg-destructive/20 dark:border-destructive/50"
          >
            {errorMessage}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Maybe later
          </Button>
          <Button
            variant="outline"
            onClick={handleConnect}
            disabled={isPending}
            className="gap-2"
          >
            <HugeiconsIcon
              icon={SpotifyIcon}
              strokeWidth={2}
              className="text-yellow-500"
            />
            {isPending ? "Connecting…" : "Connect Spotify"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

