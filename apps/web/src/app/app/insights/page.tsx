import { AppShell } from "@/components/app-shell";
import { InsightsView } from "@/features/insights/insights-view";

export const dynamic = "force-dynamic";

export default function InsightsPage() {
  return (
    <AppShell activeId="insights">
      <InsightsView />
    </AppShell>
  );
}
