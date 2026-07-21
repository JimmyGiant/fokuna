import type { FocusSessionEntity, FocusSessionStatus } from "./types";

export function elapsedFocusSeconds(
  session: Pick<
    FocusSessionEntity,
    "startedAt" | "pausedAt" | "accumulatedPauseSeconds" | "status"
  >,
  now = new Date(),
): number {
  const started = new Date(session.startedAt).getTime();
  const end =
    session.status === "paused" && session.pausedAt
      ? new Date(session.pausedAt).getTime()
      : now.getTime();

  const raw = Math.max(0, Math.floor((end - started) / 1000) - session.accumulatedPauseSeconds);
  return raw;
}

export function remainingFocusSeconds(
  session: Pick<
    FocusSessionEntity,
    "startedAt" | "pausedAt" | "accumulatedPauseSeconds" | "status" | "plannedDurationSeconds"
  >,
  now = new Date(),
): number {
  return Math.max(0, session.plannedDurationSeconds - elapsedFocusSeconds(session, now));
}

export function canTransitionFocusStatus(
  from: FocusSessionStatus,
  to: FocusSessionStatus,
): boolean {
  const allowed: Record<FocusSessionStatus, FocusSessionStatus[]> = {
    running: ["paused", "completed", "cancelled"],
    paused: ["running", "completed", "cancelled"],
    completed: [],
    cancelled: [],
  };

  return allowed[from].includes(to);
}
