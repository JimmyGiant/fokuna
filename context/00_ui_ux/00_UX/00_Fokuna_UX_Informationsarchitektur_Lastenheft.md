# Fokuna UX-Informationsarchitektur

Stand: 18. Juli 2026  
Ergaenzung zum Design-Handoff, den View-Screenshots und der Pattern-Library-Uebersicht

## Zweck

Dieses kurze UX-Lastenheft beschreibt die Informationsarchitektur, zentrale Nutzerlogik und wichtige UX-Elemente, die aus den Screens allein nicht immer eindeutig hervorgehen. Es ist bewusst kompakt gehalten und soll spaeteren Agenten, Designern und Produkt-/Tech-Konversationen helfen, die App nicht nur visuell, sondern strukturell richtig weiterzudenken.

## UX-Leitidee

Fokuna soll Nutzer vom abstrakten Vorhaben zur konkreten Umsetzung fuehren:

**Ziel setzen -> Arbeit planen -> fokussiert ausfuehren -> reflektieren -> Muster erkennen -> System anpassen.**

Die App darf sich dabei nicht wie eine Sammlung einzelner Tools anfuehlen. Ziele, Aufgaben, Blocks, Kalender, Fokusmodus, Journal und Insights muessen als zusammenhaengender Produktivitaetskreislauf verstanden werden.

## Informationsarchitektur

### Primaere Navigation

Die Hauptnavigation liegt in der linken Sidebar. Sie strukturiert die App in die grossen Produktbereiche:

- Kalender
- Aufgaben
- Journal
- Ziele
- Insights
- Einstellungen

Die Sidebar ist dauerhaftes Orientierungselement. Sie soll nicht mit kontextuellen Aktionen ueberladen werden.

### Sekundaere Navigation

Sekundaere Navigation findet innerhalb eines Moduls statt:

- Page Header mit Search, Filter, Actions und Meta-Menues
- Tab Bars fuer gleichrangige Inhaltsansichten
- Toggle Groups fuer lokale Moduswechsel
- Breadcrumbs fuer tiefere Detail- und Bearbeitungskontexte
- Overlays/Modals fuer fokussierte Bearbeitung ohne Kontextverlust

### Objektmodell Aus Nutzersicht

Die wichtigsten Objekte und ihre Beziehungen:

- **Ziel**: langfristige Richtung, Motivation, Meilensteine, Rhythmus.
- **Aufgabe**: konkrete Arbeit, die eigenstaendig oder zielbezogen sein kann.
- **Block**: geplante oder wiederverwendbare Zeiteinheit mit Kategorie, Icon, Timer und optionalem Fokusmodus.
- **Fokus Session**: aktive Ausfuehrung eines Blocks oder einer Aufgabe.
- **Journal Entry**: Check-in oder Check-out zur Tagesausrichtung und Reflexion.
- **Insight**: Verdichtung von Verhalten, Fortschritt und Mustern.

## Zentrale Nutzerfluesse

### Ziel Zu Umsetzung

1. Nutzer erstellt oder waehlt ein Ziel.
2. Ziel wird mit Motivation, Meilensteinen und Rhythmus konkretisiert.
3. Aus dem Ziel entstehen Aufgaben oder Blocks.
4. Blocks werden im Kalender oder Aufgabenbereich eingeplant.
5. Nutzer startet eine Fokus Session.
6. Fortschritt fliesst in Ziel- und Insight-Ansichten zurueck.

### Tagesplanung

1. Nutzer oeffnet Kalender oder Aufgaben.
2. Offene Aufgaben, geplante Blocks und Termine werden sichtbar.
3. Nutzer priorisiert, filtert oder plant Arbeit in Zeitbloecke.
4. Fuer konzentrierte Arbeit kann der Fokusmodus gestartet werden.
5. Minimierter Fokusstatus erlaubt Rueckkehr in die App ohne Verlust der Session.

### Journal-Routine

1. Check-in richtet den Tag aus.
2. Nutzer beantwortet kurze, strukturierte Inputs.
3. Tags, Energie, Stimmung und Absichten werden erfasst.
4. Check-out reflektiert Abschluss, Fortschritt und Learnings.
5. Journaldaten koennen spaeter Insights und persoenliche Muster speisen.

### Template-Nutzung

1. Nutzer entdeckt oder waehlt ein Template.
2. Template zeigt Zweck, Beschreibung und Inputstruktur.
3. Nutzer kann Template als Standard setzen oder bearbeiten.
4. Bearbeitung soll klar und formularbasiert bleiben, nicht ueberladen.

### Einstellungen Und Kontrolle

1. Nutzer steuert Account, Kalender, Benachrichtigungen, Fokusmodus und Abrechnung.
2. Einstellungen sollen funktional bleiben und keine zweite Arbeitsoberflaeche bilden.
3. Integrationen muessen deutlich von persoenlichen Praeferenzen getrennt sein.

