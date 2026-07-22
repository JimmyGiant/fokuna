import { describe, expect, it } from "vitest";

import { reorderIdsInputSchema } from "./common";

describe("reorderIdsInputSchema", () => {
  it("accepts a non-empty ordered id list", () => {
    expect(reorderIdsInputSchema.parse({ orderedIds: ["a", "b", "c"] })).toEqual({
      orderedIds: ["a", "b", "c"],
    });
  });

  it("rejects an empty list", () => {
    expect(() => reorderIdsInputSchema.parse({ orderedIds: [] })).toThrow();
  });

  it("rejects missing orderedIds", () => {
    expect(() => reorderIdsInputSchema.parse({})).toThrow();
  });
});
