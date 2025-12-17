import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { spotifyClientSecret } from "../utils/spotify-api.js";
import {
  exchangeCodeForTokens,
  spotifyApiRequest,
} from "../utils/spotify-api.js";

type SpotifyUser = {
  id: string;
  display_name: string;
  product: string;
  email: string;
};

// Allowed origins for redirects to prevent open redirect attacks
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://spotdash-dbaf2.web.app",
  "https://spotdash-dbaf2.firebaseapp.com",
];

/**
 * Validate redirect URL to prevent open redirect attacks
 */
const validateRedirectUrl = (url: string, fallback: string): string => {
  try {
    const parsed = new URL(url);
    const origin = `${parsed.protocol}//${parsed.host}`;
    
    if (ALLOWED_ORIGINS.includes(origin)) {
      return url;
    }
    
    console.warn("Invalid redirect origin:", origin);
    return fallback;
  } catch {
    return fallback;
  }
};

/**
 * Handle Spotify OAuth callback
 * GET /spotify/callback?code=...&state=...
 */
export const spotifyCallback = onRequest(
  { cors: true, region: "europe-west1", secrets: [spotifyClientSecret] },
  async (request, response) => {
    try {
      const code = request.query.code as string;
      const state = request.query.state as string;
      const error = request.query.error as string;

      if (error) {
        throw new Error(`Spotify authorization error: ${error}`);
      }

      if (!code || !state) {
        throw new Error("Missing code or state parameter");
      }

      // Validate state and get stored data
      const db = admin.firestore();
      const stateDoc = await db.collection("oauthStates").doc(state).get();

      if (!stateDoc.exists) {
        throw new Error("Invalid or expired state");
      }

      const stateData = stateDoc.data();
      if (!stateData) {
        throw new Error("Invalid state document");
      }

      // Check expiration
      const stateExpiresAt = stateData.expiresAt.toDate();
      if (stateExpiresAt < new Date()) {
        throw new Error("State has expired");
      }

      const { uid, verifier, redirectBackUrl } = stateData;

      // Delete used state
      await stateDoc.ref.delete();

      // Get environment config
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      if (!clientId) {
        throw new Error("SPOTIFY_CLIENT_ID not configured");
      }

      const baseUrl =
        process.env.FUNCTIONS_EMULATOR === "true"
          ? "http://127.0.0.1:5001/spotdash-dbaf2/europe-west1"
          : "https://europe-west1-spotdash-dbaf2.cloudfunctions.net";

      const redirectUri = `${baseUrl}/spotifyCallback`;

      // Exchange code for tokens
      const tokens = await exchangeCodeForTokens(
        code,
        verifier,
        redirectUri,
        clientId
      );

      // Get Spotify user info
      const spotifyUser = await spotifyApiRequest<SpotifyUser>(
        "/me",
        tokens.access_token
      );

      // Store refresh token in secure collection
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
      await db
        .collection("spotifyTokens")
        .doc(uid)
        .set(
          {
            refresh_token: tokens.refresh_token,
            access_token: tokens.access_token,
            expires_at: admin.firestore.Timestamp.fromDate(expiresAt),
            scope: tokens.scope,
          },
          { merge: false }
        );

      // Update user document with Spotify link status
      await db
        .collection("users")
        .doc(uid)
        .set(
          {
            spotify: {
              linked: true,
              linkedAt: admin.firestore.FieldValue.serverTimestamp(),
              displayName: spotifyUser.display_name,
              premium: spotifyUser.product === "premium",
            },
          },
          { merge: true }
        );

      // Redirect back to frontend (validated)
      const defaultOrigin = ALLOWED_ORIGINS[0];
      const frontendUrl = redirectBackUrl || process.env.FRONTEND_URL || "/";
      const baseOrigin = request.headers.origin || defaultOrigin;
      
      const successUrl = new URL(frontendUrl, baseOrigin);
      successUrl.searchParams.set("spotify", "connected");
      
      const validatedSuccessUrl = validateRedirectUrl(successUrl.toString(), defaultOrigin);
      response.redirect(validatedSuccessUrl);
    } catch (error) {
      console.error("Spotify callback error:", error);

      // Redirect to frontend with error (validated)
      const defaultOrigin = ALLOWED_ORIGINS[0];
      const frontendUrl = process.env.FRONTEND_URL || "/";
      const baseOrigin = request.headers.origin || defaultOrigin;
      
      const errorUrl = new URL(frontendUrl, baseOrigin);
      errorUrl.searchParams.set("spotify", "error");
      errorUrl.searchParams.set(
        "message",
        error instanceof Error ? error.message : "Unknown error"
      );

      const validatedErrorUrl = validateRedirectUrl(errorUrl.toString(), defaultOrigin);
      response.redirect(validatedErrorUrl);
    }
  }
);
