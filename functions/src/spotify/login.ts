import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { verifyAuth } from "../utils/auth.js";
import { randomBytes, createHash } from "crypto";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";
const SCOPES = [
  "playlist-read-private",
  "user-read-private", // Required to get user's product/subscription type
  "user-read-email", // Required by Web Playback SDK
  "user-read-playback-state",
  "user-modify-playback-state",
  "streaming",
].join(" ");

/**
 * Generate code verifier and challenge for PKCE (RFC 7636)
 * Challenge is SHA256 hash of verifier
 */
const generatePKCE = () => {
  const verifier = randomBytes(32).toString("base64url");

  // Create SHA256 hash of verifier
  const hash = createHash("sha256").update(verifier).digest();
  const challenge = hash.toString("base64url");

  return { verifier, challenge };
};

/**
 * Start Spotify OAuth flow
 * GET /spotify/login
 */
export const spotifyLogin = onRequest(
  { cors: true, region: "europe-west1" },
  async (request, response) => {
    try {
      // Verify Firebase auth
      const uid = await verifyAuth(request);

      // Get client ID from environment
      const clientId = process.env.SPOTIFY_CLIENT_ID;
      if (!clientId) {
        throw new Error("SPOTIFY_CLIENT_ID not configured");
      }

      // Get redirect URL from request or use default
      const redirectBackUrl = request.query.redirectBackUrl as string;

      // Generate PKCE values
      const { verifier, challenge } = generatePKCE();

      // Generate state (bound to uid)
      const state = randomBytes(16).toString("hex");

      // Store state and verifier temporarily (expires in 10 minutes)
      const db = getFirestore();
      await db
        .collection("oauthStates")
        .doc(state)
        .set(
          {
            uid,
            verifier,
            redirectBackUrl: redirectBackUrl || null,
            createdAt: FieldValue.serverTimestamp(),
            expiresAt: Timestamp.fromMillis(Date.now() + 10 * 60 * 1000),
          },
          { merge: false }
        );

      // Get callback URL based on environment
      const baseUrl =
        process.env.FUNCTIONS_EMULATOR === "true"
          ? "http://127.0.0.1:5001/spotdash-dbaf2/europe-west1"
          : "https://europe-west1-spotdash-dbaf2.cloudfunctions.net";

      const redirectUri = `${baseUrl}/spotifyCallback`;

      // Build authorization URL
      const authUrl = new URL(SPOTIFY_AUTH_URL);
      authUrl.searchParams.set("client_id", clientId);
      authUrl.searchParams.set("response_type", "code");
      authUrl.searchParams.set("redirect_uri", redirectUri);
      authUrl.searchParams.set("state", state);
      authUrl.searchParams.set("code_challenge", challenge);
      authUrl.searchParams.set("code_challenge_method", "S256");
      authUrl.searchParams.set("scope", SCOPES);

      // Return JSON with redirect URL (CORS-friendly approach)
      // Frontend will handle the redirect
      response.json({
        redirectUrl: authUrl.toString(),
      });
    } catch (error) {
      console.error("Spotify login error:", error);
      response.status(401).json({
        error: "Unauthorized",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
