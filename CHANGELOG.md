# Changelog

Kompakte Begleitdokumentation zur Entwicklung. Git bleibt die vollständige technische Historie.

## Unreleased

### Decisions

- Phase 1 Pattern Library V1.1 ist freigegeben; Produktaufbau startet foundation-first.
- Auth V1: E-Mail/Passwort (+ Verifizierung/Reset). Kein Magic Link/Social/2FA.
- Kalender P0: Tag/Woche/Monat; List View und externe Sync folgen danach.
- Lokaler Default-Datentreiber ist `memory` bis `DATABASE_URL` + `FOKUNA_DATA_DRIVER=neon` gesetzt sind.

### Added

- Phase-2-Foundation: `@fokuna/db`, `@fokuna/domain`, `@fokuna/api-contracts`, ADRs 0002–0004.
- App Shell mit Modulrouten, Demo-/Better-Auth, `/api/v1` für Tasks, Goals, Blocks, Calendar, Focus, Journal, Insights, Integrations und Stripe-Webhook-Stub.
- Produktviews für Aufgaben (dnd-kit), Blocks, Kalender (FullCalendar), Ziele, Fokus, Journal, Insights und Einstellungen.
- `apps/admin` Skelett und Launch-/Hardening-Checklisten unter `docs/launch/`.

### Changed

- Goal Card mit frueher ausblendendem Schmuckrand, konkaver Progress-Aussparung, animiertem SVG-Progressring ab 12 Uhr, vertikal korrigierten Meilensteinen, gemeinsamem Task-Subtask-Icon, dynamischer Drei-Schritte-Vorschau und quarternaerem Fahnen-Empty-State mit gruener Anlege-Aktion an die Layout-Vorgabe angeglichen.

### Added

- Goal Card der Ziele-Uebersicht als tokenisierte, verlinkbare Pattern-Komponente mit Fortschrittsring, optionalem Bild-, Orts- und Tag-Kontext sowie robusten Meilenstein- und Empty-States ergaenzt.
- Block-Timeline und Edit-Rail aus `C - Desktop - Blocks` als tokenisierte Pattern-Komponenten mit wiederverwendbarem BlockTile, Category-Farben, Badge und freien Edit-Slots ergänzt.
- Sidebar: Einstellungen ist nun ein vollwertiger, unten positionierter Level-1-Navigationseintrag mit identischer 48-px-Geometrie, 24-px-Icon-Darstellung sowie denselben Hover-, Fokus- und Tooltip-States wie die übrigen Rail-Items.
- Produktions-Workspace für App, Design-Tokens, Icons und UI-Komponenten vorbereitet.
- Reproduzierbare Token-Normalisierung für CSS, Tailwind und TypeScript ergänzt.
- 301 freigegebene SVG-Assets als typisierte, variantenfähige React-Icon-Registry integriert.
- Fehlendes Search-Icon in den drei vereinbarten Produktionsausprägungen aus der Central Icon
  Library ergänzt.
- Erste produktionsnahe Pattern Library mit Foundations, Formularen, Navigation, Overlays,
  Kalender- und Aufgabenmustern umgesetzt.
- Date Picker für Einzel- und Zeitraumwahl mit Monatsnavigation, vier Control-Größen und
  Tastatursteuerung ergänzt; `date-fns` wird gemäß PRD für Datumsoperationen genutzt.
- Desktop UI Shell mit fester 72px-Navigation und optionalem Level 2 im Abnahmekatalog ergänzt.
- Switcher, Tab Select, Search-Varianten, Meilensteine und Task-Modal-Komposition als eigenständige
  Pattern-Verträge ergänzt.
- Technische Übergabe für den Folge-Agenten und Komponentenregeln im Repository dokumentiert.
- Kritische Zustände der Komponenten mit Vitest und Testing Library abgedeckt.
- Pattern Library in eine Foundations-Übersicht und 35 eigenständige, responsive Detailseiten mit
  Live-Specimen, Figma-Referenz, Maßvertrag und Übergabehinweisen überführt.