## Wichtige UX-Elemente

### Empty States

Empty States sollen immer drei Dinge leisten:

- erklaeren, was dieser Bereich bringt,
- zeigen, warum er aktuell leer ist,
- eine naechste sinnvolle Aktion anbieten.

Beispielhafte CTA-Logik:

- erstes Ziel erstellen,
- ersten Block planen,
- Journal-Template auswaehlen,
- Kalender verbinden.

### Loading States

Loading States sollten ruhig und unaufgeregt sein. Besonders relevant fuer:

- Kalenderdaten,
- Insights,
- externe Integrationen,
- Template- oder Einstellungsdaten.

Wichtig: Ladezustaende sollen Layout-Spruenge vermeiden.

### Fehlerzustaende

Fehlerzustaende brauchen klare Handlungsvorschlaege:

- erneut versuchen,
- Verbindung pruefen,
- Einstellung oeffnen,
- spaeter fortsetzen.

Fehlertexte sollen nicht technisch klingen, aber genug Kontext geben.

### Undo Und Rueckgaengig

Bei destruktiven oder schwer rueckgaengig zu machenden Aktionen sollte ein Rueckgaengig-Prinzip vorgesehen werden:

- Aufgabe loeschen,
- Block entfernen,
- Template veraendern,
- Ziel archivieren,
- Integration trennen.

Nicht jede Aktion braucht ein Modal. Oft ist ein kurzer Undo-Hinweis besser als eine schwere Sicherheitsabfrage.

### Progressive Disclosure

Fokuna hat viele Funktionen. Die UX sollte Informationen stufenweise zeigen:

- Listen und Karten zeigen nur das Wesentliche.
- Details liegen in Detailansichten, Overlays oder Menues.
- Fortgeschrittene Einstellungen bleiben in Settings oder Bearbeitungsmodi.
- Fokusmodus reduziert bewusst statt zu erweitern.

### Orientierung

Nutzer muessen jederzeit verstehen:

- Wo bin ich?
- Was ist mein aktueller Kontext?
- Welche Aktion ist als Naechstes sinnvoll?
- Was passiert, wenn ich klicke?

Page Header, Breadcrumbs, aktive Sidebar-Zustaende und klare Modal-Titel tragen diese Orientierung.

## Priorisierung Der Interface-Inhalte

### Primaer

- aktuelle Aufgabe oder aktueller Block,
- naechste sinnvolle Aktion,
- Ziel-/Zeit-/Statusbezug,
- aktive Session oder Auswahl.

### Sekundaer

- Filter,
- Metadaten,
- Tags,
- Kategorie,
- Rhythmus,
- kurze Hilfstexte.

### Tertiaer

- seltene Meta-Aktionen,
- technische Details,
- Archiv- und Verwaltungshandlungen,
- erweiterte Einstellungen.

## UX-Regeln Fuer Neue Screens

- Jeder Screen braucht eine klare Hauptaufgabe.
- Primaeraktionen sollen sichtbar sein, nicht im Meta-Menue verschwinden.
- Ueberladene Modals vermeiden; lieber einspaltig und klar strukturieren.
- Keine neuen Navigationsebenen einfuehren, wenn Tabs, Toggle Groups oder Breadcrumbs reichen.
- Formulargruppen brauchen Label, optional Sublabel und klare Validierung.
- Listen und Karten brauchen sinnvolle leere, lade- und fehlerhafte Zustaende.
- Bei Auswahl von Farbe, Icon, Timer oder Musik soll die UI ruhig bleiben und Auswahl nur bei Bedarf erweitern.
- Fokusmodus darf visuell eigenstaendig sein, muss aber eindeutig zur aktiven Aufgabe oder zum Block gehoeren.

## UX-Fragen Fuer Die Technische Folgephase

- Welche Objekte koennen geloescht, archiviert oder wiederhergestellt werden?
- Welche Aktionen brauchen Undo statt Confirm-Modal?
- Welche Daten aktualisieren sich live?
- Welche Offline- oder Sync-Zustaende muessen sichtbar sein?
- Welche Integrationen koennen fehlschlagen und wie wird das kommuniziert?
- Welche Insights sind sofort verfuegbar und welche erst nach genug Nutzungsdaten?
- Welche Standardtemplates werden mitgeliefert?
- Wie werden Nutzer durch die erste Einrichtung gefuehrt?

## Kurzfazit

Fokuna sollte aus Nutzersicht nicht als Sammlung von Kalender, Tasks, Journal und Goals erscheinen, sondern als ein geschlossenes System fuer bewusste, geplante und reflektierte Arbeit. Die UX muss deshalb Verbindungen sichtbar machen, ohne die Oberflaeche zu ueberfrachten: klare Navigation, ruhige Komponenten, wenige dominante Aktionen und ein konsequenter Weg von Planung zu Ausfuehrung zu Reflexion.
