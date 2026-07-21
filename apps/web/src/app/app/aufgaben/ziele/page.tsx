import { PageHeader } from "@fokuna/ui";

import { AppShell } from "@/components/app-shell";
import { GoalsPanel } from "@/features/goals/goals-panel";

export const dynamic = "force-dynamic";

export default function AufgabenZielePage() {
  return (
    <AppShell activeId="tasks" secondaryActiveId="goals-tab">
      <PageHeader subtitle="Zielbezogene Aufgaben und Meilensteine" title="Aufgaben · Ziele" />
      <GoalsPanel compact />
    </AppShell>
  );
}
