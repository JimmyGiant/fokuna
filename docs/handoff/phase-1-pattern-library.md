# Phase 1 Handoff: Frontend Foundation und Pattern Library

## Ergebnis

Die Produktionsbasis ist als pnpm-Workspace aufgebaut. Figma-Tokens, Schriften und kuratierte Icons
sind in eigenständige Pakete überführt. `@fokuna/ui` enthält die wiederverwendbaren Basiskomponenten
sowie die produktspezifischen Kalender- und Aufgabenmuster. Die interne Route `/pattern-library`
dient als interaktive Abnahme- und Regressionsebene.

## Öffentliche Module

- `@fokuna/tokens`: normalisierte CSS-, Tailwind-, JSON- und TypeScript-Tokens.
- `@fokuna/icons`: semantische, typisierte Icon-Registry mit freigegebenen Varianten.
- `@fokuna/ui`: Foundations, Controls, Navigation, Overlays, Kalender-, Aufgaben- und Shell-Patterns.
- `@fokuna/web`: Next.js-Host und Pattern-Library-Katalog.

## Verbindliche Leitplanken

1. Vor einer neuen UI-Komponente immer `@fokuna/ui`, den Katalog und die Figma-Übergabe prüfen.
2. Keine primitiven Farbwerte in Produktkomponenten einsetzen, wenn ein semantisches Token besteht.
3. Neue Control-Größen nur als systemweite Entscheidung einführen; die aktuelle Leiter ist
   28/32/40/48px.
4. Neue Icons über die Registry ergänzen und nicht als lokales Inline-SVG duplizieren.
5. Komponentenänderungen mit einem fokussierten Test und einem sichtbaren Katalogbeispiel begleiten.
6. `CHANGELOG.md` kompakt fortführen, besonders bei Problemen, Entscheidungen und ungelösten Risiken.

## Bewusste Phasengrenze

Noch nicht Teil dieser Phase sind fachliche Produktviews, Routing der Hauptbereiche, Backend,
Authentifizierung, Persistenz, Datenbankmigrationen und produktive Drag-and-drop-Logik. Kalender- und
Aufgabenkomponenten bilden die dafür benötigten visuellen States bereits ab; die spätere Logik muss
die im PRD und in den MVP-Learnings beschriebenen Verträge einhalten.

`date-fns` ist gemäß PRD für allgemeine Datumsoperationen integriert. Luxon und rrule werden erst in
den folgenden Kalenderphasen ergänzt, wenn Zeitzonen- und Wiederholungslogik tatsächlich umgesetzt
wird.

## Abnahme

- TypeScript, ESLint/Accessibility und Komponententests sind grün.
- Die Pattern Library wurde auf 1440px, 390px und 320px ohne globales horizontales Überlaufen
  geprüft.
- Die final verbindliche visuelle Freigabe erfolgt durch den Product Owner auf
  `/pattern-library`, bevor die nächste KI mit Produktviews und Fachlogik beginnt.
