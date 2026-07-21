"use client";

import type { TaskDto } from "@fokuna/api-contracts";
import { Button, PageHeader } from "@fokuna/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiSend } from "@/lib/api";
import styles from "./focus-view.module.css";

interface FocusSessionDto {
  id: string;
  status: "running" | "paused" | "completed" | "cancelled";
  remainingSeconds: number;
  elapsedSeconds: number;
  plannedDurationSeconds: number;
  isMinimized: boolean;
  taskId: string | null;
}

function formatSeconds(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function FocusView() {
  const queryClient = useQueryClient();

  const focusQuery = useQuery({
    queryKey: ["focus"],
    queryFn: () => apiGet<FocusSessionDto | null>("/api/v1/focus"),
    refetchInterval: (query) => (query.state.data?.status === "running" ? 1000 : 15_000),
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: () => apiGet<TaskDto[]>("/api/v1/tasks"),
  });

  const startMutation = useMutation({
    mutationFn: (taskId: string) =>
      apiSend<FocusSessionDto>("/api/v1/focus", "POST", {
        taskId,
        plannedDurationSeconds: 25 * 60,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["focus"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: {
      sessionId: string;
      status?: FocusSessionDto["status"];
      isMinimized?: boolean;
    }) => apiSend<FocusSessionDto>("/api/v1/focus", "PATCH", payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["focus"] });
    },
  });

  const session = focusQuery.data;
  const firstTask = (tasksQuery.data ?? []).find((task) => !task.isCompleted);

  return (
    <div className={styles.page} data-status={session?.status ?? "idle"}>
      <PageHeader title="Fokusmodus" />
      <div className={styles.stage}>
        <p className={styles.label}>
          {session?.status === "paused"
            ? "Pause"
            : session
              ? "Fokus läuft"
              : "Bereit für den nächsten Block"}
        </p>
        <div className={styles.timer} aria-live="polite">
          {session ? formatSeconds(Math.max(0, session.remainingSeconds)) : "25:00"}
        </div>
        <div className={styles.actions}>
          {!session && firstTask ? (
            <Button onClick={() => startMutation.mutate(firstTask.id)} size="lg" type="button">
              Fokus mit „{firstTask.title}“ starten
            </Button>
          ) : null}
          {session?.status === "running" ? (
            <Button
              onClick={() => updateMutation.mutate({ sessionId: session.id, status: "paused" })}
              size="lg"
              type="button"
            >
              Pause
            </Button>
          ) : null}
          {session?.status === "paused" ? (
            <Button
              onClick={() => updateMutation.mutate({ sessionId: session.id, status: "running" })}
              size="lg"
              type="button"
            >
              Fortsetzen
            </Button>
          ) : null}
          {session ? (
            <>
              <Button
                buttonType="outline"
                intent="secondary"
                onClick={() =>
                  updateMutation.mutate({
                    sessionId: session.id,
                    isMinimized: !session.isMinimized,
                  })
                }
                size="lg"
                type="button"
              >
                {session.isMinimized ? "Maximieren" : "Minimieren"}
              </Button>
              <Button
                buttonType="outline"
                intent="tertiary"
                onClick={() =>
                  updateMutation.mutate({ sessionId: session.id, status: "completed" })
                }
                size="lg"
                type="button"
              >
                Beenden
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
