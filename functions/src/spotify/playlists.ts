import { onRequest } from "firebase-functions/v2/https";
import { verifyAuth } from "../utils/auth.js";
import {
  getValidAccessToken,
  spotifyApiRequest,
  spotifyClientSecret,
} from "../utils/spotify-api.js";

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

type SpotifyPlaylistsResponse = {
  items: SpotifyPlaylist[];
  total: number;
  limit: number;
  offset: number;
  next: string | null;
};

/**
 * Get user's Spotify playlists
 * GET /spotify/playlists
 */
export const spotifyPlaylists = onRequest(
  { cors: true, region: "europe-west1", secrets: [spotifyClientSecret] },
  async (request, response) => {
    try {
      // Verify Firebase auth
      const uid = await verifyAuth(request);

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
        parseInt(request.query.limit as string) || 50,
        50
      );
      const offset = parseInt(request.query.offset as string) || 0;

      // Fetch playlists from Spotify
      const data = await spotifyApiRequest<SpotifyPlaylistsResponse>(
        `/me/playlists?limit=${limit}&offset=${offset}`,
        accessToken
      );

      response.json(data);
    } catch (error) {
      console.error("Spotify playlists error:", error);
      response.status(500).json({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
