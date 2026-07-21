"use client";

import type { BlockDto } from "@fokuna/api-contracts";
import type { IconName } from "@fokuna/icons";
import { BlockCard, Button, PageHeader, TabBar } from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { apiGet, apiSend } from "@/lib/api";
import styles from "./blocks-view.module.css";

type BlockTab = "all" | "own" | "goals" | "templates";

export function BlocksView() {
  const [tab, setTab] = useState<BlockTab>("all");
  const queryClient = useQueryClient();
  const blocksQuery = useQuery({
    queryKey: ["blocks"],
    queryFn: () => apiGet<BlockDto[]>("/api/v1/blocks"),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiSend<BlockDto>("/api/v1/blocks", "POST", {
        title: "Neuer Block",
        durationMinutes: 25,
        icon: "focus-target",
        colorToken: "category.teal",
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["blocks"] });
    },
  });

  const filtered = useMemo(() => {
    const blocks = blocksQuery.data ?? [];
    if (tab === "templates") {
      return blocks.filter((block) => block.isTemplate || block.isPreset);
    }
    if (tab === "goals") {
      return blocks.filter((block) => Boolean(block.goalId));
    }
    if (tab === "own") {
      return blocks.filter((block) => !block.isPreset && !block.isTemplate);
    }
    return blocks;
  }, [blocksQuery.data, tab]);

  return (
    <div className={styles.page}>
      <PageHeader
        actions={
          <Button onClick={() => createMutation.mutate()} size="md" type="button">
            Block erstellen
          </Button>
        }
        title="Blocks"
      />
      <TabBar
        items={[
          { value: "all", label: "Alle" },
          { value: "own", label: "Eigene" },
          { value: "goals", label: "Ziele" },
          { value: "templates", label: "Vorlagen" },
        ]}
        onValueChange={(value) => setTab(value as BlockTab)}
        value={tab}
      />
      <div className={styles.grid}>
        {filtered.map((block) => (
          <BlockCard
            description={block.description ?? undefined}
            durationLabel={`${block.durationMinutes} min`}
            icon={(block.icon as IconName) || "focus-target"}
            key={block.id}
            title={block.title}
            tone="teal"
          />
        ))}
      </div>
    </div>
  );
}
