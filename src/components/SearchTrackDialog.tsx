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
import { TRACK_COLORS, type TrackColor } from "@/features/groups/types";
import { useSpotifySearchTracksQuery } from "@/features/spotify/useSpotifyData";
import { useCreateTrackMutation, useTracksQuery } from "@/hooks/useTracks";
import { cn } from "@/lib/utils";

import type { SpotifyTrack } from "@/features/spotify/types";

const colorClasses: Record<TrackColor, { bg: string; ring: string }> = {
  blue: { bg: "bg-blue-500", ring: "ring-blue-500" },
  green: { bg: "bg-green-500", ring: "ring-green-500" },
  yellow: { bg: "bg-yellow-500", ring: "ring-yellow-500" },
  red: { bg: "bg-red-500", ring: "ring-red-500" },
  purple: { bg: "bg-purple-500", ring: "ring-purple-500" },
  pink: { bg: "bg-pink-500", ring: "ring-pink-500" },
  indigo: { bg: "bg-indigo-500", ring: "ring-indigo-500" },
  orange: { bg: "bg-orange-500", ring: "ring-orange-500" },
  teal: { bg: "bg-teal-500", ring: "ring-teal-500" },
  cyan: { bg: "bg-cyan-500", ring: "ring-cyan-500" },
};

type SearchTrackDialogProps = {
  groupId: string;
  trigger?: React.ReactElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const SearchTrackDialog = ({
  groupId,
  trigger,
  open: controlledOpen,
  onOpenChange,
}: SearchTrackDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [color, setColor] = useState<TrackColor>("blue");
  const [customLabel, setCustomLabel] = useState("");

  const { data: searchResults, isLoading: searching } =
    useSpotifySearchTracksQuery(searchQuery, 20, 0, searchQuery.length > 0);

  const { data: existingTracks } = useTracksQuery(groupId);
  const createTrack = useCreateTrackMutation(groupId);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
  };

  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setCustomLabel(track.name);
  };

  const handleAdd = async () => {
    if (!selectedTrack) return;

    const order = existingTracks?.length ?? 0;

    await createTrack.mutateAsync({
      label: customLabel.trim() || selectedTrack.name,
      color,
      order,
      spotifyTrackId: selectedTrack.id,
      title: selectedTrack.name,
      artists: selectedTrack.artists.map((a) => a.name),
      albumImageUrl: selectedTrack.album.images?.[0]?.url,
      durationMs: selectedTrack.duration_ms,
      origin: {
        type: "manual",
      },
    });

    // Reset and close
    setSearchQuery("");
    setSelectedTrack(null);
    setCustomLabel("");
    setColor("blue");
    setOpen(false);
  };

  const handleBack = () => {
    setSelectedTrack(null);
    setCustomLabel("");
    setColor("blue");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setSearchQuery("");
          setSelectedTrack(null);
          setCustomLabel("");
          setColor("blue");
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
          <DialogTitle className="truncate">
            {selectedTrack ? "Add Track" : "Search Spotify"}
          </DialogTitle>
          <DialogDescription className="truncate">
            {selectedTrack
              ? "Customize the track label and color"
              : "Search for a track to add to this group"}
          </DialogDescription>
        </DialogHeader>

        {!selectedTrack ? (
          <>
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
                        className={cn(
                          "flex w-full items-center gap-2 sm:gap-3 rounded-lg p-2 text-left transition-colors min-w-0",
                          "hover:bg-accent hover:text-accent-foreground"
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
          </>
        ) : (
          <div className="space-y-4 min-w-0">
            <div className="flex items-center gap-2 sm:gap-3 rounded-lg border p-2 sm:p-3 min-w-0">
              {selectedTrack.album.images[0]?.url && (
                <img
                  src={selectedTrack.album.images[0].url}
                  alt={selectedTrack.name}
                  className="h-12 w-12 sm:h-16 sm:w-16 rounded object-cover shrink-0"
                />
              )}
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="font-medium truncate text-sm sm:text-base">
                  {selectedTrack.name}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {selectedTrack.artists.map((a) => a.name).join(", ")}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="track-label">Track Label</Label>
              <Input
                id="track-label"
                placeholder="Custom label (optional)"
                value={customLabel}
                onChange={(e) => setCustomLabel(e.target.value)}
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TRACK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all shrink-0",
                      colorClasses[c].bg,
                      color === c
                        ? `ring-2 ${colorClasses[c].ring} ring-offset-2 ring-offset-background`
                        : "hover:scale-110"
                    )}
                    aria-label={`Select ${c} color`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {selectedTrack ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={createTrack.isPending}
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleAdd}
                disabled={createTrack.isPending}
              >
                {createTrack.isPending ? "Adding…" : "Add Track"}
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
