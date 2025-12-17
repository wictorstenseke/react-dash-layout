import { onRequest } from "firebase-functions/v2/https";
import { verifyAuth } from "../utils/auth.js";
import {
  getValidAccessToken,
  spotifyClientSecret,
} from "../utils/spotify-api.js";

/**
 * Get fresh access token for authenticated user
 * POST /spotify/refresh
 */
export const spotifyRefresh = onRequest(
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

      // Get or refresh access token
      const accessToken = await getValidAccessToken(
        uid,
        clientId,
        clientSecret
      );

      response.json({
        access_token: accessToken,
        expires_in: 3600, // Standard Spotify token lifetime
      });
    } catch (error) {
      console.error("Spotify refresh error:", error);

      // Return 403 if Spotify is not linked (user is authenticated but hasn't connected Spotify)
      // Return 401 for actual authentication errors
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const isNotLinked =
        errorMessage.includes("not linked") ||
        errorMessage.includes("Spotify not linked");

      response.status(isNotLinked ? 403 : 401).json({
        error: isNotLinked ? "Forbidden" : "Unauthorized",
        message: errorMessage,
      });
    }
  }
);
