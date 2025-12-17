import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  Timestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type { Track, CreateTrackInput, UpdateTrackInput } from "./types";

/**
 * Get the tracks subcollection reference for a group
 */
function getGroupTracksCollection(uid: string, groupId: string) {
  return collection(db, "users", uid, "groups", groupId, "tracks");
}

/**
 * Create a new track in a group
 */
export async function createTrack(
  uid: string,
  groupId: string,
  data: CreateTrackInput
): Promise<Track> {
  try {
    const tracksRef = getGroupTracksCollection(uid, groupId);
    const docRef = await addDoc(tracksRef, {
      ...data,
      createdAt: serverTimestamp(),
    });

    const now = Timestamp.fromDate(new Date());
    return {
      id: docRef.id,
      ...data,
      createdAt: now,
    };
  } catch (error) {
    console.error("Error creating track:", error);
    throw new Error("Failed to create track");
  }
}

/**
 * List all tracks for a group, ordered by order field
 */
export async function listTracks(
  uid: string,
  groupId: string
): Promise<Track[]> {
  try {
    const tracksRef = getGroupTracksCollection(uid, groupId);
    const q = query(tracksRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Track[];
  } catch (error) {
    console.error("Error listing tracks:", error);
    throw new Error("Failed to list tracks");
  }
}

/**
 * Update a track in a group
 */
export async function updateTrack(
  uid: string,
  groupId: string,
  trackId: string,
  patch: UpdateTrackInput
): Promise<void> {
  try {
    const trackRef = doc(
      db,
      "users",
      uid,
      "groups",
      groupId,
      "tracks",
      trackId
    );
    await updateDoc(trackRef, patch);
  } catch (error) {
    console.error("Error updating track:", error);
    throw new Error("Failed to update track");
  }
}

/**
 * Delete a track from a group
 */
export async function deleteTrack(
  uid: string,
  groupId: string,
  trackId: string
): Promise<void> {
  try {
    const trackRef = doc(
      db,
      "users",
      uid,
      "groups",
      groupId,
      "tracks",
      trackId
    );
    await deleteDoc(trackRef);
  } catch (error) {
    console.error("Error deleting track:", error);
    throw new Error("Failed to delete track");
  }
}

/**
 * Reorder tracks by updating their order field in a batch
 */
export async function reorderTracks(
  uid: string,
  groupId: string,
  trackIds: string[]
): Promise<void> {
  try {
    const batch = writeBatch(db);

    trackIds.forEach((trackId, index) => {
      const trackRef = doc(
        db,
        "users",
        uid,
        "groups",
        groupId,
        "tracks",
        trackId
      );
      batch.update(trackRef, { order: index });
    });

    await batch.commit();
  } catch (error) {
    console.error("Error reordering tracks:", error);
    throw new Error("Failed to reorder tracks");
  }
}
