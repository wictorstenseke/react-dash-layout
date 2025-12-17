import * as admin from "firebase-admin";
import type { Request } from "firebase-functions/v2/https";

export type VerifiedRequest = Request & {
  uid: string;
};

/**
 * Verifies Firebase ID token from Authorization header
 * Returns the user's UID if valid, throws error otherwise
 */
export const verifyAuth = async (request: Request): Promise<string> => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized: Missing or invalid Authorization header");
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error("Token verification failed:", error);
    throw new Error("Unauthorized: Invalid token");
  }
};
