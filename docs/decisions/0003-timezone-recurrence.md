# ADR 0003: Timezone and Recurrence

## Status

Accepted

## Context

Kalender, Blocks und Fokuszeiten brauchen eindeutige Zeitwahrheit über Sommerzeit und
Nutzerzeitzonen hinweg. FullCalendar ist Darstellung, nicht Sync-Wahrheit.

## Decision

- Instants (`startsAt`, `endsAt`, Fokus-Zeitpunkte) werden als `timestamptz` UTC gespeichert.
- Kalendereinträge tragen zusätzlich die Nutzer-`timezone` für lokale Darstellung und All-Day.
- Datum ohne Uhrzeit (`dueDate`, Journal `entryDate`) ist ein reines `date`-Feld ohne TZ-Shift.
- Allgemeine Datumsoperationen: `date-fns`.
- Explizite Zeitzonen-/Offsetlogik: Luxon.
- Wiederholungen: `rrule` als Regelstring plus Ausnahme-Modell in Folgeschritten.
- Externe Sync-Ereignisse speichern `externalId` / `externalCalendarId` und Sync-Cursor in
  `integration.syncCursor`.

## Consequences

UI formatiert lokal über Nutzerzeitzone. Persistenz und Sync bleiben instant-basiert. Vor dem
ersten Recurrence-Editor werden Ausnahmeobjekte ergänzt, ohne das Instant-Modell zu ändern.
