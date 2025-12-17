import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthProvider";
import type { UserDocument } from "@/features/auth/types";
import { db } from "@/lib/firebase";

import { spotifyService } from "./spotifyService";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setStatus(undefined);
      setLoading(false);
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

  return useQuery({
    queryKey: spotifyKeys.token(),
    queryFn: () => spotifyService.refreshToken(),
    enabled: !!user,
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
