import { useEffect, useState } from "react";

import { doc, onSnapshot } from "firebase/firestore";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";
import { db } from "@/lib/firebase";

import { spotifyService } from "./spotifyService";

import type { UserDocument } from "@/features/auth/types";

/**
 * Query keys for Spotify
 */
export const spotifyKeys = {
  all: ["spotify"] as const,
  auth: () => [...spotifyKeys.all, "auth"] as const,
  status: (uid: string) => [...spotifyKeys.auth(), "status", uid] as const,
  token: () => [...spotifyKeys.all, "token"] as const,
};

/**
 * Hook to get Spotify link status from Firestore
 */
export const useSpotifyStatus = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<UserDocument["spotify"]>(undefined);
  const [loading, setLoading] = useState(!user?.uid ? false : true);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snapshot) => {
        const data = snapshot.data() as UserDocument | undefined;
        setStatus(data?.spotify);
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to Spotify status:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return {
    status,
    loading,
    isLinked: status?.linked ?? false,
    isPremium: status?.premium ?? false,
    displayName: status?.displayName,
  };
};

/**
 * Hook to start Spotify OAuth flow
 */
export const useConnectSpotify = () => {
  return useMutation({
    mutationFn: async (redirectBackUrl?: string) => {
      await spotifyService.startOAuthFlow(redirectBackUrl);
    },
  });
};

/**
 * Hook to get/refresh Spotify access token
 */
export const useSpotifyToken = () => {
  const { user } = useAuth();
  const { isLinked } = useSpotifyStatus();

  return useQuery({
    queryKey: spotifyKeys.token(),
    queryFn: () => spotifyService.refreshToken(),
    enabled: !!user && isLinked, // Only fetch if user is logged in AND Spotify is linked
    staleTime: 50 * 60 * 1000, // 50 minutes (tokens last 60 min)
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook to manually refresh Spotify token
 */
export const useRefreshSpotifyToken = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => spotifyService.refreshToken(),
    onSuccess: (data) => {
      queryClient.setQueryData(spotifyKeys.token(), data);
    },
  });
};

/**
 * Hook to disconnect Spotify account
 */
export const useDisconnectSpotify = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => spotifyService.disconnect(),
    onSuccess: () => {
      // Invalidate all Spotify-related queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: spotifyKeys.all });
    },
  });
};
