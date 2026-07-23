import { Suspense } from "react";

import { AufgabenShell } from "@/features/tasks/aufgaben-shell";
import { TasksView } from "@/features/tasks/tasks-view";

export const dynamic = "force-dynamic";

export default async function AufgabenPage({
  searchParams,
}: {
  searchParams: Promise<{
    filter?: string;
    task?: string;
    category?: string;
    label?: string;
    priority?: string;
  }>;
}) {
  const params = await searchParams;
  const filter = params.filter ?? "all";
  let secondaryActiveId = "all";
  if (filter === "favorites" || filter === "today" || filter === "inbox") {
    secondaryActiveId = filter;
  } else if (params.category) {
    secondaryActiveId = `category:${params.category}`;
  } else if (params.label) {
    secondaryActiveId = `label:${params.label}`;
  } else if (params.priority) {
    secondaryActiveId = `priority:${params.priority}`;
  }

  return (
    <AufgabenShell secondaryActiveId={secondaryActiveId}>
      <Suspense fallback={null}>
        <TasksView />
      </Suspense>
    </AufgabenShell>
  );
}
