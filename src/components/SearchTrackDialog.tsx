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
};

export const SearchTrackDialog = ({
  groupId,
  trigger,
}: SearchTrackDialogProps) => {
  const [open, setOpen] = useState(false);
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
      albumImageUrl: selectedTrack.album.images[0]?.url,
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
      <DialogTrigger
        render={trigger ?? <Button size="sm">Search Track</Button>}
      />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {selectedTrack ? "Add Track" : "Search Spotify"}
          </DialogTitle>
          <DialogDescription>
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

            <ScrollArea className="h-[400px] pr-4">
              {searching ? (
                <div className="flex items-center justify-center p-8">
                  <p className="text-muted-foreground">Searching…</p>
                </div>
              ) : searchQuery ? (
                searchResults?.tracks.items.length ? (
                  <div className="space-y-1">
                    {searchResults.tracks.items.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => handleTrackSelect(track)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors",
                          "hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {track.album.images[0]?.url && (
                          <img
                            src={track.album.images[0].url}
                            alt={track.name}
                            className="h-12 w-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.name}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {track.artists.map((a) => a.name).join(", ")} ·{" "}
                            {track.album.name}
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
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              {selectedTrack.album.images[0]?.url && (
                <img
                  src={selectedTrack.album.images[0].url}
                  alt={selectedTrack.name}
                  className="h-16 w-16 rounded object-cover"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium">{selectedTrack.name}</p>
                <p className="text-sm text-muted-foreground">
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

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {TRACK_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
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
