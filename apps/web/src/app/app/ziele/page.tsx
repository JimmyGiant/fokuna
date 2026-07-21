import { PageHeader } from "@fokuna/ui";

import { AppShell } from "@/components/app-shell";
import { GoalsPanel } from "@/features/goals/goals-panel";

export const dynamic = "force-dynamic";

export default function ZielePage() {
  return (
    <AppShell activeId="goals">
      <PageHeader subtitle="Vom Vorhaben zur konkreten Umsetzung" title="Ziele" />
      <GoalsPanel />
    </AppShell>
  );
}
