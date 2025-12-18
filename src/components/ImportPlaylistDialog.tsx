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
import { ScrollArea } from "@/components/ui/scroll-area";
import { type TrackColor } from "@/features/groups/types";
import {
  useSpotifyPlaylistsQuery,
  useSpotifyPlaylistTracksQuery,
} from "@/features/spotify/useSpotifyData";
import { useCreateTrackMutation, useTracksQuery } from "@/hooks/useTracks";
import { cn } from "@/lib/utils";

import type { SpotifyPlaylist } from "@/features/spotify/types";

type ImportPlaylistDialogProps = {
  groupId: string;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const ImportPlaylistDialog = ({
  groupId,
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

  const handleImport = async () => {
    if (!tracksData || !selectedPlaylist) return;

    setImporting(true);

    try {
      const baseOrder = existingTracks?.length ?? 0;
      const defaultColor: TrackColor = "blue";

      // Import tracks sequentially to maintain order
      for (let i = 0; i < tracksData.items.length; i++) {
        const item = tracksData.items[i];
        const track = item.track;

        await createTrack.mutateAsync({
          label: track.name,
          color: defaultColor,
          order: baseOrder + i,
          spotifyTrackId: track.id,
          title: track.name,
          artists: track.artists.map((a) => a.name),
          albumImageUrl: track.album.images?.[0]?.url,
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
            {selectedPlaylist ? selectedPlaylist.name : "Import from Playlist"}
          </DialogTitle>
          <DialogDescription className="truncate">
            {selectedPlaylist
              ? `${tracksData?.items.length ?? 0} tracks in this playlist`
              : "Select a playlist to import tracks"}
          </DialogDescription>
        </DialogHeader>

        {!selectedPlaylist ? (
          <ScrollArea className="h-[400px] pr-4 overflow-x-hidden">
            {loadingPlaylists ? (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">Loading playlists…</p>
              </div>
            ) : (
              <div className="space-y-2 min-w-0">
                {playlistsData?.items.map((playlist) => (
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
      </DialogContent>
    </Dialog>
  );
};
