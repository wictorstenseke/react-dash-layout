import * as admin from "firebase-admin";

// Initialize Firebase Admin
admin.initializeApp();

// Export Spotify OAuth functions
export { spotifyLogin } from "./spotify/login.js";
export { spotifyCallback } from "./spotify/callback.js";
export { spotifyRefresh } from "./spotify/refresh.js";

// Export Spotify proxy functions
export { spotifyPlaylists } from "./spotify/playlists.js";
export { spotifyPlaylistTracks } from "./spotify/playlistTracks.js";
export { spotifySearchTracks } from "./spotify/searchTracks.js";
export { spotifyPlay } from "./spotify/play.js";
