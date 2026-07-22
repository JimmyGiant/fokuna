import { describe, expect, it } from "vitest";

import { toIsoDateString, todayIsoDateString } from "./dates";

describe("toIsoDateString", () => {
  it("formats the local calendar day as YYYY-MM-DD", () => {
    const date = new Date(2026, 6, 23, 0, 0, 0, 0);
    expect(toIsoDateString(date)).toBe("2026-07-23");
  });

  it("does not follow UTC day rollover from Date#toISOString", () => {
    // Early local morning can already be the previous calendar day in UTC.
    const earlyLocal = new Date(2026, 6, 23, 0, 30, 0, 0);
    const utcDay = earlyLocal.toISOString().slice(0, 10);
    const localDay = toIsoDateString(earlyLocal);
    expect(localDay).toBe("2026-07-23");
    if (utcDay !== localDay) {
      expect(utcDay).toBe("2026-07-22");
    }
  });
});

describe("todayIsoDateString", () => {
  it("matches toIsoDateString for now", () => {
    expect(todayIsoDateString()).toBe(toIsoDateString(new Date()));
  });
});