- Control-Geometrien, Form- und Search-Typografie, Checkbox-Zustände, Kalender-Items sowie Aufgaben-,
  Meilenstein- und Modal-Patterns an die aktuellen Figma-Verträge angeglichen.
- Button-, Formular-, Date-Picker-, Dropdown-, Slider-, Search-, Auswahl-, Tab-Select- und
  Toggle-Patterns gegen ihre Figma-Komponenten neu vermessen und tokengetreu korrigiert.
- Browserbasierte Pattern-Verträge für Höhenleiter, Farben, Icon-Größen, Zeitraumdarstellung,
  Auswahlgeometrie, Slider und Search-Clear ergänzt.
- Zweite pixelgenaue Korrekturrunde für alle 35 Pattern-Seiten abgeschlossen: Kalender-Zeitraster,
  Task- und Milestone-Zustände, vollständige Task-Modals, echte Switcher-/Filter-Kompositionen,
  animierte Tab-Indikatoren sowie getrennte Callout-Varianten an Figma angeglichen.
- Dritte Figma-Korrekturrunde ergänzt: exakte vertikale Element-Strokes, stabile Date-Range- und
  Radiobox-Geometrien, ausgerichtete Step-Slider-Skala und interaktives Breadcrumb-Popover.
- Sidebar Combined mit echtem Markenlogo, heller 72px-Rail und vollständiger Aufgabenhierarchie
  aufgebaut; Task- und Milestone-Zeilen sowie alle gemappten Page-Header-Varianten neu strukturiert.
- Vierte Abnahmerunde stabilisiert Auswahlgeometrien und Task-Checkboxen, vervollständigt Sidebar-
  States und Kalender-Drag-Zustände und führt die Aufgaben-Modal-Patterns in eine Figma-nahe,
  überlauffreie Komposition mit lokalem Bearbeitungsmodus zusammen.
- Aufgabenlisten leiten Höhe, Meta-Zeile und Chevron nun aus dem tatsächlichen Inhalt ab; Drag-
  Shadow, eingerückte Unteraufgaben und die umschaltbare Breadcrumb-Variante des Modals wurden ergänzt.
- Aufgaben-, Unteraufgaben- und Meilensteinachsen folgen nun exakt der Figma-Hierarchie; das
  Aufgabenmodal wahrt mit und ohne Breadcrumb seinen 40px-Rahmen und stabile Edit-Geometrien.
- Checkbox- und Milestone-Hover, interaktive Add- und Gruppen-Zustände sowie die 0/24/16px-Achsen
  der Modal-Unteraufgaben wurden gegen Figma korrigiert und browserbasiert verifiziert.
- Task- und Milestone-Chevrons simulieren ihre Hierarchien nun lokal; Modal-Schließen, Timeline-
  Schichtung, Chevron-Versatz, Drag-Handles und Add-Achsen bleiben dabei über alle Varianten stabil.
- Aufgaben-, Meilenstein- und Modalgruppen öffnen ihre kontextuell beschrifteten Add-Formulare nun
  direkt am jeweiligen Einfügepunkt und kehren nach Abbrechen oder Hinzufügen zum Trigger zurück.
- Die linke Aufgabenmodal-Spalte scrollt bei Überlauf nun als geschlossene Inhaltsfläche innerhalb
  der 8px-Schmucklinie; kurze Inhalte behalten weiterhin eine scrollbarfreie Darstellung.
- Aktive Aufgaben-, Unteraufgaben- und Meilenstein-Editoren folgen nun der Plus-Achse ihres
  Triggers, enden bündig rechts und lösen den letzten Listentrenner während der Eingabe ab.
- Die Aufgabenmodal-Eigenschaften öffnen nun verankerte, komponentenbasierte Popovers; Property-
  Rail, Checkmarks, Callout-Icons sowie aktive Tab- und Toggle-Hoverzustände wurden an Figma angeglichen.
