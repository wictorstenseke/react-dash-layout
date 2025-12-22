import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { type GroupColor, type TrackColor } from "@/features/groups/types";
import { useSpotifyPlaylistTracksQuery } from "@/features/spotify/useSpotifyData";
import { useCreateTrackMutation, useTracksQuery } from "@/hooks/useTracks";

import type { SpotifyPlaylist } from "@/features/spotify/types";

/**
 * Groups and tracks now use the same colors, so no mapping needed
 */
const mapGroupColorToTrackColor = (groupColor: GroupColor): TrackColor => {
  return groupColor as TrackColor;
};

type PlaylistPreviewDialogProps = {
  playlist: SpotifyPlaylist;
  groupId: string;
  groupColor: GroupColor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
};

export const PlaylistPreviewDialog = ({
  playlist,
  groupId,
  groupColor,
  open,
  onOpenChange,
  onBack,
}: PlaylistPreviewDialogProps) => {
  const [importing, setImporting] = useState(false);

  const { data: tracksData, isLoading: loadingTracks } =
    useSpotifyPlaylistTracksQuery(playlist.id, 100, 0);

  const { data: existingTracks } = useTracksQuery(groupId);
  const createTrack = useCreateTrackMutation(groupId);

  // Get default track color from group color
  const defaultTrackColor = mapGroupColorToTrackColor(groupColor);

  const handleImport = async () => {
    if (!tracksData) return;

    setImporting(true);

    // Use setTimeout to ensure React renders the importing state before starting async work
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      const baseOrder = existingTracks?.length ?? 0;

      // Import tracks sequentially to maintain order
      for (let i = 0; i < tracksData.items.length; i++) {
        const item = tracksData.items[i];
        const track = item.track;

        await createTrack.mutateAsync({
          label: track.name,
          color: defaultTrackColor,
          order: baseOrder + i,
          spotifyTrackId: track.id,
          title: track.name,
          artists: track.artists.map((a) => a.name),
          albumImageUrl: track.album.images?.[0]?.url ?? null,
          durationMs: track.duration_ms,
          origin: {
            type: "playlist",
            playlistId: playlist.id,
          },
        });
      }

      // Close dialog on success
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to import playlist:", error);
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-2xl w-full">
        <DialogHeader className="min-w-0">
          <DialogTitle className="truncate">
            {importing ? "Importing Tracks" : playlist.name}
          </DialogTitle>
          <DialogDescription className="truncate">
            {importing
              ? "Please wait while we import your tracks…"
              : playlist.description || `${tracksData?.items.length ?? 0} tracks in this playlist`}
          </DialogDescription>
        </DialogHeader>

        {importing ? (
          <div className="flex w-full flex-col gap-4 [--radius:1rem] min-h-[400px] items-center justify-center py-12">
            <Item variant="muted">
              <ItemMedia>
                <Spinner />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">
                  Importing playlist
                </ItemTitle>
              </ItemContent>
              <ItemContent className="flex-none justify-end">
                <span className="text-sm tabular-nums">
                  {tracksData?.items.length ?? 0} tracks
                </span>
              </ItemContent>
            </Item>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-4 mb-4">
          {playlist.images?.[0]?.url && (
            <img
              src={playlist.images[0].url}
              alt={playlist.name}
              className="h-24 w-24 sm:h-32 sm:w-32 rounded object-cover shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-muted-foreground mb-2">
              {playlist.tracks.total} tracks · by{" "}
              <span className="truncate inline-block max-w-full">
                {playlist.owner.display_name}
              </span>
            </p>
            {playlist.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {playlist.description}
              </p>
            )}
          </div>
        </div>

        <ScrollArea className="h-[400px] pr-4 overflow-x-hidden">
          {loadingTracks ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Loading tracks…</p>
            </div>
          ) : (
            <div className="space-y-1 min-w-0">
              {tracksData?.items.slice(0, 15).map((item, index) => (
                <div
                  key={item.track.id}
                  className="flex items-center gap-2 sm:gap-3 rounded p-2 text-sm min-w-0"
                >
                  <span className="text-muted-foreground w-6 sm:w-8 text-right shrink-0 text-xs sm:text-sm">
                    {index + 1}
                  </span>
                  {item.track.album.images?.[0]?.url && (
                    <img
                      src={item.track.album.images[0].url}
                      alt={item.track.name}
                      className="h-8 w-8 sm:h-10 sm:w-10 rounded object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0 overflow-hidden">
                    <p className="font-medium truncate text-xs sm:text-sm">
                      {item.track.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                </div>
              ))}
              {tracksData && tracksData.items.length > 15 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... and {tracksData.items.length - 15} more tracks
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {!importing && (
          <DialogFooter>
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={importing}
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={importing || !tracksData}
              className="truncate min-w-0"
            >
              <span className="truncate">
                {importing
                  ? "Importing…"
                  : `Import ${tracksData?.items.length ?? 0} Tracks`}
              </span>
            </Button>
          </DialogFooter>
        )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

