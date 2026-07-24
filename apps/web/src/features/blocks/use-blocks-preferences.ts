"use client";

import type { UserProfileDto } from "@fokuna/api-contracts";
import {
  normalizeBlocksPreferences,
  resolveBlocksPreferences,
  type BlocksPreferences,
} from "@fokuna/domain";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

import { apiGet, apiSend } from "@/lib/api";

import { MAX_BLOCK_RAIL } from "./block-utils";

export function useBlocksPreferences() {
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: () => apiGet<UserProfileDto>("/api/v1/profile"),
  });

  const prefs = useMemo(
    () => resolveBlocksPreferences(profileQuery.data?.uiPreferences),
    [profileQuery.data?.uiPreferences],
  );

  const updateMutation = useMutation({
    mutationFn: (patch: Partial<BlocksPreferences>) =>
      apiSend<UserProfileDto>("/api/v1/profile", "PATCH", { blocks: patch }),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: ["profile"] });
      const previous = queryClient.getQueryData<UserProfileDto>(["profile"]);
      if (previous) {
        const nextBlocks = normalizeBlocksPreferences({
          ...resolveBlocksPreferences(previous.uiPreferences),
          ...patch,
        });
        queryClient.setQueryData<UserProfileDto>(["profile"], {
          ...previous,
          uiPreferences: {
            ...previous.uiPreferences,
            blocks: nextBlocks,
          },
        });
      }
      return { previous };
    },
    onError: (_error, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["profile"], context.previous);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  const setRailIds = useCallback(
    (railIds: string[]) => {
      updateMutation.mutate({ railIds: railIds.slice(0, MAX_BLOCK_RAIL) });
    },
    [updateMutation],
  );

  const addToRail = useCallback(
    (blockId: string) => {
      if (prefs.railIds.includes(blockId)) return false;
      if (prefs.railIds.length >= MAX_BLOCK_RAIL) return false;
      setRailIds([...prefs.railIds, blockId]);
      return true;
    },
    [prefs.railIds, setRailIds],
  );

  const dismissHubHint = useCallback(() => {
    if (!prefs.hubHintSeen) {
      updateMutation.mutate({ hubHintSeen: true });
    }
  }, [prefs.hubHintSeen, updateMutation]);

  return {
    prefs,
    isLoading: profileQuery.isLoading,
    setRailIds,
    addToRail,
    dismissHubHint,
    railHasSlot: prefs.railIds.length < MAX_BLOCK_RAIL,
  };
}
