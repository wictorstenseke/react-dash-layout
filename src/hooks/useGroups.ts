import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth/AuthProvider";
import {
  createGroup,
  deleteGroup,
  listGroups,
  updateGroup,
} from "@/features/groups/groupsRepo";

import type {
  CreateGroupInput,
  Group,
  UpdateGroupInput,
} from "@/features/groups/types";

/**
 * Query keys for groups
 */
export const groupKeys = {
  all: ["groups"] as const,
  lists: () => [...groupKeys.all, "list"] as const,
  list: (uid: string) => [...groupKeys.lists(), uid] as const,
  details: () => [...groupKeys.all, "detail"] as const,
  detail: (uid: string, groupId: string) =>
    [...groupKeys.details(), uid, groupId] as const,
};

/**
 * Hook to fetch all groups for the current user
 */
export const useGroupsQuery = () => {
  const { user } = useAuth();
  const uid = user?.uid;

  return useQuery({
    queryKey: groupKeys.list(uid ?? ""),
    queryFn: () => listGroups(uid!),
    enabled: !!uid,
  });
};

/**
 * Hook to create a new group
 */
export const useCreateGroupMutation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  return useMutation({
    mutationFn: (data: CreateGroupInput) => {
      if (!uid) throw new Error("User not authenticated");
      return createGroup(uid, data);
    },
    onSuccess: (newGroup) => {
      if (!uid) return;

      // Optimistically add to cache
      queryClient.setQueryData<Group[]>(groupKeys.list(uid), (old) =>
        old ? [...old, newGroup] : [newGroup]
      );

      // Invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

/**
 * Hook to update a group with optimistic updates
 */
export const useUpdateGroupMutation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: UpdateGroupInput;
    }) => {
      if (!uid) throw new Error("User not authenticated");
      return updateGroup(uid, groupId, data);
    },
    onMutate: async ({ groupId, data }) => {
      if (!uid) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: groupKeys.list(uid) });

      // Snapshot previous value
      const previousGroups = queryClient.getQueryData<Group[]>(
        groupKeys.list(uid)
      );

      // Optimistically update
      if (previousGroups) {
        queryClient.setQueryData<Group[]>(
          groupKeys.list(uid),
          previousGroups.map((group) =>
            group.id === groupId ? { ...group, ...data } : group
          )
        );
      }

      return { previousGroups };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousGroups && uid) {
        queryClient.setQueryData(groupKeys.list(uid), context.previousGroups);
      }
    },
    onSettled: () => {
      if (!uid) return;
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: groupKeys.list(uid) });
    },
  });
};

/**
 * Hook to delete a group
 */
export const useDeleteGroupMutation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const uid = user?.uid;

  return useMutation({
    mutationFn: (groupId: string) => {
      if (!uid) throw new Error("User not authenticated");
      return deleteGroup(uid, groupId);
    },
    onMutate: async (groupId) => {
      if (!uid) return;

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: groupKeys.list(uid) });

      // Snapshot previous value
      const previousGroups = queryClient.getQueryData<Group[]>(
        groupKeys.list(uid)
      );

      // Optimistically remove
      if (previousGroups) {
        queryClient.setQueryData<Group[]>(
          groupKeys.list(uid),
          previousGroups.filter((group) => group.id !== groupId)
        );
      }

      return { previousGroups };
    },
    onError: (_error, _groupId, context) => {
      // Rollback on error
      if (context?.previousGroups && uid) {
        queryClient.setQueryData(groupKeys.list(uid), context.previousGroups);
      }
    },
    onSettled: () => {
      if (!uid) return;
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: groupKeys.list(uid) });
    },
  });
};

