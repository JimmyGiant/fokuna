import { AppShell } from "@/components/app-shell";
import { BlocksView } from "@/features/blocks/blocks-view";

export const dynamic = "force-dynamic";

export default function BlocksPage() {
  return (
    <AppShell activeId="tasks" secondaryActiveId="blocks">
      <BlocksView />
    </AppShell>
  );
}
