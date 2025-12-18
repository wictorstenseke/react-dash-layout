import { initializeApp, getApps } from "firebase-admin/app";

// Connect to Auth emulator in development (must be set BEFORE initializing Admin SDK)
// Firebase emulator automatically sets FIREBASE_AUTH_EMULATOR_HOST when Auth emulator is running,
// but we set it manually as a fallback if FUNCTIONS_EMULATOR is set
const isEmulator =
  process.env.FUNCTIONS_EMULATOR === "true" ||
  !!process.env.FIREBASE_EMULATOR_HUB;

if (isEmulator && !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  process.env.FIREBASE_AUTH_EMULATOR_HOST = "127.0.0.1:9099";
  console.log(
    "Configured Auth emulator connection:",
    process.env.FIREBASE_AUTH_EMULATOR_HOST
  );
}

// Initialize Firebase Admin (only if not already initialized)
if (getApps().length === 0) {
  initializeApp();
}

// Export Spotify OAuth functions
export { spotifyLogin } from "./spotify/login.js";
export { spotifyCallback } from "./spotify/callback.js";
export { spotifyRefresh } from "./spotify/refresh.js";
export { spotifyDisconnect } from "./spotify/disconnect.js";

// Export Spotify proxy functions
export { spotifyPlaylists } from "./spotify/playlists.js";
export { spotifyPlaylistTracks } from "./spotify/playlistTracks.js";
export { spotifySearchTracks } from "./spotify/searchTracks.js";
export { spotifyPlay } from "./spotify/play.js";
export { spotifyTransfer } from "./spotify/transfer.js";
