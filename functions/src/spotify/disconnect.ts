import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onRequest } from "firebase-functions/v2/https";
import { verifyAuth } from "../utils/auth.js";

/**
 * Disconnect Spotify account
 * POST /spotify/disconnect
 */
export const spotifyDisconnect = onRequest(
  { cors: true, region: "europe-west1" },
  async (request, response) => {
    try {
      // Verify Firebase auth
      const uid = await verifyAuth(request);

      const db = getFirestore();

      // Delete the token document
      const tokenDocRef = db.collection("spotifyTokens").doc(uid);
      await tokenDocRef.delete();

      // Update user document to remove Spotify link
      await db.collection("users").doc(uid).set(
        {
          spotify: FieldValue.delete(),
        },
        { merge: true }
      );

      response.json({
        success: true,
        message: "Spotify account disconnected successfully",
      });
    } catch (error) {
      console.error("Spotify disconnect error:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      response.status(500).json({
        error: "Internal Server Error",
        message: errorMessage,
      });
    }
  }
);
