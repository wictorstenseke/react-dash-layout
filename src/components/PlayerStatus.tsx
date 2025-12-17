import { useSpotifyPlayer } from "@/features/spotify/useSpotifyPlayer";
import { useSpotifyStatus } from "@/features/spotify/useSpotifyAuth";
import { cn } from "@/lib/utils";

type PlayerStatusProps = {
  className?: string;
};

export const PlayerStatus = ({ className }: PlayerStatusProps) => {
  const { isLinked, isPremium } = useSpotifyStatus();
  const { playerState, isReady, currentTrack, error } = useSpotifyPlayer();

  if (!isLinked) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-3 py-2 text-sm",
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-yellow-500" />
        <span className="text-yellow-700 dark:text-yellow-400">
          Spotify not connected
        </span>
      </div>
    );
  }

  if (!isPremium) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm",
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-red-700 dark:text-red-400">
          Spotify Premium required for playback
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm",
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-red-500" />
        <span className="text-red-700 dark:text-red-400">Error: {error}</span>
      </div>
    );
  }

  if (playerState === "idle") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-gray-500/50 bg-gray-500/10 px-3 py-2 text-sm",
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-gray-500 animate-pulse" />
        <span className="text-gray-700 dark:text-gray-400">
          Initializing player…
        </span>
      </div>
    );
  }

  if (isReady && !currentTrack) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-green-500/50 bg-green-500/10 px-3 py-2 text-sm",
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="text-green-700 dark:text-green-400">
          ✓ Player ready
        </span>
      </div>
    );
  }

  if (currentTrack) {
    const track = currentTrack.track_window.current_track;
    const isPaused = currentTrack.paused;

    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-blue-500/50 bg-blue-500/10 px-3 py-2",
          className
        )}
      >
        {track.album.images[0]?.url && (
          <img
            src={track.album.images[0].url}
            alt={track.name}
            className="h-10 w-10 rounded object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{track.name}</p>
          <p className="text-xs text-muted-foreground truncate">
            {track.artists.map((a: { name: string }) => a.name).join(", ")}
          </p>
        </div>
        <span className="text-xs text-blue-700 dark:text-blue-400">
          {isPaused ? "⏸ Paused" : "▶ Playing"}
        </span>
      </div>
    );
  }

  return null;
};
