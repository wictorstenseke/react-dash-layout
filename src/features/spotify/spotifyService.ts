import { auth } from "@/lib/firebase";
import type {
  SpotifyPlaylistsResponse,
  SpotifyPlaylistTracksResponse,
  SpotifySearchResponse,
  SpotifyTokenResponse,
} from "./types";

const FUNCTIONS_BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://127.0.0.1:5001/spotdash-dbaf2/europe-west1"
    : "https://europe-west1-spotdash-dbaf2.cloudfunctions.net";

/**
 * Get Firebase ID token for authenticated requests
 */
const getAuthToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.getIdToken();
};

/**
 * Make authenticated request to Cloud Functions
 */
const fetchWithAuth = async <T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> => {
  const token = await getAuthToken();

  const response = await fetch(`${FUNCTIONS_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  return response.json();
};

/**
 * Spotify Service - API client for Spotify integration
 */
export const spotifyService = {
  /**
   * Start Spotify OAuth flow
   */
  startOAuthFlow: async (redirectBackUrl?: string): Promise<void> => {
    const token = await getAuthToken();
    const params = new URLSearchParams();
    if (redirectBackUrl) {
      params.set("redirectBackUrl", redirectBackUrl);
    }

    const url = `${FUNCTIONS_BASE_URL}/spotifyLogin?${params.toString()}`;
    window.location.href = url + `&token=${token}`;
  },

  /**
   * Get fresh access token
   */
  refreshToken: async (): Promise<SpotifyTokenResponse> => {
    return fetchWithAuth<SpotifyTokenResponse>("/spotifyRefresh", {
      method: "POST",
    });
  },

  /**
   * Get user's Spotify playlists
   */
  getPlaylists: async (
    limit = 50,
    offset = 0
  ): Promise<SpotifyPlaylistsResponse> => {
    return fetchWithAuth<SpotifyPlaylistsResponse>(
      `/spotifyPlaylists?limit=${limit}&offset=${offset}`
    );
  },

  /**
   * Get tracks from a playlist
   */
  getPlaylistTracks: async (
    playlistId: string,
    limit = 100,
    offset = 0
  ): Promise<SpotifyPlaylistTracksResponse> => {
    return fetchWithAuth<SpotifyPlaylistTracksResponse>(
      `/spotifyPlaylistTracks?playlistId=${playlistId}&limit=${limit}&offset=${offset}`
    );
  },

  /**
   * Search for tracks
   */
  searchTracks: async (
    query: string,
    limit = 20,
    offset = 0
  ): Promise<SpotifySearchResponse> => {
    const encodedQuery = encodeURIComponent(query);
    return fetchWithAuth<SpotifySearchResponse>(
      `/spotifySearchTracks?q=${encodedQuery}&limit=${limit}&offset=${offset}`
    );
  },
};
