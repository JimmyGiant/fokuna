# ADR 0001: Frontend Foundation

## Status

Accepted

## Context

Die erste Produktionsphase überführt das bestehende Figma-System in eine belastbare technische
Foundation. Nach der Freigabe der Pattern Library übernimmt ein weiterer Agent den Produktausbau.

## Decision

- Das Repository nutzt einen schlanken pnpm-Workspace ohne zusätzliche Monorepo-Orchestrierung.
- Tokens, Icons und UI-Komponenten sind eigenständige Pakete mit stabilen öffentlichen Exporten.
- Die Pattern Library wird unter `/pattern-library` als interne Prüfoberfläche bereitgestellt.
- Komponentenwerte stammen aus semantischen Tokens; Figma-Einzelwerte werden nicht in Komponenten
  dupliziert.
- Komponentenverträge, Zustände und Abweichungen werden im Repository dokumentiert und getestet.

## Consequences

Die Produkt-App kann Komponenten direkt wiederverwenden. Der nachfolgende Agent erhält klar
abgegrenzte Module, eine visuelle Referenzroute und nachvollziehbare Qualitätsregeln.
