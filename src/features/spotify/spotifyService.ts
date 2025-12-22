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
 * Make authenticated request to Cloud Functions with retry logic for rate limits
 */
const fetchWithAuth = async <T>(
  endpoint: string,
  options?: RequestInit,
  retryCount = 0,
  maxRetries = 3
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

  // Handle rate limiting (429) with exponential backoff
  if (response.status === 429 && retryCount < maxRetries) {
    const retryAfter = response.headers.get("Retry-After");
    const delayMs = retryAfter
      ? parseInt(retryAfter, 10) * 1000
      : Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s

    console.warn(
      `Rate limited (429) on ${endpoint}, retrying after ${delayMs}ms (attempt ${retryCount + 1}/${maxRetries})`
    );

    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return fetchWithAuth<T>(endpoint, options, retryCount + 1, maxRetries);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }));
    throw new Error(error.message || `Request failed: ${response.status}`);
  }

  // Handle 204 No Content responses (no body to parse)
  if (response.status === 204 || response.status === 201) {
    return undefined as T;
  }

  // Check if response has content to parse
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const text = await response.text();
    return text ? JSON.parse(text) : (undefined as T);
  }

  return undefined as T;
};

/**
 * Spotify Service - API client for Spotify integration
 */
export const spotifyService = {
  /**
   * Start Spotify OAuth flow
   * Note: Uses fetch with Authorization header, then redirects based on response
   */
  startOAuthFlow: async (redirectBackUrl?: string): Promise<void> => {
    const token = await getAuthToken();
    const params = new URLSearchParams();
    if (redirectBackUrl) {
      params.set("redirectBackUrl", redirectBackUrl);
    }

    // Make authenticated request to get redirect URL
    const response = await fetch(
      `${FUNCTIONS_BASE_URL}/spotifyLogin?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || "Failed to start OAuth flow");
    }

    // Get redirect URL from response
    const data = await response.json();
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
    } else {
      throw new Error("No redirect URL received from server");
    }
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
   * Search for tracks and/or playlists
   */
  searchTracks: async (
    query: string,
    limit = 20,
    offset = 0,
    type: "track" | "playlist" | "all" = "all"
  ): Promise<SpotifySearchResponse> => {
    const encodedQuery = encodeURIComponent(query);
    const typeParam = type === "all" ? "track,playlist" : type;
    return fetchWithAuth<SpotifySearchResponse>(
      `/spotifySearchTracks?q=${encodedQuery}&type=${typeParam}&limit=${limit}&offset=${offset}`
    );
  },

  /**
   * Transfer playback to a device
   */
  transferPlayback: async (deviceId: string): Promise<void> => {
    await fetchWithAuth<void>("/spotifyTransfer", {
      method: "POST",
      body: JSON.stringify({ deviceId }),
    });
  },

  /**
   * Play a track on Spotify
   */
  playTrack: async (trackId: string, deviceId?: string): Promise<void> => {
    await fetchWithAuth<void>("/spotifyPlay", {
      method: "POST",
      body: JSON.stringify({ trackId, deviceId }),
    });
  },

  /**
   * Play multiple tracks on Spotify (replaces queue)
   */
  playTracks: async (trackUris: string[], deviceId?: string): Promise<void> => {
    await fetchWithAuth<void>("/spotifyPlay", {
      method: "POST",
      body: JSON.stringify({ trackUris, deviceId }),
    });
  },

  /**
   * Add a track to Spotify playback queue
   */
  addToQueue: async (trackId: string, deviceId?: string): Promise<void> => {
    await fetchWithAuth<void>("/spotifyQueue", {
      method: "POST",
      body: JSON.stringify({ trackId, deviceId }),
    });
  },

  /**
   * Disconnect Spotify account
   */
  disconnect: async (): Promise<void> => {
    await fetchWithAuth<void>("/spotifyDisconnect", {
      method: "POST",
    });
  },
};
