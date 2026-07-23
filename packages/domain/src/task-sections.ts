import type { TaskEntity } from "./types";

export const TASK_SECTION_ROOT_KEY = "__root__";

export type SectionMembershipRef = {
  taskId: string;
  sectionId: string;
};

export type SectionRef = {
  id: string;
};

export function membershipSectionIdForTask(
  taskId: string,
  scopeSectionIds: Set<string>,
  memberships: SectionMembershipRef[],
): string | null {
  const match = memberships.find(
    (membership) => membership.taskId === taskId && scopeSectionIds.has(membership.sectionId),
  );
  return match?.sectionId ?? null;
}

/** Overlay list-scope section membership onto groupKey for DnD/tree (does not persist). */
export function applySectionGroupKeys<T extends Pick<TaskEntity, "id" | "parentTaskId" | "groupKey">>(
  tasks: T[],
  sections: SectionRef[],
  memberships: SectionMembershipRef[],
): T[] {
  if (sections.length === 0 && memberships.length === 0) {
    return tasks.map((task) =>
      task.parentTaskId ? task : { ...task, groupKey: TASK_SECTION_ROOT_KEY },
    );
  }

  const scopeSectionIds = new Set(sections.map((section) => section.id));
  const byId = new Map(tasks.map((task) => [task.id, task]));

  function rootId(taskId: string): string {
    let current = byId.get(taskId);
    while (current?.parentTaskId) {
      const parent = byId.get(current.parentTaskId);
      if (!parent) break;
      current = parent;
    }
    return current?.id ?? taskId;
  }

  return tasks.map((task) => {
    const root = rootId(task.id);
    const sectionId = membershipSectionIdForTask(root, scopeSectionIds, memberships);
    return {
      ...task,
      groupKey: sectionId ?? TASK_SECTION_ROOT_KEY,
    };
  });
}

export function countTasksDeletedWithSection<
  T extends Pick<TaskEntity, "id" | "parentTaskId">,
>(sectionId: string, tasks: T[], memberships: SectionMembershipRef[]): number {
  const roots = memberships
    .filter((membership) => membership.sectionId === sectionId)
    .map((membership) => membership.taskId);
  if (roots.length === 0) return 0;

  const childrenByParent = new Map<string, string[]>();
  for (const task of tasks) {
    if (!task.parentTaskId) continue;
    const list = childrenByParent.get(task.parentTaskId) ?? [];
    list.push(task.id);
    childrenByParent.set(task.parentTaskId, list);
  }

  const ids = new Set<string>();
  const stack = [...roots];
  while (stack.length > 0) {
    const id = stack.pop()!;
    if (ids.has(id)) continue;
    ids.add(id);
    const children = childrenByParent.get(id);
    if (children) stack.push(...children);
  }
  return ids.size;
}
