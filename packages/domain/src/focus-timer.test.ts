import { describe, expect, it } from "vitest";

import {
  canTransitionFocusStatus,
  elapsedFocusSeconds,
  remainingFocusSeconds,
} from "./focus-timer";

describe("focus timer", () => {
  it("computes elapsed time from timestamps", () => {
    const startedAt = new Date("2026-07-20T10:00:00.000Z").toISOString();
    const now = new Date("2026-07-20T10:05:00.000Z");

    expect(
      elapsedFocusSeconds(
        {
          startedAt,
          pausedAt: null,
          accumulatedPauseSeconds: 30,
          status: "running",
        },
        now,
      ),
    ).toBe(270);
  });

  it("uses pause timestamp while paused", () => {
    const startedAt = new Date("2026-07-20T10:00:00.000Z").toISOString();
    const pausedAt = new Date("2026-07-20T10:02:00.000Z").toISOString();
    const now = new Date("2026-07-20T10:30:00.000Z");

    expect(
      remainingFocusSeconds(
        {
          startedAt,
          pausedAt,
          accumulatedPauseSeconds: 0,
          status: "paused",
          plannedDurationSeconds: 300,
        },
        now,
      ),
    ).toBe(180);
  });

  it("allows only valid status transitions", () => {
    expect(canTransitionFocusStatus("running", "paused")).toBe(true);
    expect(canTransitionFocusStatus("completed", "running")).toBe(false);
  });
});
