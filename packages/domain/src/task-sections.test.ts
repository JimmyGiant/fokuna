import { describe, expect, it } from "vitest";

import {
  TASK_SECTION_ROOT_KEY,
  applySectionGroupKeys,
  countTasksDeletedWithSection,
} from "./task-sections";

describe("task sections", () => {
  const sections = [{ id: "sec-a" }];
  const tasks = [
    { id: "t1", parentTaskId: null, groupKey: "inbox" },
    { id: "t2", parentTaskId: "t1", groupKey: "inbox" },
    { id: "t3", parentTaskId: null, groupKey: "inbox" },
  ];

  it("maps membership onto virtual group keys for roots and descendants", () => {
    const memberships = [{ taskId: "t1", sectionId: "sec-a" }];
    const scoped = applySectionGroupKeys(tasks, sections, memberships);
    expect(scoped.find((task) => task.id === "t1")?.groupKey).toBe("sec-a");
    expect(scoped.find((task) => task.id === "t2")?.groupKey).toBe("sec-a");
    expect(scoped.find((task) => task.id === "t3")?.groupKey).toBe(TASK_SECTION_ROOT_KEY);
  });

  it("counts subtree tasks deleted with a section", () => {
    const memberships = [{ taskId: "t1", sectionId: "sec-a" }];
    expect(countTasksDeletedWithSection("sec-a", tasks, memberships)).toBe(2);
    expect(countTasksDeletedWithSection("sec-a", tasks, [])).toBe(0);
  });
});
