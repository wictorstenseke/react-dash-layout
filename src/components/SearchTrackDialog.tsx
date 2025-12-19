import { useState, type FormEvent } from "react";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TRACK_COLORS,
  type GroupColor,
  type TrackColor,
} from "@/features/groups/types";
import { useSpotifySearchTracksQuery } from "@/features/spotify/useSpotifyData";
import { useCreateTrackMutation, useTracksQuery } from "@/hooks/useTracks";
import { cn } from "@/lib/utils";

import type { SpotifyTrack } from "@/features/spotify/types";

/**
 * Groups and tracks now use the same colors, so no mapping needed
 */
const mapGroupColorToTrackColor = (groupColor: GroupColor): TrackColor => {
  return groupColor as TrackColor;
};

type SearchTrackDialogProps = {
  groupId: string;
  groupColor: GroupColor;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const SearchTrackDialog = ({
  groupId,
  groupColor,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: SearchTrackDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [searchQuery, setSearchQuery] = useState("");

  const { data: searchResults, isLoading: searching } =
    useSpotifySearchTracksQuery(searchQuery, 20, 0, searchQuery.length > 0);

  const { data: existingTracks } = useTracksQuery(groupId);
  const createTrack = useCreateTrackMutation(groupId);

  // Get default track color from group color
  const defaultTrackColor = mapGroupColorToTrackColor(groupColor);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleTrackSelect = async (track: SpotifyTrack) => {
    const order = existingTracks?.length ?? 0;

    await createTrack.mutateAsync({
      label: track.name,
      color: defaultTrackColor,
      order,
      spotifyTrackId: track.id,
      title: track.name,
      artists: track.artists.map((a) => a.name),
      albumImageUrl: track.album.images?.[0]?.url,
      durationMs: track.duration_ms,
      origin: {
        type: "manual",
      },
    });

    // Reset search and close
    setSearchQuery("");
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setSearchQuery("");
        }
      }}
    >
      {trigger && (
        <DialogTrigger
          render={trigger ?? <Button size="sm">Search Track</Button>}
        />
      )}
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg md:max-w-2xl w-full">
        <DialogHeader className="min-w-0">
          <DialogTitle className="truncate">Search Spotify</DialogTitle>
          <DialogDescription className="truncate">
            Search for a track to add to this group
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-query">Search</Label>
            <Input
              id="search-query"
              placeholder="Track name, artist, or album…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>
        </form>

        <ScrollArea className="h-[400px] pr-4 overflow-x-hidden">
          {searching ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Searching…</p>
            </div>
          ) : searchQuery ? (
            searchResults?.tracks.items.length ? (
              <div className="space-y-1 min-w-0">
                {searchResults.tracks.items.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => handleTrackSelect(track)}
                    disabled={createTrack.isPending}
                    className={cn(
                      "flex w-full items-center gap-2 sm:gap-3 rounded-lg p-2 text-left transition-colors min-w-0",
                      "hover:bg-accent hover:text-accent-foreground",
                      "disabled:opacity-50 disabled:cursor-not-allowed"
                    )}
                  >
                    {track.album.images[0]?.url && (
                      <img
                        src={track.album.images[0].url}
                        alt={track.name}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p className="font-medium truncate text-sm sm:text-base">
                        {track.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">
                        <span className="truncate inline-block max-w-full">
                          {track.artists.map((a) => a.name).join(", ")}
                        </span>
                        {" · "}
                        <span className="truncate inline-block max-w-full">
                          {track.album.name}
                        </span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8">
                <p className="text-muted-foreground">No tracks found</p>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">
                Enter a search query to find tracks
              </p>
            </div>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={createTrack.isPending}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
