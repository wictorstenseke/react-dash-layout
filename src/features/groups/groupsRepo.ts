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
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type { Group, CreateGroupInput, UpdateGroupInput } from "./types";

/**
 * Get the groups collection reference for a user
 */
function getUserGroupsCollection(uid: string) {
  return collection(db, "users", uid, "groups");
}

/**
 * Create a new group for a user
 */
export async function createGroup(
  uid: string,
  data: CreateGroupInput
): Promise<Group> {
  try {
    const groupsRef = getUserGroupsCollection(uid);
    const docRef = await addDoc(groupsRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Return the created group with generated ID
    // Note: createdAt/updatedAt are approximate, will be corrected on next read
    const now = Timestamp.fromDate(new Date());
    return {
      id: docRef.id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error("Failed to create group");
  }
}

/**
 * List all groups for a user, ordered by order field
 */
export async function listGroups(uid: string): Promise<Group[]> {
  try {
    const groupsRef = getUserGroupsCollection(uid);
    const q = query(groupsRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Group[];
  } catch (error) {
    console.error("Error listing groups:", error);
    throw new Error("Failed to list groups");
  }
}

/**
 * Update a group for a user
 */
export async function updateGroup(
  uid: string,
  groupId: string,
  patch: UpdateGroupInput
): Promise<void> {
  try {
    const groupRef = doc(db, "users", uid, "groups", groupId);
    await updateDoc(groupRef, {
      ...patch,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating group:", error);
    throw new Error("Failed to update group");
  }
}

/**
 * Delete a group for a user
 */
export async function deleteGroup(uid: string, groupId: string): Promise<void> {
  try {
    const groupRef = doc(db, "users", uid, "groups", groupId);
    await deleteDoc(groupRef);
  } catch (error) {
    console.error("Error deleting group:", error);
    throw new Error("Failed to delete group");
  }
}
