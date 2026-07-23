# Fokuna — Product Status (lebende Übersicht)

**Zweck:** Eine Seite, die den **gesamten** Weg zur fertigen App nach PRD §14 sichtbar hält.  
**Detail-Arbeit am aktuellen Modul:** [`aufgaben-status.md`](./aufgaben-status.md)  
**Quellen:** [`context/03_prd/FOKUNA_PRD.md`](../../context/03_prd/FOKUNA_PRD.md) · Figma `ltQMlboZomvr70Z4m0aLQj` · [`context/00_ui_ux/02_Views/`](../../context/00_ui_ux/02_Views/)

**Stand:** 2026-07-23  
**Aktueller Fokus:** Aufgaben **A3** fertig → als Nächstes **A4** (Zeitblöcke 05–12)  
**Nächster Fokus (nach Aufgaben-Kern):** Ziele-Übersicht / Onboarding **oder** Kalender-DnD-Gate (PO entscheidet)  
**Infra-Gate (nicht vergessen):** Neon-Cutover — siehe [Persistenz-Pfad](#persistenz--neon-pfad-prd--101--102)

---

## Legende

| Status | Bedeutung |
|--------|-----------|
| `Done` | Abgenommen / produktionsnah für den Slice |
| `In Progress` | Aktive Arbeit |
| `Partial` | Nutzbar, aber unter MVP-/PRD-Bar |
| `Scaffold` | Route/API/UI-Grundgerüst, nicht pixelfertig |
| `Not started` | Noch nicht begonnen |
| `Deferred` | Bewusst später / PO-Entscheidung offen |

---

## Produktkreislauf (PRD)

```text
Ziele setzen → Arbeit strukturieren → Zeit planen → fokussiert ausführen → reflektieren → Insights → System anpassen
```

---

## Phasen nach PRD §14 (ehrlicher Stand)

| Phase | PRD-Inhalt | Status | Bemerkung |
|-------|------------|--------|-----------|
| **0** Bootstrap / Repo | Monorepo, CI, Env | `Done` | pnpm-Workspace läuft |
| **1** Pattern Library | Tokens, Icons, UI, Katalog | `Done` | V1.1 abgenommen 2026-07-20 |
| **2** Shell / Auth / DB / API | Shell, Better Auth, Drizzle, Contracts | `Partial` | Schema+Driver da; lokal Memory; Neon-Cutover noch offen |
| **3** Operatives Zentrum | Aufgaben, Blocks, Kalender + DnD-Gate | `Partial` | Task Page V1 `Done`; Blocks/Kalender/DnD unter Bar |
| **4** Ziele / Fokus / Journal | Onboarding, Sessions, Templates | `Scaffold` | Routen + dünne Panels |
| **5** Insights / Integrationen / Billing / Admin | Metriken, Sync, Stripe, Admin | `Scaffold` | Platzhalter-Views |
| **6** Hardening / Launch | E2E, A11y, Perf, Security, Backup | `Not started` | Nach Modul-Feinheit |

> Der Cursor-Rollout-Plan markierte Phasen 2–6 als `completed`. Das meinte **Scaffold**, nicht Abnahme. **Diese Datei ist die Wahrheit.**

---

## Module (Produktkette)

| Modul | Route(s) | Views (PNG) | Status | Detail |
|-------|----------|-------------|--------|--------|
| Pattern Library | `/pattern-library` | — | `Done` | Lebend halten bei jeder UI-Änderung |
| App Shell / Auth | `/app/*`, Auth-Routen | — | `Partial` | Shell navigierbar; Demo-Auth stark genutzt |
| **Aufgaben** | `/app/aufgaben` | 01–04 | `Partial` | V1 + DnD + Sidebar-Taxonomie (A3); Rest in [aufgaben-status.md](./aufgaben-status.md) |
| **Zeitblöcke** | `/app/aufgaben/blocks` | 05–12 | `Scaffold` | Teil von Aufgaben-Slices A4 |
| **Fokus** | `/app/fokus` | 13–18 (unter Aufgaben) | `Scaffold` | Slice A6 |
| Kalender | `/app/kalender` | 01_Kalender | `Partial` | FullCalendar + Basis-CRUD; DnD-Gate offen |
| Ziele | `/app/ziele`, `/app/aufgaben/ziele` | 01–19 | `Scaffold` | Nach Aufgaben-Kern |
| Journal | `/app/journal` | 01–08 | `Scaffold` | |
| Insights | `/app/insights` | 01 | `Scaffold` | Metrikverträge vorher (PRD §17.9) |
| Einstellungen | `/app/einstellungen` | 01–06 | `Scaffold` | Billing/Notifications offen (PRD §17) |
| Admin | — | — | `Not started` | P1 laut PRD |

---

## Empfohlene Reihenfolge bis Release (grob)

1. **Jetzt:** Aufgaben fertigziehen (Zeitblöcke → Ziele-Tab → Fokus) — Detail in Aufgaben-Status. Lokal weiter **Memory** OK.
2. **Danach:** Ziele-Modul (Empty → Onboarding → Overview/Detail) *oder* Kalender-Feinschliff/DnD-Gate — PO-Wahl.
3. Journal (Templates + Check-in/out).
4. **Infra-Gate — Neon-Cutover** (spätestens hier, ideal früher wenn Auth/Billing angefasst werden): siehe unten.
5. Insights (erst Metrikverträge).
6. Settings echt (Kalender-OAuth, Stripe, Notifications) + offene PRD-§17-Punkte.
7. Phase 6 Hardening.

---

## Persistenz / Neon-Pfad (PRD §10.1 / §10.2)

**Absicht jetzt:** UI und API-Verträge bauen, ohne dass du einen Neon-Account brauchst.  
**Absicht später:** Ein Driver-Flip + fehlende Repositories — kein Domänen-Neubau.

| Schicht | Heute | Production-Ziel |
|---------|-------|-----------------|
| UI / Features | TanStack Query → `/api/v1/*` | unverändert |
| Contracts | Zod in `@fokuna/api-contracts` | unverändert |
| Domain | reine Logik in `@fokuna/domain` | unverändert |
| Schema | Drizzle PostgreSQL in `@fokuna/db` | dasselbe Schema auf Neon EU |
| Runtime lokal | `FOKUNA_DATA_DRIVER=memory` (In-Process Maps + Demo-Seed) | Dev optional weiter Memory |
| Runtime Prod | — | `neon` + `DATABASE_URL` |

**Bereits dual (Memory + Neon-Pfad):** Tasks, Profile/`ui_preferences`, Auth-Schiene (Better Auth nur unter `neon`).  
**Noch Memory-only (Cutover-Arbeit):** Taxonomy (Kategorien/Labels), Catalog (Goals/Blocks/Calendar/Focus/Journal/Integrationen).

### Guardrails während UI-Arbeit (damit nichts in die Tonne geht)

- Keine Persistenz nur in `localStorage` / Zustand für fachliche Daten.
- Neue Entities zuerst in `@fokuna/db` Schema + Contracts denken; Memory-Store nur als Adapter parallel.
- Services sprechen DTOs/Contracts — nicht UI-Typen.
- Schema-Erweiterungen schlank und account-fähig halten (wie `user_profile.ui_preferences`).

### Absprung / Cutover-Kriterien (PO-Trigger)

Spätestens **vor** echtem Login, Billing, Sync oder „Daten sollen überleben“:

1. Neon-Projekt EU + `DATABASE_URL` (Pooling-String).
2. Drizzle migrate/push; Migrationsordner versionieren.
3. Memory-only Services auf Repository/Drizzle umstellen (gleiche Contracts).
4. `FOKUNA_DATA_DRIVER=neon` lokal smoke-testen (Auth + Tasks + Taxonomy + ein Catalog-Slice).
5. Demo-Auth nur noch als Dev-Fallback; Prod = Better Auth auf Neon.

Memory-Daten werden **nicht** migriert — sie sind Dev-Attrappe. Nach Cutover startet Persistenz neu auf Neon.

---

## Offene PRD-§17-Punkte (nicht stillschweigend lösen)

Vor der betroffenen Phase mit PO klären: Delete/Archive/Restore, Kalender-P0-Views, Sync-Konflikte, Fokus-Sound/Hintergründe, Pricing/Trial, Notifications, Insights-Metriken, Sprache, MVP-Migration.

---

## Pflege-Regel

- Nach **jedem** abgeschlossenen Slice: Status hier und im Modul-Detail aktualisieren.
- Session-Ende: *fertig / offen / next* im Chat + eine Zeile „Aktueller Fokus“ oben anpassen.
- Commit nur auf explizite Anweisung.
