import { getAuth } from "firebase-admin/auth";
import type { Request } from "firebase-functions/v2/https";

export type VerifiedRequest = Request & {
  uid: string;
};

/**
 * Helper to handle Spotify-related errors with appropriate HTTP status codes
 */
export const handleSpotifyError = (
  error: unknown,
  response: { status: (code: number) => { json: (data: unknown) => void } }
): void => {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";
  const isNotLinked =
    errorMessage.includes("not linked") ||
    errorMessage.includes("Spotify not linked");

  if (isNotLinked) {
    response.status(403).json({
      error: "Forbidden",
      message:
        "Spotify account not linked. Please connect your Spotify account first.",
    });
  } else {
    console.error("Spotify error:", error);
    response.status(500).json({
      error: "Internal Server Error",
      message: errorMessage,
    });
  }
};

/**
 * Verifies Firebase ID token from Authorization header
 * Returns the user's UID if valid, throws error otherwise
 */
export const verifyAuth = async (request: Request): Promise<string> => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Auth header missing or invalid:", {
      hasHeader: !!authHeader,
      startsWithBearer: authHeader?.startsWith("Bearer "),
    });
    throw new Error("Unauthorized: Missing or invalid Authorization header");
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    // Log emulator connection status for debugging
    if (process.env.FUNCTIONS_EMULATOR === "true") {
      console.log(
        "Using Auth emulator:",
        process.env.FIREBASE_AUTH_EMULATOR_HOST
      );
    }

    const decodedToken = await getAuth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Token verification failed:", {
      error: error instanceof Error ? error.message : String(error),
      emulatorHost: process.env.FIREBASE_AUTH_EMULATOR_HOST,
      functionsEmulator: process.env.FUNCTIONS_EMULATOR,
      tokenLength: token.length,
    });
    throw new Error("Unauthorized: Invalid token");
  }
};
