import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";

import { spotifyService } from "./spotifyService";

import type { SpotifySearchResponse } from "./types";

/**
 * Query keys for Spotify data
 */
export const spotifyDataKeys = {
  all: ["spotify-data"] as const,
  playlists: () => [...spotifyDataKeys.all, "playlists"] as const,
  playlistsList: (limit: number, offset: number) =>
    [...spotifyDataKeys.playlists(), limit, offset] as const,
  playlistTracks: (playlistId: string) =>
    [...spotifyDataKeys.all, "playlist-tracks", playlistId] as const,
  playlistTracksList: (playlistId: string, limit: number, offset: number) =>
    [...spotifyDataKeys.playlistTracks(playlistId), limit, offset] as const,
  search: () => [...spotifyDataKeys.all, "search"] as const,
  searchQuery: (
    query: string,
    limit: number,
    offset: number,
    type: "track" | "playlist" | "all" | null
  ) => [...spotifyDataKeys.search(), query, limit, offset, type] as const,
  bestMatch: (query: string) =>
    [...spotifyDataKeys.search(), "best-match", query] as const,
};

/**
 * Hook to fetch user's playlists
 */
export const useSpotifyPlaylistsQuery = (limit = 50, offset = 0) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: spotifyDataKeys.playlistsList(limit, offset),
    queryFn: () => spotifyService.getPlaylists(limit, offset),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch tracks from a playlist
 */
export const useSpotifyPlaylistTracksQuery = (
  playlistId: string,
  limit = 100,
  offset = 0
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: spotifyDataKeys.playlistTracksList(playlistId, limit, offset),
    queryFn: () => spotifyService.getPlaylistTracks(playlistId, limit, offset),
    enabled: !!user && !!playlistId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to search for tracks and/or playlists
 */
export const useSpotifySearchTracksQuery = (
  query: string,
  limit = 20,
  offset = 0,
  enabled = true,
  type: "track" | "playlist" | "all" | null = "all"
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: spotifyDataKeys.searchQuery(query, limit, offset, type),
    queryFn: () => spotifyService.searchTracks(query, limit, offset, type ?? "all"),
    enabled: !!user && !!query && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to get best match (searches both tracks and playlists, returns best result)
 */
export const useSpotifyBestMatchQuery = (
  query: string,
  enabled = true
) => {
  const { user } = useAuth();

  const tracksQuery = useQuery({
    queryKey: [...spotifyDataKeys.bestMatch(query), "track"],
    queryFn: () => spotifyService.searchTracks(query, 1, 0, "track"),
    enabled: !!user && !!query && enabled,
    staleTime: 5 * 60 * 1000,
  });

  const playlistsQuery = useQuery({
    queryKey: [...spotifyDataKeys.bestMatch(query), "playlist"],
    queryFn: () => spotifyService.searchTracks(query, 1, 0, "playlist"),
    enabled: !!user && !!query && enabled,
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = tracksQuery.isLoading || playlistsQuery.isLoading;
  const isError = tracksQuery.isError || playlistsQuery.isError;

  // Determine best match: prioritize tracks if both have results
  let bestMatch: { type: "track" | "playlist"; data: SpotifySearchResponse } | null = null;

  if (tracksQuery.data?.tracks?.items.length) {
    bestMatch = {
      type: "track",
      data: tracksQuery.data,
    };
  } else if (playlistsQuery.data?.playlists?.items.length) {
    bestMatch = {
      type: "playlist",
      data: playlistsQuery.data,
    };
  }

  return {
    data: bestMatch,
    isLoading,
    isError,
  };
};
