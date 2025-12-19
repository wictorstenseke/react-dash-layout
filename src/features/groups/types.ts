import type { Timestamp } from "firebase/firestore";

// Available colors for groups and tracks - unified color palette
export const COLORS = [
  "gray-light",
  "gray",
  "gray-dark",
  "blue",
  "green",
  "yellow",
  "red",
  "purple",
  "teal",
] as const;

export type Color = (typeof COLORS)[number];

// Groups and tracks use the same colors
export const GROUP_COLORS = COLORS;
export const TRACK_COLORS = COLORS;

export type GroupColor = Color;
export type TrackColor = Color;

export type Group = {
  id: string;
  name: string;
  color: GroupColor;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateGroupInput = {
  name: string;
  color: GroupColor;
  order: number;
};

export type UpdateGroupInput = Partial<Omit<Group, "id" | "createdAt">>;

export type Track = {
  id: string;
  label: string; // Display name (can be track title or custom)
  color: TrackColor;
  order: number;
  createdAt: Timestamp;

  // Spotify fields (optional for backwards compatibility)
  spotifyTrackId?: string; // Spotify track URI/ID
  title?: string; // Original Spotify track title
  artists?: string[]; // Artist names
  albumImageUrl?: string; // Album art URL
  durationMs?: number; // Track duration
  startTimeMs?: number; // Start time offset in milliseconds (for skipping intro/starting at specific point)
  origin?: {
    // How track was added
    type: "manual" | "playlist";
    playlistId?: string;
  };
};

export type CreateTrackInput = {
  label: string;
  color: TrackColor;
  order: number;
  spotifyTrackId?: string;
  title?: string;
  artists?: string[];
  albumImageUrl?: string;
  durationMs?: number;
  startTimeMs?: number;
  origin?: {
    type: "manual" | "playlist";
    playlistId?: string;
  };
};

export type UpdateTrackInput = Partial<Omit<Track, "id" | "createdAt">>;
