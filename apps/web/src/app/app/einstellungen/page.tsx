import { AppShell } from "@/components/app-shell";
import { SettingsView } from "@/features/settings/settings-view";

export const dynamic = "force-dynamic";

export default function EinstellungenPage() {
  return (
    <AppShell activeId="settings">
      <SettingsView />
    </AppShell>
  );
}
