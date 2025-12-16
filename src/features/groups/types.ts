import type { Timestamp } from "firebase/firestore";

export type Group = {
  id: string;
  name: string;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type CreateGroupInput = {
  name: string;
  order: number;
};

export type UpdateGroupInput = Partial<Omit<Group, "id" | "createdAt">>;
