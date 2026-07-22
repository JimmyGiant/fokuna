# Fokuna — Product Status (lebende Übersicht)

**Zweck:** Eine Seite, die den **gesamten** Weg zur fertigen App nach PRD §14 sichtbar hält.  
**Detail-Arbeit am aktuellen Modul:** [`aufgaben-status.md`](./aufgaben-status.md)  
**Quellen:** [`context/03_prd/FOKUNA_PRD.md`](../../context/03_prd/FOKUNA_PRD.md) · Figma `ltQMlboZomvr70Z4m0aLQj` · [`context/00_ui_ux/02_Views/`](../../context/00_ui_ux/02_Views/)

**Stand:** 2026-07-21  
**Aktueller Fokus:** Aufgaben **A2 DnD** fertig → als Nächstes **A3** (Sidebar + Kategorien)  
**Nächster Fokus (nach Aufgaben-Kern):** Ziele-Übersicht / Onboarding **oder** Kalender-DnD-Gate (PO entscheidet)

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
| **2** Shell / Auth / DB / API | Shell, Better Auth, Drizzle, Contracts | `Partial` | Fundament da; Catalog Goals/Blocks oft Memory-only |
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
| **Aufgaben** | `/app/aufgaben` | 01–04 | `Partial` | V1 + DnD Foundation (A1); Rest in [aufgaben-status.md](./aufgaben-status.md) |
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

1. **Jetzt:** Aufgaben fertigziehen (DnD → Sidebar/Kategorien → Zeitblöcke → Ziele-Tab → Fokus) — Detail in Aufgaben-Status.
2. **Danach:** Ziele-Modul (Empty → Onboarding → Overview/Detail) *oder* Kalender-Feinschliff/DnD-Gate — PO-Wahl.
3. Journal (Templates + Check-in/out).
4. Insights (erst Metrikverträge).
5. Settings echt (Kalender-OAuth, Stripe, Notifications) + offene PRD-§17-Punkte.
6. Phase 6 Hardening.

---

## Offene PRD-§17-Punkte (nicht stillschweigend lösen)

Vor der betroffenen Phase mit PO klären: Delete/Archive/Restore, Kalender-P0-Views, Sync-Konflikte, Fokus-Sound/Hintergründe, Pricing/Trial, Notifications, Insights-Metriken, Sprache, MVP-Migration.

---

## Pflege-Regel

- Nach **jedem** abgeschlossenen Slice: Status hier und im Modul-Detail aktualisieren.
- Session-Ende: *fertig / offen / next* im Chat + eine Zeile „Aktueller Fokus“ oben anpassen.
- Commit nur auf explizite Anweisung.
