import { AppShell } from "@/components/app-shell";
import { TasksView } from "@/features/tasks/tasks-view";

export const dynamic = "force-dynamic";

export default function AufgabenPage() {
  return (
    <AppShell activeId="tasks" secondaryActiveId="all">
      <TasksView />
    </AppShell>
  );
}
