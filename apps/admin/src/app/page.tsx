import { Callout, PageHeader } from "@fokuna/ui";

export default function AdminHomePage() {
  return (
    <main style={{ padding: 32, display: "grid", gap: 24, maxWidth: 720 }}>
      <PageHeader
        subtitle="Nutzt dieselben Auth-, Service- und Auditregeln wie die Hauptapp."
        title="Fokuna Admin"
      />
      <Callout title="Phase 5 Skelett" tone="info">
        Nutzer-, Rollen- und Sessionverwaltung werden hier an die gemeinsamen Services angebunden.
        Kein separates Auth-System.
      </Callout>
    </main>
  );
}
