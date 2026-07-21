import { describe, expect, it } from "vitest";

import { createTaskInputSchema } from "./tasks";

describe("createTaskInputSchema", () => {
  it("accepts a minimal valid task", () => {
    const parsed = createTaskInputSchema.parse({ title: "Neue Aufgabe" });
    expect(parsed.groupKey).toBe("inbox");
    expect(parsed.priority).toBe("none");
  });

  it("rejects an empty title", () => {
    expect(() => createTaskInputSchema.parse({ title: "   " })).toThrow();
  });
});
