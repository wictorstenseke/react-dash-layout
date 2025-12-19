import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";
import {
  createTrack,
  deleteTrack,
  listTracks,
  reorderTracks,
  updateTrack,
} from "@/features/groups/tracksRepo";

import type {
  CreateTrackInput,
  Track,
  UpdateTrackInput,
} from "@/features/groups/types";

/**
 * Query keys for tracks
 */
export const trackKeys = {
  all: ["tracks"] as const,
  lists: () => [...trackKeys.all, "list"] as const,
  list: (uid: string, groupId: string) =>
    [...trackKeys.lists(), uid, groupId] as const,
  details: () => [...trackKeys.all, "detail"] as const,
  detail: (uid: string, groupId: string, trackId: string) =>
    [...trackKeys.details(), uid, groupId, trackId] as const,
};

/**
 * Hook to fetch all tracks for a specific group
 */
export const useTracksQuery = (groupId: string) => {
  const { user } = useAuth();
  const uid = user?.uid;

  return useQuery({
    queryKey: trackKeys.list(uid ?? "", groupId),
    queryFn: () => listTracks(uid!, groupId),
    enabled: !!uid && !!groupId,
  });
};

/**
 * Hook to create a new track in a group
 */
export const useCreateTrackMutation = (groupId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  return useMutation({
    mutationFn: (data: CreateTrackInput) => {
      if (!uid) throw new Error("User not authenticated");
      return createTrack(uid, groupId, data);
    },
    onSuccess: (newTrack) => {
      if (!uid) return;

      // Optimistically add to cache
      queryClient.setQueryData<Track[]>(trackKeys.list(uid, groupId), (old) =>
        old ? [...old, newTrack] : [newTrack]
      );

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: trackKeys.list(uid, groupId),
      });
    },
  });
};

/**
 * Hook to update a track with optimistic updates
 */
export const useUpdateTrackMutation = (groupId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  return useMutation({
    mutationFn: ({
      trackId,
      data,
    }: {
      trackId: string;
      data: UpdateTrackInput;
    }) => {
      if (!uid) throw new Error("User not authenticated");
      return updateTrack(uid, groupId, trackId, data);
    },
    onMutate: async ({ trackId, data }) => {
      if (!uid) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: trackKeys.list(uid, groupId),
      });

      // Snapshot previous value
      const previousTracks = queryClient.getQueryData<Track[]>(
        trackKeys.list(uid, groupId)
      );

      // Optimistically update
      if (previousTracks) {
        queryClient.setQueryData<Track[]>(
          trackKeys.list(uid, groupId),
          previousTracks.map((track) =>
            track.id === trackId ? { ...track, ...data } : track
          )
        );
      }

      return { previousTracks };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousTracks && uid) {
        queryClient.setQueryData(
          trackKeys.list(uid, groupId),
          context.previousTracks
        );
      }
    },
    onSettled: () => {
      if (!uid) return;
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: trackKeys.list(uid, groupId),
      });
    },
  });
};

/**
 * Hook to delete a track from a group
 */
export const useDeleteTrackMutation = (groupId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  return useMutation({
    mutationFn: (trackId: string) => {
      if (!uid) throw new Error("User not authenticated");
      return deleteTrack(uid, groupId, trackId);
    },
    onMutate: async (trackId) => {
      if (!uid) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: trackKeys.list(uid, groupId),
      });

      // Snapshot previous value
      const previousTracks = queryClient.getQueryData<Track[]>(
        trackKeys.list(uid, groupId)
      );

      // Optimistically remove
      if (previousTracks) {
        queryClient.setQueryData<Track[]>(
          trackKeys.list(uid, groupId),
          previousTracks.filter((track) => track.id !== trackId)
        );
      }

      return { previousTracks };
    },
    onError: (_error, _trackId, context) => {
      // Rollback on error
      if (context?.previousTracks && uid) {
        queryClient.setQueryData(
          trackKeys.list(uid, groupId),
          context.previousTracks
        );
      }
    },
    onSettled: () => {
      if (!uid) return;
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: trackKeys.list(uid, groupId),
      });
    },
  });
};

/**
 * Hook to reorder tracks within a group
 */
export const useReorderTracksMutation = (groupId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  return useMutation({
    mutationFn: (trackIds: string[]) => {
      if (!uid) throw new Error("User not authenticated");
      return reorderTracks(uid, groupId, trackIds);
    },
    onMutate: async (trackIds) => {
      if (!uid) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: trackKeys.list(uid, groupId),
      });

      // Snapshot previous value
      const previousTracks = queryClient.getQueryData<Track[]>(
        trackKeys.list(uid, groupId)
      );

      // Optimistically reorder
      if (previousTracks) {
        const reorderedTracks = trackIds
          .map((id, index) => {
            const track = previousTracks.find((t) => t.id === id);
            return track ? { ...track, order: index } : null;
          })
          .filter((t): t is Track => t !== null);

        queryClient.setQueryData<Track[]>(
          trackKeys.list(uid, groupId),
          reorderedTracks
        );
      }

      return { previousTracks };
    },
    onError: (_error, _trackIds, context) => {
      // Rollback on error
      if (context?.previousTracks && uid) {
        queryClient.setQueryData(
          trackKeys.list(uid, groupId),
          context.previousTracks
        );
      }
    },
    onSettled: () => {
      if (!uid) return;
      // Refetch after mutation
      queryClient.invalidateQueries({
        queryKey: trackKeys.list(uid, groupId),
      });
    },
  });
};

