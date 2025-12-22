import { useEffect, useState, type FormEvent } from "react";

import { PlayIcon, Playlist01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { PlaylistPreviewDialog } from "@/components/PlaylistPreviewDialog";
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
import {
  Item,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Spinner } from "@/components/ui/spinner";
import { type GroupColor, type TrackColor } from "@/features/groups/types";
import { useSpotifySearchTracksQuery } from "@/features/spotify/useSpotifyData";
import { useCreateTrackMutation, useTracksQuery } from "@/hooks/useTracks";
import { cn } from "@/lib/utils";

import type { SpotifyPlaylist, SpotifyTrack } from "@/features/spotify/types";

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

type SearchFilter = "all" | "track" | "playlist";

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
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyPlaylist | null>(null);

  // Debounce search query - wait 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Regular search query - use debounced query for API calls
  const searchType = filter === "all" ? "all" : filter;
  const { data: searchResults, isLoading: searching } =
    useSpotifySearchTracksQuery(
      debouncedSearchQuery,
      20,
      0,
      debouncedSearchQuery.length > 0,
      searchType as "track" | "playlist" | "all"
    );

  const { data: existingTracks } = useTracksQuery(groupId);
  const createTrack = useCreateTrackMutation(groupId);

  // Get default track color from group color
  const defaultTrackColor = mapGroupColorToTrackColor(groupColor);

  const isLoading = searching;

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
      albumImageUrl: track.album.images?.[0]?.url ?? null,
      durationMs: track.duration_ms,
      origin: {
        type: "manual",
      },
    });

    // Reset search and close
    setSearchQuery("");
    setOpen(false);
  };

  const handlePlaylistSelect = (playlist: SpotifyPlaylist) => {
    setSelectedPlaylist(playlist);
  };

  const handlePlaylistPreviewBack = () => {
    setSelectedPlaylist(null);
  };

  const handlePlaylistPreviewClose = (closed: boolean) => {
    if (!closed) {
      setSelectedPlaylist(null);
      setSearchQuery("");
      setOpen(false);
    } else {
      setSelectedPlaylist(null);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setSearchQuery("");
          setDebouncedSearchQuery("");
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
            {createTrack.isPending ? "Adding Track" : "Search Spotify"}
          </DialogTitle>
          <DialogDescription className="truncate">
            {createTrack.isPending
              ? "Please wait while we add the track…"
              : "Search for tracks or playlists to add to this group"}
          </DialogDescription>
        </DialogHeader>

        {createTrack.isPending ? (
          <div className="flex w-full flex-col gap-4 [--radius:1rem] min-h-[400px] items-center justify-center py-12">
            <Item variant="muted">
              <ItemMedia>
                <Spinner />
              </ItemMedia>
              <ItemContent>
                <ItemTitle className="line-clamp-1">Adding track</ItemTitle>
              </ItemContent>
              <ItemContent className="flex-none justify-end">
                <span className="text-sm tabular-nums">1 track</span>
              </ItemContent>
            </Item>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-3">
            <SegmentedControl
              options={[
                { value: "all", label: "All" },
                { value: "track", label: "Tracks" },
                { value: "playlist", label: "Playlists" },
              ]}
              value={filter}
              onValueChange={(value) => setFilter(value as SearchFilter)}
            />
            <div className="space-y-2">
              <Label htmlFor="search-query">Search</Label>
              <Input
                id="search-query"
                placeholder="Track name, artist, album, or playlist…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        </form>

        <ScrollArea className="h-[400px] pr-4 overflow-x-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">Searching…</p>
            </div>
          ) : debouncedSearchQuery ? (
            // Regular search results
            <>
                {filter === "all" || filter === "track" ? (
                  searchResults?.tracks?.items.length ? (
                    <div className="space-y-1 min-w-0">
                      {filter === "all" && (
                        <div className="text-xs font-medium text-muted-foreground px-2 py-1">
                          Tracks
                        </div>
                      )}
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
                          <HugeiconsIcon
                            icon={PlayIcon}
                            strokeWidth={2}
                            className="h-5 w-5 shrink-0 text-muted-foreground"
                          />
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
                  ) : filter === "track" ? (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-muted-foreground">No tracks found</p>
                    </div>
                  ) : null
                ) : null}
                {filter === "all" || filter === "playlist" ? (
                  searchResults?.playlists?.items &&
                  searchResults.playlists.items.length > 0 ? (
                    <div className="space-y-1 min-w-0">
                      {filter === "all" && (
                        <div className="text-xs font-medium text-muted-foreground px-2 py-1 mt-2">
                          Playlists
                        </div>
                      )}
                      {searchResults.playlists.items
                        .filter((playlist): playlist is SpotifyPlaylist => playlist !== null)
                        .map((playlist) => (
                        <button
                          key={playlist.id}
                          onClick={() => handlePlaylistSelect(playlist)}
                          className={cn(
                            "flex w-full items-center gap-2 sm:gap-3 rounded-lg p-2 text-left transition-colors min-w-0",
                            "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          <HugeiconsIcon
                            icon={Playlist01Icon}
                            strokeWidth={2}
                            className="h-5 w-5 shrink-0 text-muted-foreground"
                          />
                          {playlist.images?.[0]?.url && (
                            <img
                              src={playlist.images[0].url}
                              alt={playlist.name}
                              className="h-10 w-10 sm:h-12 sm:w-12 rounded object-cover shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="font-medium truncate text-sm sm:text-base">
                              {playlist.name}
                            </p>
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
                  ) : filter === "playlist" ? (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-muted-foreground">
                        No playlists found
                      </p>
                    </div>
                  ) : null
                ) : null}
                {filter === "all" &&
                  (!searchResults?.tracks?.items?.length &&
                    !searchResults?.playlists?.items?.length) && (
                    <div className="flex items-center justify-center p-8">
                      <p className="text-muted-foreground">No results found</p>
                    </div>
                  )}
            </>
          ) : (
            <div className="flex items-center justify-center p-8">
              <p className="text-muted-foreground">
                Enter a search query to find tracks or playlists
              </p>
            </div>
          )}
        </ScrollArea>

        {!createTrack.isPending && (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSearchQuery("");
                setSelectedPlaylist(null);
              }}
              disabled={createTrack.isPending}
            >
              Cancel
            </Button>
          </DialogFooter>
        )}
          </div>
        )}
      </DialogContent>

      {selectedPlaylist && (
        <PlaylistPreviewDialog
          playlist={selectedPlaylist}
          groupId={groupId}
          groupColor={groupColor}
          open={!!selectedPlaylist}
          onOpenChange={handlePlaylistPreviewClose}
          onBack={handlePlaylistPreviewBack}
        />
      )}
    </Dialog>
  );
};
