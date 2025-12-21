import {
  NextIcon,
  PauseIcon,
  PlayIcon,
  PreviousIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { usePlayback } from "@/features/playback/PlaybackProvider";
import { useSpotifyPlayer } from "@/features/spotify/SpotifyPlayerProvider";

export const Player = () => {
  const { isReady, canSkipNext, canSkipPrev } = useSpotifyPlayer();
  const { togglePlayPause, isPlaying, nextTrack, previousTrack } =
    usePlayback();

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => previousTrack()}
        disabled={!isReady || !canSkipPrev}
        aria-label="Previous track"
      >
        <HugeiconsIcon icon={PreviousIcon} />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={togglePlayPause}
        disabled={!isReady}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        <HugeiconsIcon
          icon={isPlaying ? PauseIcon : PlayIcon}
          className="mr-1.5"
        />
        <span>{isPlaying ? "Pause" : "Play"}</span>
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => nextTrack()}
        disabled={!isReady || !canSkipNext}
        aria-label="Next track"
      >
        <HugeiconsIcon icon={NextIcon} />
      </Button>
    </div>
  );
};

