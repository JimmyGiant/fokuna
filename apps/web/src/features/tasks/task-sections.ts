import type { TaskSectionDto, TaskSectionMembershipDto } from "@fokuna/api-contracts";

export {
  TASK_SECTION_ROOT_KEY,
  applySectionGroupKeys,
  countTasksDeletedWithSection,
  membershipSectionIdForTask,
} from "@fokuna/domain";

export type TaskSectionsPayload = {
  sections: TaskSectionDto[];
  memberships: TaskSectionMembershipDto[];
};

export function sectionQueryKey(scope: { categoryId?: string | null; labelId?: string | null }) {
  return ["task-sections", scope.categoryId ?? null, scope.labelId ?? null] as const;
}

export function sectionListPath(scope: { categoryId?: string | null; labelId?: string | null }) {
  const params = new URLSearchParams();
  if (scope.categoryId) params.set("categoryId", scope.categoryId);
  if (scope.labelId) params.set("labelId", scope.labelId);
  return `/api/v1/task-sections?${params.toString()}`;
}
