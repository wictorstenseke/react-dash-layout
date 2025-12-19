import { useCallback, useEffect, useRef, useState } from "react";

import { doc, setDoc } from "firebase/firestore";

import { useAuth } from "@/features/auth/AuthProvider";
import { db } from "@/lib/firebase";

import { spotifyService } from "./spotifyService";
import { useSpotifyStatus, useSpotifyToken } from "./useSpotifyAuth";

import type { PlayerState } from "./types";

/**
 * Internal hook to manage Spotify Web Playback SDK
 * Use SpotifyPlayerProvider and useSpotifyPlayer from SpotifyPlayerProvider.tsx instead
 */
export const useSpotifyPlayerInternal = () => {
  const { user } = useAuth();
  const { isLinked, isPremium } = useSpotifyStatus();
  const { data: tokenData } = useSpotifyToken();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [player, setPlayer] = useState<any | null>(null); // Spotify.Player
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>("idle");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [currentTrack, setCurrentTrack] = useState<any | null>(null); // Spotify.WebPlaybackState
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any | null>(null); // Spotify.Player
  // Use ref to store token so getToken callback doesn't change when tokenData updates
  const tokenDataRef = useRef(tokenData);
  // Store target volume for fade in/out (default 0.5)
  const targetVolumeRef = useRef<number>(0.5);
  // Track active fade animation to prevent overlapping fades
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update ref when tokenData changes
  useEffect(() => {
    tokenDataRef.current = tokenData;
  }, [tokenData]);

  // Get valid access token - use ref to avoid recreating callback
  const getToken = useCallback((callback: (token: string) => void) => {
    if (tokenDataRef.current?.access_token) {
      callback(tokenDataRef.current.access_token);
    }
  }, []); // No dependencies - uses ref instead

  // Initialize player
  // Use access_token string as dependency instead of tokenData object to avoid re-runs when query object reference changes
  const accessToken = tokenData?.access_token;
  const initializedTokenRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only initialize if we have all requirements AND don't already have a player initialized with this token
    if (!isLinked || !isPremium || !accessToken) {
      return;
    }

    // If we already initialized with this exact token, don't re-initialize
    if (initializedTokenRef.current === accessToken && playerRef.current) {
      return;
    }

    // Mark that we're initializing with this token
    initializedTokenRef.current = accessToken;

    // Wait for SDK to load
    const initPlayer = () => {
      if (!window.Spotify) {
        console.error("Spotify SDK not loaded");
        setError("Spotify SDK not available");
        return;
      }

      const spotifyPlayer = new window.Spotify.Player({
        name: "Spotdash Player",
        getOAuthToken: getToken,
        volume: 0.5,
      });

      // Ready
      spotifyPlayer.addListener("ready", ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
        console.log("Setting playerState to 'ready'");
        setPlayerState((prev) => {
          console.log("[setPlayerState] prev:", prev, "-> ready");
          return "ready";
        });
        setError(null);

        // Save device ID to Firestore
        if (user?.uid) {
          const userDocRef = doc(db, "users", user.uid);
          setDoc(
            userDocRef,
            {
              settings: {
                preferredDeviceId: device_id,
                playbackMode: "sdk",
              },
            },
            { merge: true }
          ).catch((err) => {
            console.error("Failed to save device ID:", err);
          });
        }
      });

      // Not Ready
      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setPlayerState("idle");
      });

      // Player state changed
      spotifyPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;

        setCurrentTrack(state);
        setPlayerState(state.paused ? "paused" : "playing");
      });

      // Errors
      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error("Initialization error:", message);
        setError(message);
        setPlayerState("error");
      });

      spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error("Authentication error:", message);
        setError(message);
        setPlayerState("error");
      });

      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error("Account error:", message);
        setError(message);
        setPlayerState("error");
      });

      spotifyPlayer.addListener("playback_error", ({ message }) => {
        console.error("Playback error:", message);
        setError(message);
      });

      // Connect
      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log("Spotify Player connected");
        } else {
          console.error("Failed to connect Spotify Player");
          setError("Failed to connect player");
          setPlayerState("error");
        }
      });

      playerRef.current = spotifyPlayer;
      setPlayer(spotifyPlayer);
    };

    // Check if SDK is already loaded
    if (window.Spotify) {
      // SDK already loaded, initialize immediately
      initPlayer();
    } else {
      // SDK not loaded yet, set up callback
      // Replace any existing callback (including placeholder from index.html)
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }

    return () => {
      // Only clean up if we're actually changing to a different token
      // Check if the current token in the ref is different from what we initialized with
      const currentToken = tokenDataRef.current?.access_token;

      // If token hasn't changed, don't clean up - this prevents React StrictMode from breaking the player
      if (currentToken === initializedTokenRef.current) {
        // Token is the same - this is likely React StrictMode cleanup
        // Don't disconnect the player or reset state
        console.log(
          "[useSpotifyPlayer cleanup] Token unchanged, skipping cleanup"
        );
        return; // Early return - don't disconnect the player
      }

      // Token changed, need to clean up and reinitialize
      console.log(
        "[useSpotifyPlayer cleanup] Token changed, cleaning up player"
      );
      if (window.onSpotifyWebPlaybackSDKReady === initPlayer) {
        window.onSpotifyWebPlaybackSDKReady = undefined;
      }

      // Clear any active fade animation
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        setPlayer(null);
        setDeviceId(null);
        setPlayerState("idle");
      }
      initializedTokenRef.current = undefined;
    };
  }, [isLinked, isPremium, accessToken, user?.uid, getToken]); // Use accessToken string instead of tokenData object

  // Fade volume utility function
  const fadeVolume = useCallback(
    async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      playerInstance: any, // Spotify.Player type from SDK
      fromVolume: number,
      toVolume: number,
      durationMs: number = 1000
    ): Promise<void> => {
      // Clear any existing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
      }

      return new Promise((resolve) => {
        const startTime = Date.now();
        const volumeDiff = toVolume - fromVolume;

        const updateVolume = async () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / durationMs, 1);

          // Use easing function for smoother fade (ease-in-out)
          const easedProgress =
            progress < 0.5
              ? 2 * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 2) / 2;

          const currentVolume = fromVolume + volumeDiff * easedProgress;

          try {
            await playerInstance.setVolume(currentVolume);
          } catch (err) {
            console.error("Error setting volume during fade:", err);
          }

          if (progress >= 1) {
            if (fadeIntervalRef.current) {
              clearInterval(fadeIntervalRef.current);
              fadeIntervalRef.current = null;
            }
            resolve();
          }
        };

        // Update volume every ~16ms (60fps)
        fadeIntervalRef.current = setInterval(updateVolume, 16);
        updateVolume(); // Initial call
      });
    },
    []
  );

  // Play track
  const play = useCallback(
    async (spotifyTrackId: string) => {
      if (!deviceId || !player) {
        setError("Player not ready");
        return;
      }

      try {
        // First, transfer playback to this device (required for Web Playback SDK)
        // This ensures the web player is the active device before playing
        try {
          await spotifyService.transferPlayback(deviceId);
          // Small delay to ensure transfer completes
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (transferErr) {
          // Transfer might fail if device is already active, that's okay
          // But log it for debugging
          const errorMessage =
            transferErr instanceof Error
              ? transferErr.message
              : String(transferErr);
          if (
            !errorMessage.includes("already") &&
            !errorMessage.includes("404")
          ) {
            console.warn("Transfer playback warning:", errorMessage);
          }
        }

        // Get current volume to use as target for fade in
        let targetVolume = targetVolumeRef.current;
        try {
          const currentVolume = await player.getVolume();
          if (currentVolume > 0) {
            targetVolume = currentVolume;
            targetVolumeRef.current = targetVolume;
          }
        } catch (err) {
          // If getVolume fails, use stored target volume
          console.warn("Could not get current volume, using stored:", err);
        }

        // Set volume to 0 before playing for fade in
        try {
          await player.setVolume(0);
        } catch (err) {
          console.warn("Could not set volume to 0:", err);
        }

        // Then play the track
        await spotifyService.playTrack(spotifyTrackId, deviceId);
        setPlayerState("playing");

        // Fade in from 0 to target volume over 1 second
        await fadeVolume(player, 0, targetVolume, 1000);
      } catch (err) {
        console.error("Play error:", err);
        setError(err instanceof Error ? err.message : "Failed to play track");
      }
    },
    [deviceId, player, fadeVolume]
  );

  // Pause
  const pause = useCallback(async () => {
    if (!player) return;

    try {
      // Get current volume before fading out
      let currentVolume = targetVolumeRef.current;
      try {
        const volume = await player.getVolume();
        if (volume > 0) {
          currentVolume = volume;
          targetVolumeRef.current = currentVolume; // Store for next fade in
        }
      } catch (err) {
        console.warn("Could not get current volume:", err);
      }

      // Fade out from current volume to 0 over 1 second
      await fadeVolume(player, currentVolume, 0, 1000);

      // Then pause
      await player.pause();
      setPlayerState("paused");
    } catch (err) {
      console.error("Pause error:", err);
      setError(err instanceof Error ? err.message : "Failed to pause");
    }
  }, [player, fadeVolume]);

  // Resume
  const resume = useCallback(async () => {
    if (!player) return;

    try {
      // Get target volume for fade in
      const targetVolume = targetVolumeRef.current;

      // Set volume to 0 before resuming for fade in
      try {
        await player.setVolume(0);
      } catch (err) {
        console.warn("Could not set volume to 0:", err);
      }

      // Resume playback
      await player.resume();
      setPlayerState("playing");

      // Fade in from 0 to target volume over 1 second
      await fadeVolume(player, 0, targetVolume, 1000);
    } catch (err) {
      console.error("Resume error:", err);
      setError(err instanceof Error ? err.message : "Failed to resume");
    }
  }, [player, fadeVolume]);

  // Toggle play/pause
  const togglePlay = useCallback(async () => {
    if (!player) return;

    try {
      await player.togglePlay();
    } catch (err) {
      console.error("Toggle play error:", err);
      setError(err instanceof Error ? err.message : "Failed to toggle play");
    }
  }, [player]);

  // Seek to position
  const seek = useCallback(
    async (positionMs: number) => {
      if (!player) return;

      try {
        await player.seek(positionMs);
      } catch (err) {
        console.error("Seek error:", err);
        setError(err instanceof Error ? err.message : "Failed to seek");
      }
    },
    [player]
  );

  // Debug logging - only log state changes, not every render
  const prevStateRef = useRef({ playerState, deviceId });
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      import.meta.env.DEV &&
      (prevStateRef.current.playerState !== playerState ||
        prevStateRef.current.deviceId !== deviceId)
    ) {
      console.log("useSpotifyPlayer state changed:", {
        playerState,
        deviceId,
        hasPlayer: !!player,
        hasToken: !!tokenData,
        isReady:
          playerState === "ready" ||
          playerState === "playing" ||
          playerState === "paused",
      });
      prevStateRef.current = { playerState, deviceId };
    }
  }, [playerState, deviceId, player, tokenData]);

  return {
    player,
    deviceId,
    playerState,
    currentTrack,
    error,
    isReady:
      playerState === "ready" ||
      playerState === "playing" ||
      playerState === "paused",
    isPlaying: playerState === "playing",
    isPaused: playerState === "paused",
    canPlay: !!deviceId && !!tokenData,
    play,
    pause,
    resume,
    togglePlay,
    seek,
  };
};
