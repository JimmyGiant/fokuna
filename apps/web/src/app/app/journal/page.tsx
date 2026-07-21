import { AppShell } from "@/components/app-shell";
import { JournalView } from "@/features/journal/journal-view";

export const dynamic = "force-dynamic";

export default function JournalPage() {
  return (
    <AppShell activeId="journal">
      <JournalView />
    </AppShell>
  );
}
