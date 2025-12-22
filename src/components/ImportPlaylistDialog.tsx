import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  useSpotifyPlaylistsQuery,
  useSpotifyPlaylistTracksQuery,
} from "@/features/spotify/useSpotifyData";
import { useCreateTrackMutation, useTracksQuery } from "@/hooks/useTracks";
import { cn } from "@/lib/utils";

import type { SpotifyPlaylist } from "@/features/spotify/types";

/**
 * Groups and tracks now use the same colors, so no mapping needed
 */
const mapGroupColorToTrackColor = (groupColor: GroupColor): TrackColor => {
  return groupColor as TrackColor;
};

type ImportPlaylistDialogProps = {
  groupId: string;
  groupColor: GroupColor;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ImportPlaylistDialog = ({
  groupId,
  groupColor,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: ImportPlaylistDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyPlaylist | null>(null);
  const [importing, setImporting] = useState(false);

  const { data: playlistsData, isLoading: loadingPlaylists } =
    useSpotifyPlaylistsQuery();
  const { data: tracksData, isLoading: loadingTracks } =
    useSpotifyPlaylistTracksQuery(selectedPlaylist?.id ?? "", 100, 0);

  const { data: existingTracks } = useTracksQuery(groupId);
  const createTrack = useCreateTrackMutation(groupId);

  // Get default track color from group color
  const defaultTrackColor = mapGroupColorToTrackColor(groupColor);

  const handleImport = async () => {
    if (!tracksData || !selectedPlaylist) return;

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
            playlistId: selectedPlaylist.id,
          },
        });
      }

      // Close dialog on success
      setOpen(false);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error("Failed to import playlist:", error);
    } finally {
      setImporting(false);
    }
  };

  const handlePlaylistSelect = (playlist: SpotifyPlaylist) => {
    setSelectedPlaylist(playlist);
  };

  const handleBack = () => {
    setSelectedPlaylist(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setSelectedPlaylist(null);
        }
      }}
    >
      {trigger && (
        <DialogTrigger
          render={trigger ?? <Button size="sm">Import from Playlist</Button>}
        />
      )}
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-2xl w-full">
        <DialogHeader className="min-w-0">
          <DialogTitle className="truncate">
            {importing
              ? "Importing Tracks"
              : selectedPlaylist
                ? selectedPlaylist.name
                : "Import from Playlist"}
          </DialogTitle>
          <DialogDescription className="truncate">
            {importing
              ? "Please wait while we import your tracks…"
              : selectedPlaylist
                ? `${tracksData?.items.length ?? 0} tracks in this playlist`
                : "Select a playlist to import tracks"}
          </DialogDescription>
        </DialogHeader>

        {importing ? (
          <div className="flex w-full flex-col gap-4 [--radius:1rem]">
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
        ) : !selectedPlaylist ? (
          <ScrollArea className="h-[400px] pr-4 overflow-x-hidden">
            {loadingPlaylists ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading playlists…</p>
              </div>
            ) : (
              <div className="space-y-2 min-w-0">
                {playlistsData?.items
                  .filter((playlist): playlist is SpotifyPlaylist => playlist !== null)
                  .map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => handlePlaylistSelect(playlist)}
                    className={cn(
                      "flex w-full items-center gap-3 sm:gap-4 rounded-lg border p-2 sm:p-3 text-left transition-colors min-w-0",
                      "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {playlist.images?.[0]?.url && (
                      <img
                        src={playlist.images[0].url}
                        alt={playlist.name}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="font-medium truncate">{playlist.name}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        {playlist.tracks.total} tracks · by{" "}
                        <span className="truncate inline-block max-w-full">
                          {playlist.owner.display_name}
                        </span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        ) : (
          <ScrollArea className="h-[400px] pr-4 overflow-x-hidden">
            {loadingTracks ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading tracks…</p>
              </div>
            ) : (
              <div className="space-y-1 min-w-0">
                {tracksData?.items.map((item, index) => (
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
              </div>
            )}
          </ScrollArea>
        )}

        {!importing && (
          <DialogFooter>
            {selectedPlaylist ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={importing}
                >
                  Back
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
              </>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
