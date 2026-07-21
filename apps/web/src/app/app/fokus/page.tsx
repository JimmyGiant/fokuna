import { AppShell } from "@/components/app-shell";
import { FocusView } from "@/features/focus/focus-view";

export const dynamic = "force-dynamic";

export default function FokusPage() {
  return (
    <AppShell activeId="tasks">
      <FocusView />
    </AppShell>
  );
}
