import { useCallback, useEffect, useRef, useState } from "react";

import { doc, setDoc } from "firebase/firestore";

import { useAuth } from "@/features/auth/AuthProvider";
import { db } from "@/lib/firebase";

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

      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        setPlayer(null);
        setDeviceId(null);
        setPlayerState("idle");
      }
      initializedTokenRef.current = undefined;
    };
  }, [isLinked, isPremium, accessToken, user?.uid]); // Use accessToken string instead of tokenData object

  // Play track
  const play = useCallback(
    async (spotifyTrackId: string) => {
      if (!deviceId) {
        setError("Player not ready");
        return;
      }

      try {
        // Use proxy endpoint instead of direct API call
        const { spotifyService } = await import("./spotifyService");

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

        // Then play the track
        await spotifyService.playTrack(spotifyTrackId, deviceId);
        setPlayerState("playing");
      } catch (err) {
        console.error("Play error:", err);
        setError(err instanceof Error ? err.message : "Failed to play track");
      }
    },
    [deviceId]
  );

  // Pause
  const pause = useCallback(async () => {
    if (!player) return;

    try {
      await player.pause();
      setPlayerState("paused");
    } catch (err) {
      console.error("Pause error:", err);
      setError(err instanceof Error ? err.message : "Failed to pause");
    }
  }, [player]);

  // Resume
  const resume = useCallback(async () => {
    if (!player) return;

    try {
      await player.resume();
      setPlayerState("playing");
    } catch (err) {
      console.error("Resume error:", err);
      setError(err instanceof Error ? err.message : "Failed to resume");
    }
  }, [player]);

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
