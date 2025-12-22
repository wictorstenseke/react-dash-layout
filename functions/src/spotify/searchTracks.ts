import { onRequest } from "firebase-functions/v2/https";
import { verifyAuth, handleSpotifyError } from "../utils/auth.js";
import {
  getValidAccessToken,
  spotifyApiRequest,
  spotifyClientSecret,
} from "../utils/spotify-api.js";

type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  uri: string;
};

type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
  owner: {
    display_name: string;
  };
};

type SpotifySearchResponse = {
  tracks?: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
  };
  playlists?: {
    items: SpotifyPlaylist[];
    total: number;
    limit: number;
    offset: number;
    next: string | null;
  };
};

/**
 * Search Spotify for tracks
 * GET /spotify/searchTracks?q=...
 */
export const spotifySearchTracks = onRequest(
  { cors: true, region: "europe-west1", secrets: [spotifyClientSecret] },
  async (request, response) => {
    try {
      // Verify Firebase auth
      const uid = await verifyAuth(request);

      const query = request.query.q as string;
      if (!query) {
        response.status(400).json({
          error: "Bad Request",
          message: "Missing q parameter",
        });
        return;
      }

      // Get client credentials
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      const clientSecret = spotifyClientSecret.value();

      if (!clientId || !clientSecret) {
        throw new Error("Spotify credentials not configured");
      }

      // Get valid access token
      const accessToken = await getValidAccessToken(
        uid,
        clientId,
        clientSecret
      );

      // Get pagination params
      const limit = Math.min(parseInt(request.query.limit as string) || 20, 50);
      const offset = parseInt(request.query.offset as string) || 0;

      // Get type parameter (track, playlist, or track,playlist)
      const typeParam = (request.query.type as string) || "track,playlist";

      // Search on Spotify
      const encodedQuery = encodeURIComponent(query);
      const data = await spotifyApiRequest<SpotifySearchResponse>(
        `/search?q=${encodedQuery}&type=${typeParam}&limit=${limit}&offset=${offset}`,
        accessToken
      );

      // Log for debugging
      console.log("Spotify search response:", {
        query,
        typeParam,
        hasTracks: !!data.tracks,
        tracksCount: data.tracks?.items?.length ?? 0,
        hasPlaylists: !!data.playlists,
        playlistsCount: data.playlists?.items?.length ?? 0,
        fullResponse: JSON.stringify(data).substring(0, 500),
      });

      response.json(data);
    } catch (error) {
      handleSpotifyError(error, response);
    }
  }
);
