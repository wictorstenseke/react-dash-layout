import { onRequest } from "firebase-functions/v2/https";
import { verifyAuth, handleSpotifyError } from "../utils/auth.js";
import {
  getValidAccessToken,
  spotifyClientSecret,
} from "../utils/spotify-api.js";

/**
 * Transfer playback to a device
 * POST /spotify/transfer
 * Body: { deviceId: string }
 */
export const spotifyTransfer = onRequest(
  { cors: true, region: "europe-west1", secrets: [spotifyClientSecret] },
  async (request, response) => {
    try {
      // Verify Firebase auth
      const uid = await verifyAuth(request);

      // Get request body
      const { deviceId } = request.body;

      if (!deviceId) {
        response.status(400).json({
          error: "Bad Request",
          message: "Missing deviceId in request body",
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

      // Transfer playback to device
      const transferUrl = "https://api.spotify.com/v1/me/player";
      const spotifyResponse = await fetch(transferUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_ids: [deviceId],
        }),
      });

      if (!spotifyResponse.ok) {
        const error = await spotifyResponse.text();
        console.error("Spotify transfer error:", error);
        throw new Error(`Spotify transfer failed: ${spotifyResponse.status}`);
      }

      response.status(204).send();
    } catch (error) {
      handleSpotifyError(error, response);
    }
  }
);
