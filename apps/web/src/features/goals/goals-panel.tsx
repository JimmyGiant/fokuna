"use client";

import type { GoalDto } from "@fokuna/api-contracts";
import { Button, GoalCard, InputGroup } from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { apiGet, apiSend } from "@/lib/api";
import styles from "./goals-panel.module.css";

export function GoalsPanel({ compact = false }: { compact?: boolean }) {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();
  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: () => apiGet<GoalDto[]>("/api/v1/goals"),
  });

  const createMutation = useMutation({
    mutationFn: (nextTitle: string) =>
      apiSend<GoalDto>("/api/v1/goals", "POST", {
        title: nextTitle,
        onboardingStep: "zielsetzung_1",
      }),
    onSuccess: async () => {
      setTitle("");
      await queryClient.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const goals = goalsQuery.data ?? [];

  return (
    <div className={styles.panel} data-compact={compact || undefined}>
      {!compact ? (
        <form
          className={styles.create}
          onSubmit={(event) => {
            event.preventDefault();
            if (title.trim()) {
              createMutation.mutate(title.trim());
            }
          }}
        >
          <InputGroup
            controlSize="lg"
            label="Neues Ziel"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Was möchtest du erreichen?"
            value={title}
          />
          <Button size="lg" type="submit">
            Onboarding starten
          </Button>
        </form>
      ) : null}

      {goals.length === 0 ? (
        <div className={styles.empty}>
          <h2>Noch keine Ziele</h2>
          <p>Lege dein erstes Ziel an und übersetze es in Meilensteine und Arbeit.</p>
          <Button onClick={() => createMutation.mutate("Mein erstes Ziel")} size="md" type="button">
            Erstes Ziel erstellen
          </Button>
        </div>
      ) : (
        <div className={styles.grid}>
          {goals.map((goal) => (
            <GoalCard
              href={`/app/ziele/${goal.id}`}
              key={goal.id}
              progress={goal.status === "completed" ? 100 : 24}
              title={goal.title}
            />
          ))}
        </div>
      )}
    </div>
  );
}
