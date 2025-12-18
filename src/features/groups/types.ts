import type { Timestamp } from "firebase/firestore";

// Available colors for groups and tracks - distinct colors only
export const GROUP_COLORS = [
  "gray-light",
  "gray",
  "gray-dark",
  "blue",
  "green",
  "purple",
  "orange",
  "pink",
  "red",
  "yellow",
  "teal",
] as const;

export type GroupColor = (typeof GROUP_COLORS)[number];

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

// Track types (songs/items within groups)
export const TRACK_COLORS = [
  "blue",
  "green",
  "yellow",
  "red",
  "purple",
  "pink",
  "indigo",
  "orange",
  "teal",
  "cyan",
] as const;

export type TrackColor = (typeof TRACK_COLORS)[number];

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
  origin?: {
    type: "manual" | "playlist";
    playlistId?: string;
  };
};

export type UpdateTrackInput = Partial<Omit<Track, "id" | "createdAt">>;
