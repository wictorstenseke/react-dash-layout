import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import { listTracks } from "@/features/groups/tracksRepo";
import { useSpotifyPlayer } from "@/features/spotify/SpotifyPlayerProvider";
import { spotifyService } from "@/features/spotify/spotifyService";

type PlaybackContextValue = {
  selectedTrackId: string | null;
  currentTrackId: string | null;
  isPlaying: boolean;
  selectTrack: (trackId: string) => void;
  playTrack: (
    trackId: string,
    startTimeMs?: number,
    groupId?: string,
    appTrackId?: string
  ) => Promise<void>;
  pause: () => Promise<void>;
  togglePlayPause: () => Promise<void>;
};

const PlaybackContext = createContext<PlaybackContextValue | null>(null);

type PlaybackProviderProps = {
  children: ReactNode;
};

export const PlaybackProvider = ({ children }: PlaybackProviderProps) => {
  const { user } = useAuth();
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const {
    play,
    pause: spotifyPause,
    resume,
    seek,
    currentTrack,
    isPlaying,
    isPaused,
    deviceId,
  } = useSpotifyPlayer();

  // Extract current track ID from Spotify player state
  const currentTrackId = currentTrack?.track_window?.current_track?.id ?? null;

  const selectTrack = useCallback((trackId: string) => {
    setSelectedTrackId(trackId);
  }, []);

  const playTrack = useCallback(
    async (
      trackId: string,
      startTimeMs?: number,
      groupId?: string,
      appTrackId?: string
    ) => {
      setSelectedTrackId(trackId);

      // Check if we're switching to a different group (before updating state)
      const isSwitchingGroup = groupId && groupId !== currentGroupId;

      // Update current group ID
      setCurrentGroupId(groupId ?? null);

      // If playing from a group, handle queue management
      if (groupId && appTrackId && user?.uid) {
        try {
          // Fetch tracks for the group
          const groupTracks = await listTracks(user.uid, groupId);

          // Find current track index
          const currentIndex = groupTracks.findIndex(
            (track) => track.id === appTrackId
          );

          if (currentIndex !== -1) {
            // Get all tracks from current position onwards
            const tracksToPlay = groupTracks.slice(currentIndex);

            // If switching groups, use play with URIs to replace the queue
            // Otherwise, add remaining tracks to queue
            if (isSwitchingGroup) {
              // Build array of track URIs starting from current track
              const trackUris = tracksToPlay
                .map((track) => track.spotifyTrackId)
                .filter((id): id is string => !!id)
                .map((id) => `spotify:track:${id}`);

              if (trackUris.length > 0) {
                // Play first track and queue the rest by using play with URIs
                // This replaces the entire queue
                await spotifyService.playTracks(
                  trackUris,
                  deviceId ?? undefined
                );
              } else {
                // Fallback to single track play if no valid tracks
                await play(trackId);
              }
            } else {
              // Same group - just add remaining tracks to queue
              const remainingTracks = tracksToPlay.slice(1);

              // Play the current track first
              await play(trackId);

              // Then add remaining tracks to queue
              for (const track of remainingTracks) {
                if (track.spotifyTrackId) {
                  try {
                    await spotifyService.addToQueue(
                      track.spotifyTrackId,
                      deviceId ?? undefined
                    );
                    // Small delay between queue additions to avoid rate limiting
                    await new Promise((resolve) => setTimeout(resolve, 100));
                  } catch (err) {
                    console.warn(
                      `Failed to add track ${track.id} to queue:`,
                      err
                    );
                  }
                }
              }
            }

            // Handle startTimeMs for the first track (if provided)
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
          } else {
            // Track not found in group, just play it
            await play(trackId);
            // Handle startTimeMs
            if (startTimeMs !== undefined && startTimeMs > 0) {
              setTimeout(async () => {
                try {
                  await seek(startTimeMs);
                } catch (err) {
                  console.warn("Failed to seek to start time:", err);
                }
              }, 500);
            }
          }
        } catch (err) {
          console.warn("Failed to fetch group tracks for queue:", err);
          // Fallback to single track play
          await play(trackId);
          // Handle startTimeMs
          if (startTimeMs !== undefined && startTimeMs > 0) {
            setTimeout(async () => {
              try {
                await seek(startTimeMs);
              } catch (err) {
                console.warn("Failed to seek to start time:", err);
              }
            }, 500);
          }
        }
      } else {
        // Not playing from a group, just play the track
        await play(trackId);
        // Handle startTimeMs
        if (startTimeMs !== undefined && startTimeMs > 0) {
          setTimeout(async () => {
            try {
              await seek(startTimeMs);
            } catch (err) {
              console.warn("Failed to seek to start time:", err);
            }
          }, 500);
        }
      }
    },
    [play, seek, deviceId, user?.uid, currentGroupId]
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
