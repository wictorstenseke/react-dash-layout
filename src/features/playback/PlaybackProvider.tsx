import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { useSpotifyPlayer } from "@/features/spotify/SpotifyPlayerProvider";

type PlaybackContextValue = {
  selectedTrackId: string | null;
  currentTrackId: string | null;
  isPlaying: boolean;
  selectTrack: (trackId: string) => void;
  playTrack: (trackId: string, startTimeMs?: number) => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

type PlaybackProviderProps = {
  children: ReactNode;
};

export const PlaybackProvider = ({ children }: PlaybackProviderProps) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const {
    play,
    pause: spotifyPause,
    resume,
    seek,
    currentTrack,
    isPlaying,
    isPaused,
  } = useSpotifyPlayer();

  // Extract current track ID from Spotify player state
  const currentTrackId = currentTrack?.track_window?.current_track?.id ?? null;

  const selectTrack = useCallback((trackId: string) => {
    setSelectedTrackId(trackId);
  }, []);

  const playTrack = useCallback(
    async (trackId: string, startTimeMs?: number) => {
      setSelectedTrackId(trackId);
      await play(trackId);

      // If startTimeMs is provided, seek to that position after a short delay
      // to ensure playback has started
      if (startTimeMs !== undefined && startTimeMs > 0) {
        // Wait a bit for playback to start, then seek
        setTimeout(async () => {
          try {
            await seek(startTimeMs);
          } catch (err) {
            console.warn("Failed to seek to start time:", err);
          }
        }, 500);
      }
    },
    [play, seek]
  );

  const pause = useCallback(async () => {
    await spotifyPause();
  }, [spotifyPause]);

  const togglePlayPause = useCallback(async () => {
    // If no track is selected, do nothing
    if (!selectedTrackId) {
      return;
    }

    // If currently playing
    if (isPlaying) {
      // Check if the playing track matches selected track
      if (currentTrackId === selectedTrackId) {
        // Pause current track
        await spotifyPause();
      } else {
        // Play selected track (switch tracks)
        await play(selectedTrackId);
      }
    } else if (isPaused && currentTrackId === selectedTrackId) {
      // Resume paused track if it matches selection
      await resume();
    } else {
      // Start playing selected track
      await play(selectedTrackId);
    }
  }, [
    selectedTrackId,
    currentTrackId,
    isPlaying,
    isPaused,
    play,
    spotifyPause,
    resume,
  ]);

  const value: PlaybackContextValue = {
    selectedTrackId,
    currentTrackId,
    isPlaying,
    selectTrack,
    playTrack,
    pause,
    togglePlayPause,
  };

  return (
    <PlaybackContext.Provider value={value}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlayback = () => {
  const context = useContext(PlaybackContext);
  if (!context) {
    throw new Error("usePlayback must be used within PlaybackProvider");
  }
  return context;
};
