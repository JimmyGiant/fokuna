import { AppShell } from "@/components/app-shell";
import { CalendarView } from "@/features/calendar/calendar-view";

export const dynamic = "force-dynamic";

export default function KalenderPage() {
  return (
    <AppShell activeId="calendar">
      <CalendarView />
    </AppShell>
  );
}
