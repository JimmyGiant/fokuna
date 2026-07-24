"use client";

import type { UserProfileDto } from "@fokuna/api-contracts";
import {
  DEFAULT_TASKS_LIST_VIEW_PREFERENCES,
  mergeTasksListViewPreferences,
  normalizeTasksListViewsMap,
  resolveTasksListViewPreferences,
  tasksListViewCapabilities,
  tasksListViewHasDeviation,
  tasksListViewKey,
  type TasksListViewIdentity,
  type TasksListViewPreferencesPatch,
} from "@fokuna/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";

import { apiGet, apiSend } from "@/lib/api";

type PrefsPatch = TasksListViewPreferencesPatch;

const DEBOUNCE_MS = 350;

export function useTasksListViewPreferences(identity: TasksListViewIdentity) {
  const queryClient = useQueryClient();
  const viewKey = useMemo(() => tasksListViewKey(identity), [
    identity.categoryId,
    identity.filter,
    identity.labelId,
    identity.priority,
  ]);
  const capabilities = useMemo(() => tasksListViewCapabilities(viewKey), [viewKey]);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<UserProfileDto>("/api/v1/profile"),
  });

  const prefs = useMemo(
    () => resolveTasksListViewPreferences(profileQuery.data?.uiPreferences, viewKey),
    [profileQuery.data?.uiPreferences, viewKey],
  );

  const isActive = tasksListViewHasDeviation(prefs);
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestPayloadRef = useRef<{ viewKey: string; patch: PrefsPatch } | null>(null);

  const updateMutation = useMutation({
    mutationFn: (payload: { viewKey: string; patch: PrefsPatch | null }) =>
      apiSend<UserProfileDto>("/api/v1/profile", "PATCH", {
        tasksListViews: {
          [payload.viewKey]: payload.patch,
        },
      }),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });
      const previous = queryClient.getQueryData<UserProfileDto>(["profile"]);
      if (previous) {
        const map = normalizeTasksListViewsMap(previous.uiPreferences?.tasksListViews);
        if (payload.patch === null) {
          delete map[payload.viewKey];
        } else {
          const current = resolveTasksListViewPreferences(previous.uiPreferences, payload.viewKey);
          const next = mergeTasksListViewPreferences(current, payload.patch);
          if (
            next.showCompleted === DEFAULT_TASKS_LIST_VIEW_PREFERENCES.showCompleted &&
            next.grouping === DEFAULT_TASKS_LIST_VIEW_PREFERENCES.grouping &&
            next.sorting === DEFAULT_TASKS_LIST_VIEW_PREFERENCES.sorting &&
            next.sortDirection === DEFAULT_TASKS_LIST_VIEW_PREFERENCES.sortDirection &&
            next.filters.date === DEFAULT_TASKS_LIST_VIEW_PREFERENCES.filters.date &&
            next.filters.priorities.length === 0 &&
            next.filters.labelIds.length === 0
          ) {
            delete map[payload.viewKey];
          } else {
            map[payload.viewKey] = next;
          }
        }
        queryClient.setQueryData<UserProfileDto>(["profile"], {
          ...previous,
          uiPreferences: {
            ...previous.uiPreferences,
            tasksListViews: map,
          },
        });
      }
      return { previous };
    },
    onError: (_error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["profile"], context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  function flush() {
    const pending = latestPayloadRef.current;
    if (!pending) return;
    latestPayloadRef.current = null;
    updateMutation.mutate(pending);
  }

  function schedulePatch(patch: PrefsPatch) {
    latestPayloadRef.current = { viewKey, patch };
    if (pendingRef.current) clearTimeout(pendingRef.current);
    pendingRef.current = setTimeout(() => {
      pendingRef.current = null;
      flush();
    }, DEBOUNCE_MS);
  }

  useEffect(() => {
    return () => {
      if (pendingRef.current) {
        clearTimeout(pendingRef.current);
        pendingRef.current = null;
        flush();
      }
    };
    // Flush only on unmount / viewKey change handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional unmount flush
  }, []);

  useEffect(() => {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current);
      pendingRef.current = null;
      flush();
    }
    // When the list identity changes, flush the previous view's pending write.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey]);

  function setPrefs(patch: PrefsPatch) {
    // Optimistic apply immediately via onMutate path — but debounced network.
    // Apply optimistic cache now so UI stays snappy while debounce waits.
    const previous = queryClient.getQueryData<UserProfileDto>(["profile"]);
    if (previous) {
      const map = normalizeTasksListViewsMap(previous.uiPreferences?.tasksListViews);
      const current = resolveTasksListViewPreferences(previous.uiPreferences, viewKey);
      const next = mergeTasksListViewPreferences(current, patch);
      map[viewKey] = next;
      queryClient.setQueryData<UserProfileDto>(["profile"], {
        ...previous,
        uiPreferences: {
          ...previous.uiPreferences,
          tasksListViews: normalizeTasksListViewsMap(map),
        },
      });
    }
    schedulePatch(patch);
  }

  function resetPrefs() {
    if (pendingRef.current) {
      clearTimeout(pendingRef.current);
      pendingRef.current = null;
    }
    latestPayloadRef.current = null;
    updateMutation.mutate({ viewKey, patch: null });
  }

  return {
    viewKey,
    prefs,
    capabilities,
    isActive,
    isLoading: profileQuery.isLoading,
    setPrefs,
    resetPrefs,
  };
}
