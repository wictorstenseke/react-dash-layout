import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";

import { spotifyService } from "./spotifyService";

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
  searchQuery: (query: string, limit: number, offset: number) =>
    [...spotifyDataKeys.search(), query, limit, offset] as const,
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
 * Hook to search for tracks
 */
export const useSpotifySearchTracksQuery = (
  query: string,
  limit = 20,
  offset = 0,
  enabled = true
) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: spotifyDataKeys.searchQuery(query, limit, offset),
    queryFn: () => spotifyService.searchTracks(query, limit, offset),
    enabled: !!user && !!query && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
