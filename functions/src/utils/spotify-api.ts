import * as admin from "firebase-admin";
import { defineSecret } from "firebase-functions/params";

export const spotifyClientSecret = defineSecret("SPOTIFY_CLIENT_SECRET");

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

/**
 * Exchange authorization code for tokens using PKCE
 */
export const exchangeCodeForTokens = async (
  code: string,
  codeVerifier: string,
  redirectUri: string,
  clientId: string
): Promise<TokenResponse> => {
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Token exchange failed:", error);
    throw new Error(`Failed to exchange code for tokens: ${response.status}`);
  }

  return response.json();
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string,
  clientId: string,
  clientSecret: string
): Promise<TokenResponse> => {
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Token refresh failed:", error);
    throw new Error(`Failed to refresh token: ${response.status}`);
  }

  return response.json();
};

/**
 * Get or refresh access token for a user
 */
export const getValidAccessToken = async (
  uid: string,
  clientId: string,
  clientSecret: string
): Promise<string> => {
  const db = admin.firestore();
  const tokenDoc = await db.collection("spotifyTokens").doc(uid).get();

  if (!tokenDoc.exists) {
    throw new Error("Spotify not linked for this user");
  }

  const tokenData = tokenDoc.data();
  if (!tokenData) {
    throw new Error("Invalid token document");
  }

  // Check if cached token is still valid (with 5 minute buffer)
  if (tokenData.access_token && tokenData.expires_at) {
    const expiresAt = tokenData.expires_at.toDate();
    const now = new Date();
    const bufferMs = 5 * 60 * 1000; // 5 minutes

    if (expiresAt.getTime() - now.getTime() > bufferMs) {
      return tokenData.access_token;
    }
  }

  // Need to refresh
  const tokens = await refreshAccessToken(
    tokenData.refresh_token,
    clientId,
    clientSecret
  );

  // Update cached token
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  await tokenDoc.ref.update({
    access_token: tokens.access_token,
    expires_at: admin.firestore.Timestamp.fromDate(expiresAt),
  });

  return tokens.access_token;
};

/**
 * Make authenticated request to Spotify API
 */
export const spotifyApiRequest = async <T>(
  endpoint: string,
  accessToken: string,
  options?: RequestInit
): Promise<T> => {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${SPOTIFY_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error(`Spotify API error [${endpoint}]:`, error);
    throw new Error(`Spotify API error: ${response.status}`);
  }

  return response.json();
};
