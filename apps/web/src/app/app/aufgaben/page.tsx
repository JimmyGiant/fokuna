import { Suspense } from "react";

import { AppShell } from "@/components/app-shell";
import { TasksView } from "@/features/tasks/tasks-view";

export const dynamic = "force-dynamic";

export default async function AufgabenPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; task?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter ?? "all";
  const secondaryActiveId =
    filter === "favorites" || filter === "today" || filter === "inbox" ? filter : "all";

  return (
    <AppShell activeId="tasks" secondaryActiveId={secondaryActiveId}>
      <Suspense fallback={<p>Aufgaben werden geladen…</p>}>
        <TasksView />
      </Suspense>
    </AppShell>
  );
}
