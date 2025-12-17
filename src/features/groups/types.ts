import type { Timestamp } from "firebase/firestore";

// Available colors for groups and tracks
export const GROUP_COLORS = [
  "blue",
  "green",
  "purple",
  "orange",
  "pink",
  "teal",
  "red",
  "yellow",
  "indigo",
  "cyan",
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
  label: string;
  color: TrackColor;
  order: number;
  createdAt: Timestamp;
};

export type CreateTrackInput = {
  label: string;
  color: TrackColor;
  order: number;
};

export type UpdateTrackInput = Partial<Omit<Track, "id" | "createdAt">>;
