import { onRequest } from "firebase-functions/v2/https";
import { verifyAuth, handleSpotifyError } from "../utils/auth.js";
import {
  getValidAccessToken,
  spotifyClientSecret,
} from "../utils/spotify-api.js";

/**
 * Play a track on Spotify
 * POST /spotify/play
 * Body: { trackId: string, deviceId?: string }
 */
export const spotifyPlay = onRequest(
  { cors: true, region: "europe-west1", secrets: [spotifyClientSecret] },
  async (request, response) => {
    try {
      // Verify Firebase auth
      const uid = await verifyAuth(request);

      // Get request body
      const { trackId, deviceId } = request.body;

      if (!trackId) {
        response.status(400).json({
          error: "Bad Request",
          message: "Missing trackId in request body",
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

      // Build play URL with optional device ID
      const playUrl = deviceId
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : "https://api.spotify.com/v1/me/player/play";

      // Play track on Spotify
      const spotifyResponse = await fetch(playUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [`spotify:track:${trackId}`],
        }),
      });

      if (!spotifyResponse.ok) {
        const error = await spotifyResponse.text();
        console.error("Spotify play error:", error);
        throw new Error(`Spotify play failed: ${spotifyResponse.status}`);
      }

      response.status(204).send();
    } catch (error) {
      handleSpotifyError(error, response);
    }
  }
);