- Die Aufgabenmodal-Rail zeigt Werte nun unterhalb ihrer Labels, unterstützt Multi-Tag-Auswahl,
  Schnellwerte für Zeitschätzungen und ein separates Löschmenü; Einzeldaten schließen nach Auswahl.
- Task-Group-Header verwenden nun die definierten Label-Typografie-Tokens; kompakte Tag-Schließen-
  Icons und automatisch schließende Einzelwahl-Popovers wurden ergänzt.

### Decisions

- Die Pattern Library wird als interne Next.js-Route umgesetzt und bleibt Teil des Projekts.
- Die erste Ausbaustufe endet mit einer visuell und technisch geprüften Komponentenbibliothek.
- Der Figma-Export bleibt die Quelle; normalisierte Produktionsartefakte werden eingecheckt.

### Issues and learnings

- Die globale pnpm-Version verlangt eine neuere Node-Runtime. Das Repository nutzt deshalb über
  Corepack verbindlich pnpm 9.15.4.
- Die strenge Peer-Prüfung hat `@testing-library/dom` als fehlende direkte Testabhängigkeit erkannt;
  sie wird explizit geführt, anstatt Peer-Abhängigkeiten automatisch zu installieren.
- Der vorhandene Icon-Export enthielt kein Search-Icon. Die Varianten 16/1, 16/1.5 und 24/1.5
  wurden aus dem verbundenen Figma-Component-Set ergänzt.
- Root-Scripts fielen initial auf die inkompatible globale pnpm-Version zurück. Alle rekursiven
  Workspace-Aufrufe verwenden nun explizit Corepack.
- Vitest wurde durch die implizite CommonJS-Auswertung der Paketkonfiguration blockiert. Das
  UI-Paket ist nun explizit ESM und teilt die TypeScript-/ESLint-Basis mit der Web-App.
- Token- und Icon-Generatoren überschrieben nach dem Qualitätslauf vier Dateien in einem
  abweichenden Format. Beide Generatoren erzeugen ihren Output nun direkt Prettier-konform.
- Ein ungeschichteter globaler `font: inherit`-Reset überstimmte die tokenisierten Control-Größen.
  Der Reset liegt nun in `@layer base`; SM, MD, LG und XL rendern wieder mit 12, 14, 16 und 16 px.
- Ein kontrolliertes Dropdown zeigte die Auswahl ohne externes State-Update nicht im Trigger. Die
  Anzeige führt nun einen eigenen Display-State, während `onValueChange` weiterhin informiert.
- Playwright lief zunächst über `127.0.0.1`, während der Next-Devserver auf `localhost` hydratisiert
  wurde. Die einheitliche Host-Konfiguration verhindert nicht-interaktive SSR-Snapshots im Test.
- Mehrere visuell ähnliche Semantik-Tokens waren nicht austauschbar: neutrale Tertiärwerte hatten
  Aktionsfarben ersetzt. Die betroffenen Controls verwenden nun wieder ihre expliziten Surface-,
  Border-, Text- und Icon-Verträge.
- Wechselnde Border-Breiten erzeugten bei Radioboxen sichtbare Layoutsprünge. Der ausgewählte
  2px-Eindruck wird nun über einen inneren Stroke bei unveränderter Außenbox erzeugt.
- Titel und Metadaten der Aufgabenzeilen lagen in getrennten Gridspalten. Beide Inhalte teilen nun
  dieselbe Contentspalte; Drag-Slot, Chevron, 16px-Checkbox und Favorit folgen der Figma-Reihenfolge.
- Der Add-Editor ließ die Header-Zeile des Aufgabenmodals schrumpfen und verschob dadurch die
  Unteraufgaben. Inhaltsbasierte Grid-Zeilen halten nun den Abstand stabil; kollabierte Gruppen
  verzichten auf Elevation.
