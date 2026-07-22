# Aufgaben — Modul-Status (Detail)

**Parent:** [`product-status.md`](./product-status.md) (Gesamt-App nach PRD)  
**Plan:** Cursor-Plan „Aufgaben Vertiefung“ (Slices A0–A6)  
**Stand:** 2026-07-22

## Loop (immer aktuell halten)

| | |
|--|--|
| **Aktueller Slice** | A2 DnD — SortableTree-Projection (kein Live-Reparent) |
| **Nächster Slice** | A3 Sidebar + Kategorien |
| **Zuletzt fertig** | Todoist-Nesting: vertikal = Sibling; rechts = Subtask; links = Outdent |
| **Blocker / Fragen** | PO: Unter-einander vs. Einrücken nach rechts smoke-testen |

---

## Legende

`Done` · `In Progress` · `Partial` · `Scaffold` · `Not started` · `Deferred`

---

## Views (02_Aufgaben)

| # | View | Status | Hinweis |
|---|------|--------|---------|
| 01 | Alle Aufgaben | `Partial` | V1 + A1 Listen-DnD Foundation; Cross-Group/Nested offen |
| 02 | Ziele (in Aufgaben) | `Scaffold` | Route/Goals thin; Milestone-Timeline Slice A5 |
| 03 | Task Modal | `Partial` | Properties/Subtasks; Tags-Katalog hardcodiert |
| 04 | Modal + Breadcrumb | `Partial` | Breadcrumb da; Depth = 5 (Domain) |
| 05–08 | Blocks Tabs | `Scaffold` | Liste + Create; kein pixelgenaues Hub |
| 09 | Modal Zeitblock | `Not started` | |
| 10–12 | Block Edit Overlays | `Not started` | Slice A4 |
| 13–18 | Fokusmodus | `Scaffold` | Feature-Ordner; Slice A6 |

---

## Sidebar / Filter (ohne eigene PNG)

| Modus | Status | Hinweis |
|-------|--------|---------|
| Favoriten / Heute / Eingang | `Partial` | Filter-Logik in View; L2-Links Scaffold |
| Kategorien | `Not started` | DB-Tabelle; keine API — Slice A3 |
| Labels | `Deferred` | Tags im Menü später |
| Ziele-Liste in L2 | `Scaffold` | |

---

## DnD-Oberflächen

| Surface | Status | Slice |
|---------|--------|-------|
| Shared `components/dnd/` | `Done` | A1 — sortable-styles, GhostShell, scheduleClear |
| Listen-Reorder (gleiche Gruppe) | `Done` | Flat list inkl. Nested-Items |
| Kongruenter Placeholder/Ghost | `Done` | Same-surface Placeholder (kein leerer Graublock) |
| Cross-Group Move | `Done` | Live zwischen Containern |
| Nested / Reparent | `Done` | dnd-kit SortableTree: flatten + projection; Commit erst onDrop |
| Drop auf Sidebar | `Not started` | A3 |
| Blocks Library → Rail | `Not started` | A4 |
| Task → Calendar Morph | `Deferred` | nach Blocks / Kalender-Gate |

---

## Slices A0–A6

| Slice | Inhalt | Status |
|-------|--------|--------|
| A0 | Statusboards (Product + Aufgaben) | `Done` |
| A1 | DnD Foundation (Listen) | `Done` |
| A2 | Cross-Group + Nested | `Done` (PO-Smoke empfohlen) |
| A3 | Sidebar + Kategorien | `Not started` |
| A3 | Sidebar + Kategorien | `Not started` |
| A4 | Zeitblöcke 05–12 | `Not started` |
| A5 | Ziele-Tab View 02 | `Not started` |
| A6 | Fokus 13–18 | `Deferred` (nach A4) |

---

## Bewusst deferred (Handshake)

- Tags im Kontextmenü
- Dedizierte Duplicate-API
- Bulk-Select (FR-TASK-008)
- Neon für Goals/Blocks-Catalog (weiter Memory bis explizit)
