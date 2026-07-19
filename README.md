# Fokuna

Produktionscode für die Fokuna SaaS-Anwendung und ihre gemeinsame Pattern Library.

## Workspace

- `apps/web`: Next.js-Anwendung und interne Pattern-Library-Route
- `packages/tokens`: Figma-basierte Design-Tokens und CSS-Theme
- `packages/icons`: kuratierte, produktionsfertige Icon-Bibliothek
- `packages/ui`: wiederverwendbare React-Komponenten
- `context`: freigegebene Design- und Produktübergabe

## Entwicklung

Voraussetzungen: Node.js `>=20.11` und Corepack. Die im Repository fixierte pnpm-Version ist
`9.15.4`; globale pnpm-Installationen sollen nicht verwendet werden.

```bash
corepack pnpm install
corepack pnpm dev
```

Die Pattern Library ist anschließend unter
[http://localhost:3000/pattern-library](http://localhost:3000/pattern-library) erreichbar.

## Quellen und Generierung

- `context/` ist die freigegebene Design-, UX- und Produktübergabe.
- `context/00_ui_ux/03_Tokens/` bleibt die Eingabe für die Token-Normalisierung.
- `packages/tokens/src/` enthält die eingecheckten Produktionsartefakte für CSS, Tailwind und
  TypeScript. Neu generieren: `corepack pnpm --filter @fokuna/tokens build`.
- `src/icons/` enthält die kuratierten SVG-Quellen; `packages/icons` erzeugt daraus die typisierte
  Registry. Neu generieren: `corepack pnpm --filter @fokuna/icons build`.
- Produktkomponenten verwenden semantische Tokens und typisierte Icons, keine kopierten
  Figma-Einzelwerte oder freien SVGs.

## Pattern Library

Die Abnahmeroute zeigt Foundations und alle zentralen Übergabe-Patterns: Buttons, Form Controls,
Date Picker, Auswahl- und Navigationselemente, Overlays, Kalender-Drag-Zustände, Aufgabenlisten,
Meilensteine, Task-Modals, Page Header, Sidebar und UI Shell. Neue Komponenten werden zuerst in
`packages/ui` ergänzt, mit Tests abgesichert und anschließend im Katalog sichtbar gemacht.

Die Pattern Library ist der Abschluss von Phase 1. Produktviews, Backend-Logik, Persistenz und das
fachliche Datenbankschema gehören bewusst in die folgenden Phasen des PRD.

## Qualitätsprüfung

```bash
corepack pnpm check
```

Der Befehl prüft Format, Lint/Accessibility, TypeScript, Komponententests und den
Next.js-Produktionsbuild. CI führt denselben Vertrag aus.
