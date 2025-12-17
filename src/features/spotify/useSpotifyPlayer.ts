import { useEffect, useState, useCallback, useRef } from "react";
import { doc, setDoc } from "firebase/firestore";

import { useAuth } from "@/features/auth/AuthProvider";
import { db } from "@/lib/firebase";

import { useSpotifyToken, useSpotifyStatus } from "./useSpotifyAuth";
import type { PlayerState } from "./types";

/**
 * Hook to manage Spotify Web Playback SDK
 */
export const useSpotifyPlayer = () => {
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

  // Get valid access token
  const getToken = useCallback(
    (callback: (token: string) => void) => {
      if (tokenData?.access_token) {
        callback(tokenData.access_token);
      }
    },
    [tokenData]
  );

  // Initialize player
  useEffect(() => {
    if (!isLinked || !isPremium || !tokenData || playerRef.current) {
      return;
    }

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
        setPlayerState("ready");
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

    if (window.Spotify) {
      initPlayer();
    } else {
      window.onSpotifyWebPlaybackSDKReady = initPlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
        setPlayer(null);
        setDeviceId(null);
        setPlayerState("idle");
      }
    };
  }, [isLinked, isPremium, tokenData, getToken, user?.uid]);

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

  return {
    player,
    deviceId,
    playerState,
    currentTrack,
    error,
    isReady: playerState === "ready" || playerState === "playing" || playerState === "paused",
    isPlaying: playerState === "playing",
    isPaused: playerState === "paused",
    canPlay: !!deviceId && !!tokenData,
    play,
    pause,
    resume,
    togglePlay,
  };
};
