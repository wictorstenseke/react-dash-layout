import { onRequest } from "firebase-functions/v2/https";
import { verifyAuth } from "../utils/auth.js";
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

type SpotifySearchResponse = {
  tracks: {
    items: SpotifyTrack[];
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
      const accessToken = await getValidAccessToken(uid, clientId, clientSecret);

      // Get pagination params
      const limit = Math.min(
        parseInt(request.query.limit as string) || 20,
        50
      );
      const offset = parseInt(request.query.offset as string) || 0;

      // Search tracks on Spotify
      const encodedQuery = encodeURIComponent(query);
      const data = await spotifyApiRequest<SpotifySearchResponse>(
        `/search?q=${encodedQuery}&type=track&limit=${limit}&offset=${offset}`,
        accessToken
      );

      response.json(data);
    } catch (error) {
      console.error("Spotify search tracks error:", error);
      response.status(500).json({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
