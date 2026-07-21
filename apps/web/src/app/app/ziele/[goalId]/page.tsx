import { Button, PageHeader } from "@fokuna/ui";

import { AppShell } from "@/components/app-shell";

export const dynamic = "force-dynamic";

export default async function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const { goalId } = await params;

  return (
    <AppShell activeId="goals">
      <PageHeader
        actions={
          <Button size="md" type="button">
            Ziel bearbeiten
          </Button>
        }
        subtitle={`ID ${goalId}`}
        title="Ziel Detail"
      />
      <p>
        Overview, Timeline und Edit-Overlays folgen den Figma-Views unter `04_Ziele`. Die
        Onboarding-Zwischenstände werden über `goal.onboardingStep` persistiert.
      </p>
    </AppShell>
  );
}
