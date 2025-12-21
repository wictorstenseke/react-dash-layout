import { onRequest } from "firebase-functions/v2/https";
import { verifyAuth, handleSpotifyError } from "../utils/auth.js";
import {
  getValidAccessToken,
  spotifyClientSecret,
} from "../utils/spotify-api.js";

/**
 * Add a track to Spotify playback queue
 * POST /spotify/queue
 * Body: { trackId: string, deviceId?: string }
 */
export const spotifyQueue = onRequest(
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

      // Build queue URL with track URI and optional device ID
      const trackUri = `spotify:track:${trackId}`;
      const queueUrl = new URL("https://api.spotify.com/v1/me/player/queue");
      queueUrl.searchParams.set("uri", trackUri);
      if (deviceId) {
        queueUrl.searchParams.set("device_id", deviceId);
      }

      // Add track to queue
      const spotifyResponse = await fetch(queueUrl.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!spotifyResponse.ok) {
        const error = await spotifyResponse.text();
        console.error("Spotify queue error:", error);
        throw new Error(`Spotify queue failed: ${spotifyResponse.status}`);
      }

      response.status(204).send();
    } catch (error) {
      handleSpotifyError(error, response);
    }
  }
);

