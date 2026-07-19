# Fokuna Product Requirements Document

**Dokumenttyp:** Product Requirements Document (PRD)  
**Status:** Verbindliche Arbeitsgrundlage fuer den Produktionsaufbau  
**Version:** 1.0  
**Stand:** 19. Juli 2026  
**Produkt:** Fokuna Web-App  
**Primaere Plattform:** Desktop-orientierte Web-App  
**Spaetere Plattformen:** iOS, macOS und Android ueber dieselbe API  
**Designquelle:** Figma-Datei `UI Design | Fokuna` (`ltQMlboZomvr70Z4m0aLQj`)

---

## 1. Zweck und Verbindlichkeit

Dieses PRD ueberfuehrt die bisherige Produkt-, UX-, UI- und Technologieplanung in eine umsetzbare Grundlage fuer die produktionsreife Fokuna-App. Es beschreibt Produktziel, Funktionsumfang, Qualitaetsanspruch, technische Leitplanken, Umsetzungsreihenfolge und Abnahmekriterien.

Das Dokument ist bewusst keine vollstaendige technische Spezifikation. Detailentscheidungen zu Datenbankschemata, API-Payloads und Implementierungsalgorithmen werden waehrend der Umsetzung als nachvollziehbare Architecture Decision Records oder technische Spezifikationen ergaenzt. Sie duerfen den hier definierten Produkt-, Design- und Qualitaetsanforderungen nicht widersprechen.

### 1.1 Quellenhierarchie

Bei Widerspruechen gilt folgende Reihenfolge:

1. Explizite, spaetere Entscheidungen des Product Owners.
2. Dieses PRD und darin klar markierte Muss-Anforderungen.
3. Figma High-Fidelity-Views und die jeweils korrespondierenden Uebergabenotizen.
4. Fokuna Design Tokens und Pattern Library in Figma.
5. UX-Informationsarchitektur und Design-Handoff.
6. Technologiestack und Projektregeln.
7. MVP-Learnings als Erfahrungsquelle, nicht als unveraenderliche Implementierungsvorgabe.

Unklarheiten mit sichtbaren Auswirkungen auf Produktverhalten, Datenmodell oder UI sind vor der Umsetzung zu klaeren. Kleine technische Details duerfen eigenstaendig entschieden werden, sofern sie den bestehenden Mustern folgen und dokumentiert werden.

### 1.2 Anforderungssprache

- **MUSS / P0:** unverzichtbar fuer den produktionsreifen Release oder das jeweilige Phase-Gate.
- **SOLL / P1:** hoher Produktwert; geplant, darf aber begruendet nach einem P0-Release folgen.
- **KANN / P2:** spaetere Erweiterung oder Optimierung.
- **OFFEN:** fachliche Entscheidung fehlt; keine stillschweigende Annahme mit grosser Tragweite treffen.

Jede nummerierte Anforderung ist pruefbar und soll in Issues, Tests oder Abnahmeprotokollen referenziert werden.

---

## 2. Produktzusammenfassung

Fokuna ist eine ruhige, hochwertige Productivity-SaaS-Anwendung, die Ziele, Aufgaben, Zeitbloecke, Kalender, Fokusarbeit, Journaling und persoenliche Insights in einem zusammenhaengenden Arbeitsraum verbindet. Nutzer sollen langfristige Vorhaben in konkrete Arbeit uebersetzen, diese zeitlich planen, konzentriert ausfuehren, den eigenen Fortschritt reflektieren und aus wiederkehrenden Mustern bessere Entscheidungen ableiten koennen.

Fokuna ist kein loses Buendel einzelner Tools. Der Produktkreislauf lautet:

**Ziel setzen -> Arbeit strukturieren -> Zeit planen -> fokussiert ausfuehren -> reflektieren -> Muster erkennen -> System anpassen.**

### 2.1 Ausgangslage

Ein erstes MVP existiert. Der nun beginnende Aufbau ist keine Fortsetzung als schneller Prototyp, sondern eine saubere Neuentwicklung der produktionsreifen App. Die MVP-Learnings, insbesondere zu Drag-and-drop, liefern wertvolle Hinweise auf bereits geloeste Probleme. Sie werden auf fachliche und technische Eignung geprueft, aber nicht blind portiert.

### 2.2 Produktvision

Fokuna soll Nutzern ein verlaessliches System fuer bewusste Arbeit bieten: weniger Wechsel zwischen isolierten Apps, weniger Distanz zwischen Ziel und Tagesplanung und mehr Klarheit darueber, was als Naechstes wichtig ist. Die App soll professionell, performant und langfristig wartbar sein und spaeter native Clients ohne Neuaufbau der Geschaeftslogik ermoeglichen.

---

## 3. Ziele und Erfolgskriterien

### 3.1 Produktziele

- **G-01:** Ziele, Aufgaben, Blocks, Kalender, Fokus Sessions, Journal und Insights bilden einen nachvollziehbaren Kreislauf statt isolierter Module.
- **G-02:** Nutzer koennen ihre relevante Arbeit schnell erfassen, strukturieren, planen und ausfuehren.
- **G-03:** Die Oberflaeche entspricht den Figma-Vorgaben pixelgenau und verwendet konsequent dieselben Komponenten und Tokens.
- **G-04:** Die App reagiert schnell, bleibt bei komplexen Listen und Kalendern stabil und vermittelt jederzeit Systemstatus.
- **G-05:** Die Web-Architektur ermoeglicht spaetere native Apps ueber eine stabile HTTP-API und gemeinsame Geschaeftslogik.
- **G-06:** Die Komponentenbibliothek wird als dauerhaftes Produktfundament aufgebaut und bei jeder Erweiterung gepflegt.
- **G-07:** Kritische Produktablaeufe sind automatisiert getestet, beobachtbar und ohne bekannte Datenverlustpfade auslieferbar.

### 3.2 Messbare Release-Kriterien

- Alle P0-Anforderungen sind umgesetzt oder explizit durch den Product Owner aus dem Release entfernt.
- Alle freigegebenen Desktop-Views besitzen eine nachweisbare Umsetzung und visuelle Abnahme gegen Figma.
- Die Pattern-Library-Uebersichtsseite deckt alle produktiv verwendeten Basis- und Produktkomponenten inklusive relevanter States ab.
- Kritische End-to-End-Flows laufen stabil in CI.
- Keine offenen Fehler der Schwere `blocker` oder `critical`; keine bekannten Datenverlustfehler.
- WCAG 2.2 Level AA wird fuer die zentralen Flows angestrebt und anhand einer Accessibility-Checkliste geprueft.
- Die drei Core Web Vitals liegen fuer zentrale Seiten am 75. Perzentil im Bereich `good`: LCP <= 2,5 s, INP <= 200 ms, CLS <= 0,1.
- Fehler-, Performance- und Produktanalyse sind datenschutzkonform instrumentiert.

### 3.3 Nicht-Ziele des ersten Web-Releases

- Keine nativen iOS-, macOS- oder Android-Apps.
- Keine vollstaendige Offline-First-Synchronisation der Web-App.
- Keine direkte Apple-/iCloud-Kalenderintegration.
- Keine Ressourcenplanung fuer Teams, Raeume oder Mitarbeitende ueber FullCalendar Premium.
- Kein unkontrolliertes White-Labeling oder vollstaendiger Theme-Editor. Die Architektur bleibt theme-faehig.
- Keine Team-/Organisation-Kollaboration, solange Rollen, Freigaben und Mandantenmodell nicht gesondert spezifiziert sind.

---

## 4. Zielgruppen und Kernaufgaben

### 4.1 Primaere Zielgruppe

Einzelpersonen, die Ziele, Aufgaben und Zeitplanung bewusst miteinander verbinden wollen und dafuer ein ruhiges, strukturiertes System statt einer rein reaktiven To-do-Liste suchen.

### 4.2 Primaere Jobs to Be Done

- Wenn ich ein groesseres Vorhaben habe, moechte ich es in Meilensteine, Rhythmen und konkrete Arbeit uebersetzen.
- Wenn mein Tag beginnt, moechte ich schnell erkennen, was wichtig ist und wann ich daran arbeite.
- Wenn ich konzentriert arbeite, moechte ich Ablenkung reduzieren und meinen Fortschritt sichtbar halten.
- Wenn mein Tag endet, moechte ich kurz reflektieren, ohne ein langes Formular auszufuellen.
- Wenn ich mein Verhalten ueber Zeit betrachte, moechte ich hilfreiche Muster statt bedeutungsloser Dashboard-Zahlen sehen.
- Wenn sich meine Arbeitsweise aendert, moechte ich Blocks, Templates und Einstellungen anpassen koennen.

### 4.3 Produktprinzipien

1. **Verbindungen vor Funktionssammlung:** Jede Funktion soll den Produktkreislauf staerken.
2. **Progressive Disclosure:** Uebersichten zeigen das Wesentliche; Details erscheinen bei Bedarf.
3. **Eine klare Hauptaufgabe pro View:** Primaeraktionen bleiben sichtbar.
4. **Ruhig, nicht leer:** Zurueckhaltung darf nicht zu fehlender Orientierung fuehren.
5. **Direkte Rueckmeldung:** Speichern, Verschieben, Starten und Abschliessen fuehlen sich unmittelbar an.
6. **Wiederverwendung vor Neuerfindung:** Pattern Library zuerst pruefen.
7. **Semantik vor Hexwert:** Farben, Typografie und Abstaende werden ueber Tokens gesteuert.
8. **Barrierefreiheit ist Verhalten:** Fokus, Tastatur, Labels und Drag-Alternativen sind Teil der Funktion.

---

## 5. Informationsarchitektur und Objektmodell

### 5.1 Primaere Navigation

Die linke Sidebar fuehrt zu:

- Kalender
- Aufgaben
- Journal
- Ziele
- Insights
- Einstellungen

Die Sidebar bleibt stabiler Orientierungsanker. Kontextuelle Aktionen gehoeren in Page Header, Tabs, Toggle Groups, Menues, Drawer oder Overlays.

### 5.2 Zentrale Domaenenobjekte

| Objekt | Bedeutung | Wichtige Beziehungen |
|---|---|---|
| User | Account, Praeferenzen, Zeitzone und Abonnement | besitzt alle persoenlichen Objekte |
| Goal | Langfristige Richtung mit Motivation, Status und Rhythmus | Milestones, Tasks, Blocks, Progress |
| Milestone | Strukturierter Fortschritt innerhalb eines Goals | Goal, Tasks, Reihenfolge |
| Task | Konkrete Arbeitseinheit | Goal, Milestone, Subtasks, Tags, Priority, Schedule |
| Block | Wiederverwendbare oder geplante Zeiteinheit | Category, Icon, Timer, Music, Focus Settings |
| Calendar Entry | Zeitlich positionierter Termin, Task oder Block | Source, Start, End, Recurrence |
| Focus Session | Aktive Arbeitsphase | Task oder Block, Timer, Pausen, Ereignisse |
| Journal Template | Struktur aus Check-in-/Check-out-Feldern | Template Elements, Default Status |
| Journal Entry | Konkrete Antworten eines Nutzers | Template, Date, Mood, Energy, Inputs |
| Category | Nutzerwaehlbare visuelle Klassifikation | Blocks, Tags, Farbe, Icon |
| Insight | Berechnete Aussage aus Aktivitaetsdaten | Goals, Tasks, Focus, Journal, Zeit |
| Integration | Externer Kalender, Wetter- oder Zahlungsbezug | User, Sync State, Credentials |

### 5.3 Modellierungsregeln

- Datum ohne Uhrzeit, Uhrzeitpunkt und Dauer sind unterschiedliche Datentypen.
- Zeitpunkte werden serverseitig eindeutig gespeichert; Nutzerzeitzone und lokale Darstellung bleiben erhalten.
- Wiederholungen werden als Regel plus Ausnahmen modelliert, nicht als unkontrollierte Duplikatmenge.
- Category-, Priority- und Brand-Farben bleiben semantisch getrennt.
- Soft Delete, Archivierung und Undo werden je Objekt bewusst entschieden; Loeschverhalten ist nicht pauschal.
- Auditierbare externe Sync-Zustaende duerfen nicht nur in UI-State leben.

---

## 6. Funktionsumfang und Anforderungen

### 6.1 Globaler App Shell

- **FR-SHELL-001 / P0:** Die App MUSS eine persistente linke Sidebar mit aktivem Navigationszustand besitzen.
- **FR-SHELL-002 / P0:** Jeder Modul-View MUSS einen konsistenten Page Header fuer Titel, Suche, Filter und primaere Aktionen verwenden.
- **FR-SHELL-003 / P0:** Tiefe Bearbeitungskontexte MUESSEN Breadcrumbs, klare Modal-/Overlay-Titel oder vergleichbare Orientierung bieten.
- **FR-SHELL-004 / P0:** Loading-, Empty-, Error- und Permission-Zustaende MUESSEN ohne Layoutspruenge und mit sinnvoller Folgeaktion dargestellt werden.
- **FR-SHELL-005 / P0:** Der aktuelle Fokusstatus MUSS beim Navigieren erhalten bleiben und bei minimierter Session sichtbar erreichbar sein.
- **FR-SHELL-006 / P1:** Relevante Filter und Zeitraeume SOLLEN ueber URL Search Params teilbar und wiederherstellbar sein.
- **FR-SHELL-007 / P0:** Destruktive Aktionen MUESSEN entweder reversibel sein oder eine dem Risiko angemessene Bestaetigung besitzen.

**Abnahme:** Navigation, Header, Overlays, Statusmeldungen und Fokusanker entsprechen den freigegebenen Views; Tastaturreihenfolge und responsive Verhalten sind nachvollziehbar.

### 6.2 Kalender

- **FR-CAL-001 / P0:** Nutzer MUESSEN Kalenderinhalte in den in Figma vorgesehenen Desktop-Ansichten betrachten koennen.
- **FR-CAL-002 / P0:** Tasks, Blocks und importierte Kalenderereignisse MUESSEN visuell und semantisch unterscheidbar sein.
- **FR-CAL-003 / P0:** Nutzer MUESSEN zeitliche Eintraege erstellen, oeffnen, bearbeiten, verschieben und in der Dauer anpassen koennen, sofern der Eintragstyp dies erlaubt.
- **FR-CAL-004 / P0:** Drag, Drag-Ghost, Placeholder, Drop-Indikator und ungueltiger Drop MUESSEN entsprechend Pattern Library und Uebergabenotizen dargestellt werden.
- **FR-CAL-005 / P0:** Aenderungen an Start, Ende oder Dauer MUESSEN optimistisch reagieren und bei Serverfehlern kontrolliert zurueckgesetzt sowie erklaert werden.
- **FR-CAL-006 / P0:** Zeitzonen, Sommerzeitwechsel und ganztagige Eintraege MUESSEN ohne stille Zeitverschiebung behandelt werden.
- **FR-CAL-007 / P1:** Wiederkehrende Eintraege SOLLEN mit Bearbeitung von Einzeltermin, Folge und Serie umgehen koennen.
- **FR-CAL-008 / P1:** Google Calendar und Microsoft 365/Outlook SOLLEN als Zwei-Wege-Synchronisation angebunden werden.
- **FR-CAL-009 / P0:** Nicht per Drag bedienbare Alternativen fuer zeitliche Verschiebung und Dauer MUESSEN vorhanden sein.

**Abnahme:** Die Kalenderansicht bildet die Figma-Views ab; kritische Drag-/Resize-Flows, Zeitzonenfaelle und Sync-Fehler sind automatisiert getestet.

### 6.3 Aufgaben

- **FR-TASK-001 / P0:** Nutzer MUESSEN Aufgaben erstellen, bearbeiten, abschliessen, wieder oeffnen, priorisieren und terminieren koennen.
- **FR-TASK-002 / P0:** Aufgaben KOENNEN einem Goal, Milestone oder keiner uebergeordneten Struktur zugeordnet sein.
- **FR-TASK-003 / P0:** Aufgaben MUESSEN Unteraufgaben, Beschreibung, Faelligkeit, Zeitschaetzung, Tags und Prioritaet gemaess View-Vorgabe unterstuetzen.
- **FR-TASK-004 / P0:** Aufgabenlisten MUESSEN Gruppierung, Collapse/Expand, Favorisierung und die dokumentierten Meta-Aktionen unterstuetzen.
- **FR-TASK-005 / P0:** Reorder innerhalb einer Gruppe und Verschieben zwischen Gruppen MUESSEN visuell stabil und persistent sein.
- **FR-TASK-006 / P0:** Der Task-Detail-/Modal-Flow MUSS mit und ohne Unteraufgaben sowie mit Breadcrumb-Kontext funktionieren.
- **FR-TASK-007 / P0:** Primaere Task-Aktionen duerfen nicht ausschliesslich in Meta-Menues versteckt sein.
- **FR-TASK-008 / P1:** Bulk-Auswahl und Bulk-Aktionen SOLLEN erst nach separater fachlicher Freigabe implementiert werden.

**Abnahme:** Alle Aufgaben-Views und die in der Pattern Library dokumentierten Task-Komponenten sind komponentenbasiert umgesetzt; Reorder erzeugt kein sichtbares Zurueckspringen.

### 6.4 Blocks und Block-Templates

- **FR-BLOCK-001 / P0:** Nutzer MUESSEN alle, eigene, zielbezogene und vorgefertigte Blocks getrennt betrachten koennen.
- **FR-BLOCK-002 / P0:** Ein Block MUSS mindestens Titel, Beschreibung, Dauer, Category-Farbe und Icon enthalten koennen.
- **FR-BLOCK-003 / P0:** Ein Block KANN Rhythmus, Timerart, Pomodoro-Konfiguration, Countdown, Hintergrundmusik/Ambient Sound und Fokusmodus-Optionen enthalten.
- **FR-BLOCK-004 / P0:** Farbwahl MUSS auf den `category` Tokens basieren; Iconwahl MUSS das zentrale Icon-Set verwenden.
- **FR-BLOCK-005 / P0:** Iconauswahl soll in einer ruhigen, bedarfsgesteuerten Auswahl stattfinden und nicht dauerhaft eine grosse Iconwand zeigen.
- **FR-BLOCK-006 / P0:** Template-Karten MUESSEN konkrete, unterscheidbare Inhalte zeigen und duplizierte Dummydaten vermeiden.
- **FR-BLOCK-007 / P0:** Blocks MUESSEN in Kalender-/Planungsoberflaechen gezogen oder ueber eine barrierearme Alternative geplant werden koennen.
- **FR-BLOCK-008 / P1:** Nutzer SOLLEN eigene Block-Templates duplizieren und archivieren koennen.

**Abnahme:** Alle Block-Views, Bearbeitungs-Overlays, Kategorien, Timer- und Audioangaben entsprechen den Designvorgaben und verwenden keine hartcodierten Farben oder fremden Icons.

### 6.5 Fokusmodus

- **FR-FOCUS-001 / P0:** Eine Fokus Session MUSS aus einer Aufgabe oder einem Block gestartet werden koennen.
- **FR-FOCUS-002 / P0:** Der Standardzustand MUSS aktive Arbeit, verbleibende/vergangene Zeit und den fachlichen Kontext klar zeigen.
- **FR-FOCUS-003 / P0:** Pause, Fortsetzen und Beenden MUESSEN eindeutige, resiliente Zustandsuebergaenge sein.
- **FR-FOCUS-004 / P0:** Settings und Ereignis-/Kontextansichten MUESSEN als Zustaende derselben Session funktionieren, nicht als unabhaengige Sessions.
- **FR-FOCUS-005 / P0:** Eine laufende Session MUSS minimiert werden koennen und in der normalen App als Rueckkehranker erhalten bleiben.
- **FR-FOCUS-006 / P0:** Reload oder kurzzeitige Verbindungsunterbrechung darf die Sessionzeit nicht still verlieren oder duplizieren.
- **FR-FOCUS-007 / P1:** Freigegebene Hintergruende, Sounds und Fokusoptionen SOLLEN nutzerbezogen speicherbar sein.
- **FR-FOCUS-008 / P0:** Die UI MUSS `prefers-reduced-motion` respektieren und darf Konzentration nicht durch dekorative Bewegung stoeren.

**Abnahme:** Standard, Settings, Ereignis-Hover, Goal-Hintergrund, Pause und minimierter Zustand bilden einen durchgaengigen, persistierbaren Session-Flow.

### 6.6 Ziele

- **FR-GOAL-001 / P0:** Nutzer MUESSEN ein Goal ueber den dokumentierten mehrstufigen Onboarding-Flow anlegen koennen.
- **FR-GOAL-002 / P0:** Ein Goal MUSS Titel, Beschreibung, Motivation, Meilensteine, Rhythmus, Status und optionales Bild enthalten koennen.
- **FR-GOAL-003 / P0:** Onboarding-Zwischenstaende MUESSEN gespeichert oder ohne Datenverlust wiederaufnehmbar sein.
- **FR-GOAL-004 / P0:** Goal Overview, Timeline und Detailansicht MUESSEN Fortschritt, Kontext und naechste sinnvolle Handlung zeigen.
- **FR-GOAL-005 / P0:** Milestones MUESSEN geordnet, bearbeitet und mit Tasks verbunden werden koennen.
- **FR-GOAL-006 / P0:** Goal-bezogene Tasks und Blocks MUESSEN in Aufgaben- und Kalenderkontext sichtbar bleiben.
- **FR-GOAL-007 / P0:** Goal-Bearbeitung MUSS die dokumentierten Overlay-States abbilden.
- **FR-GOAL-008 / P1:** Archivierung und Wiederherstellung SOLLEN vor endgueltiger Loeschung bevorzugt werden.

**Abnahme:** Empty State, Onboarding, Success, Overview, Timeline, Detail und Edit-Overlays entsprechen den Figma-Vorgaben und erzeugen konsistente Datenbeziehungen.

### 6.7 Journal

- **FR-JOURNAL-001 / P0:** Check-in und Check-out MUESSEN als getrennte, aber zusammengehoerige Tagesablaeufe funktionieren.
- **FR-JOURNAL-002 / P0:** Journalfelder MUESSEN als echte, validierbare Eingabetypen umgesetzt werden, nicht als rein visuelle Textattrappen.
- **FR-JOURNAL-003 / P0:** Nutzer MUESSEN Journal-Templates auswaehlen, als Standard festlegen und bearbeiten koennen.
- **FR-JOURNAL-004 / P0:** Templates MUESSEN Check-in- und Check-out-Elemente getrennt strukturieren koennen.
- **FR-JOURNAL-005 / P0:** Der Template-Modal-Flow MUSS einspaltig, verstaendlich und aus vorhandenen Pattern-Library-Komponenten aufgebaut sein.
- **FR-JOURNAL-006 / P0:** Template-Elemente MUESSEN hinzugefuegt, bearbeitet, geordnet und entfernt werden koennen.
- **FR-JOURNAL-007 / P0:** Die Vorlagen in `04_content/journaling` dienen als Inhaltsquelle; ihre Darstellung folgt dem bestehenden Designsystem.
- **FR-JOURNAL-008 / P1:** Journal-Daten SOLLEN spaeter als nachvollziehbare Quelle fuer Insights dienen, ohne private Freitexte unnoetig zu analysieren.

**Abnahme:** Check-in, Check-out, Template-Uebersicht, Modal und Edit-Overlays entsprechen den Views; Eingaben sind tastaturbedienbar, validiert und persistent.

### 6.8 Insights

- **FR-INSIGHT-001 / P0:** Insights MUESSEN aus nachvollziehbaren, definierten Metriken erzeugt werden; jede Kennzahl braucht Datenquelle, Zeitraum und Berechnungsregel.
- **FR-INSIGHT-002 / P0:** Karten MUESSEN eine Aussage oder Handlungshilfe vermitteln und duerfen nicht nur dekorative Zahlen zeigen.
- **FR-INSIGHT-003 / P0:** Initiale Insights sollen Aufgabenaktivitaet, Zielerreichung und mindestens eine Fokus-/Zeitmetrik abbilden.
- **FR-INSIGHT-004 / P1:** Journaling-Konstanz, Stimmung/Energie, Category-Verteilung und produktive Tageszeiten SOLLEN nach ausreichender Datenbasis folgen.
- **FR-INSIGHT-005 / P0:** Bei unzureichender Datenmenge MUSS ein hilfreicher Empty-/Learning-State erscheinen statt einer irrefuehrenden Statistik.
- **FR-INSIGHT-006 / P0:** Zeitraumfilter MUESSEN konsistent und, soweit sinnvoll, in der URL abbildbar sein.
- **FR-INSIGHT-007 / P0:** Der Nutzer MUSS erkennen koennen, welche Aktivitaeten eine Metrik beeinflussen.

**Abnahme:** Die Insights-Seite entspricht der Designrichtung und jede dargestellte Zahl besitzt einen getesteten fachlichen Vertrag.

### 6.9 Einstellungen

- **FR-SET-001 / P0:** Einstellungen MUESSEN die Bereiche Allgemein, Kalender, Account, Abrechnung, Benachrichtigungen und Fokusmodus abbilden.
- **FR-SET-002 / P0:** Persoenliche Praeferenzen, Integrationen und Abrechnung MUESSEN klar getrennt sein.
- **FR-SET-003 / P0:** Formulare MUESSEN die Pattern-Library-Komponenten, Validierung, Save-Feedback und Error-Zustaende verwenden.
- **FR-SET-004 / P0:** Integrationen MUESSEN Verbindungs-, Sync-, Fehler- und Reconnect-Zustaende zeigen.
- **FR-SET-005 / P0:** Account-Sicherheitsaktionen MUESSEN dem Risiko entsprechende Bestaetigung und erneute Authentifizierung verwenden.
- **FR-SET-006 / P0:** Abrechnung MUSS Stripe Checkout/Portal, Tarifstatus, Rechnungen und Webhook-verifizierte Statusaenderungen abbilden.
- **FR-SET-007 / P1:** Theme-Auswahl kann vorbereitet werden; der erste Release muss mindestens das freigegebene Light Theme korrekt ausliefern.

**Abnahme:** Alle sechs Einstellungsviews funktionieren mit echten States und Daten; kein Formular basiert auf lokaler Attrappenlogik.

### 6.10 Authentifizierung, Account und E-Mail

- **FR-AUTH-001 / P0:** Registrierung, Login, Logout, Sessionverwaltung, E-Mail-Verifizierung und Passwort-Reset MUESSEN vorhanden sein.
- **FR-AUTH-002 / P0:** Sessions und Nutzerkonten MUESSEN ueber Better Auth und die eigene PostgreSQL-Datenbank verwaltet werden.
- **FR-AUTH-003 / P0:** Auth-E-Mails MUESSEN ueber Resend im Fokuna-Design versendet werden.
- **FR-AUTH-004 / P0:** Geschuetzte Routen und API-Endpunkte MUESSEN serverseitig autorisiert werden; UI-Ausblendung allein reicht nicht.
- **FR-AUTH-005 / P1:** Magic Link und Social Login SOLLEN gemaess Produktentscheidung ergaenzt werden.
- **FR-AUTH-006 / P2:** Passkeys und Zwei-Faktor-Authentifizierung bleiben vorbereitete Erweiterungen.

### 6.11 Admin-Anwendung

- **FR-ADMIN-001 / P1:** Eine separate interne Next.js-App SOLL Nutzer, Rollen, Sessions und wesentliche Betriebszustaende verwalten.
- **FR-ADMIN-002 / P1:** Admin-Funktionen MUESSEN dieselben Auth-, Service- und Auditregeln wie die Hauptanwendung verwenden.
- **FR-ADMIN-003 / P1:** Admin-UI darf gemeinsame Tokens und UI-Primitives verwenden, bleibt aber ein getrenntes App-Paket.

---

## 7. Designsystem und Pattern Library

### 7.1 Verbindliche Designquelle

- **DS-001 / P0:** Figma High-Fidelity-Views sind genaue visuelle Vorgaben, keine ungefaehren Referenzen.
- **DS-002 / P0:** Die korrespondierenden Uebergabenotizen beschreiben nicht sichtbare Logik und haben bei Verhaltensfragen Vorrang vor Vermutungen.
- **DS-003 / P0:** Vor dem Bau eines neuen Controls MUSS in Pattern Library und Figma nach einer bestehenden Komponente oder nahen Variante gesucht werden.
- **DS-004 / P0:** Fehlt eine benoetigte Komponente in der dokumentierten Pattern Library, MUSS vor der produktiven Neuerstellung Ruecksprache gehalten werden.

### 7.2 Tokens

- **DS-TOKEN-001 / P0:** Die gelieferten CSS-/JSON-/TypeScript-/Tailwind-Tokenexports werden als Ausgangspunkt integriert.
- **DS-TOKEN-002 / P0:** Produktkomponenten verwenden semantische Tokens wie `surface`, `text`, `icon`, `border`, `brand`, `category` und `priority-scale`.
- **DS-TOKEN-003 / P0:** Primitives duerfen nur in Tokenableitungen oder bewusst dokumentierten Ausnahmefaellen direkt verwendet werden.
- **DS-TOKEN-004 / P0:** Keine hartcodierten Hexwerte, Abstaende, Radien oder Shadows in finalen Komponenten, wenn ein passender Token existiert.
- **DS-TOKEN-005 / P0:** Light/Dark-Modi und spaetere Themes duerfen keine komponentenspezifischen Farbnamen erzwingen. `coral` und `teal` bleiben primitive Werte, semantische Rollen bleiben abstrakt.
- **DS-TOKEN-006 / P0:** Warm/`#FCF9F3` darf nicht neu als Produktfarbe eingefuehrt werden. Verbleibende Altwerte im Export sind vor Verwendung gegen den aktuellen Figma-Stand zu pruefen.

### 7.3 Typografie und Icons

- **DS-TYPE-001 / P0:** Geist ist die primaere UI-Schrift; Roboto Serif wird sparsam fuer Schmuckzeilen und redaktionelle Akzente verwendet.
- **DS-TYPE-002 / P0:** Fonts werden ueber `next/font` lokal oder offiziell bezogen, ohne sichtbaren Layout Shift.
- **DS-TYPE-003 / P0:** Standardtexte unterschreiten 12 px nicht.
- **DS-TYPE-004 / P0:** Buttons verwenden die definierte Semibold-Typografie.
- **DS-ICON-001 / P0:** Ausschliesslich die gelieferten Fokuna-SVG-Icons werden fuer produktive UI-Icons verwendet, sofern kein fachlich notwendiges Icon fehlt.
- **DS-ICON-002 / P0:** Dateiname und Metadaten zu Size, Stroke, Radius, Fill und Join bleiben nachvollziehbar; die App exponiert eine semantische Icon-Komponente statt Dateipfade in Feature-Code zu verteilen.
- **DS-ICON-003 / P0:** Icons auf farbigen Category-Flächen verwenden den vorgesehenen inversen Icontext.

### 7.4 Control-Groessen und Layout

- **DS-SIZE-001 / P0:** Controls ordnen sich in die Hoehenleiter 28, 32, 40 und 48 px ein.
- **DS-SIZE-002 / P0:** Elemente in derselben horizontalen Reihe verwenden korrespondierende Groessen und Hoehen.
- **DS-SIZE-003 / P0:** Das 8px-Raster ist Basis fuer Layout und Spacing; kleine optische Werte duerfen begruendete Teilwerte verwenden.
- **DS-LAYOUT-001 / P0:** Desktop-Layouts beruecksichtigen die 64px Sidebar getrennt vom Content-Grid.
- **DS-LAYOUT-002 / P0:** Das definierte 12-Spalten-Grid, Content-Gutter und Seitenraender werden fuer vergleichbare Desktop-Views konsistent angewendet.

### 7.5 Komponenten-Uebersichtsseite: erstes Phase-Gate

Vor dem Aufbau der Produktmodule MUSS eine einfache, technisch nutzbare Pattern-Library-Uebersichtsseite entstehen.

Anforderungen:

- **DS-CAT-001 / P0:** Die Seite listet alle Basis- und produktnahen Komponenten gruppiert auf.
- **DS-CAT-002 / P0:** Jede Komponente zeigt Name, kurze Funktion, Varianten, Groessen und interaktive States.
- **DS-CAT-003 / P0:** States sind bedienbar oder gezielt umschaltbar; Screenshots allein reichen nicht.
- **DS-CAT-004 / P0:** Light/Dark-Hintergruende und relevante Surface-Kontexte sind pruefbar, auch wenn Dark noch nicht Release-Umfang ist.
- **DS-CAT-005 / P0:** Tastaturfokus, Disabled, Loading, Error und Reduced Motion sind sichtbar pruefbar, wenn fuer die Komponente relevant.
- **DS-CAT-006 / P0:** Die Seite wird bei jeder neuen oder geaenderten Komponente aktualisiert.
- **DS-CAT-007 / P0:** Der Komponenten-Katalog ist in Entwicklung und Staging erreichbar; ein oeffentlicher Produktionszugang ist nicht erforderlich.
- **DS-CAT-008 / P0:** Keine zusaetzliche Component-Explorer-Dependency wird ohne Zustimmung eingefuehrt. Der erste Katalog kann als interne Next.js-Route umgesetzt werden.

Mindestens abzudecken:

- Button, Callout, Cards/Slots/Modal
- Calendar Drawer und Calendar Items fuer Task, Import und Block
- Checkbox, Radiobox, Switch, Slider
- Breadcrumb, Switcher, Tabs, Tab Bar, Toggle Group
- Form, Input Field, Input Group, Date Picker, Dropdown, Search Field, Filter Bar
- Tags, Sidebar, Page Header, UI Shell
- Task Add Item, Task/Milestone Group Header, Task/Milestone List Item und Task Groups
- Aufgaben Modal Header, rechtes Modal-Menue und Task Slot

**Phase-1-Abnahme:** Kein Produkt-View wird freigegeben, bevor seine verwendeten Basis-Komponenten im Katalog vorhanden, tokengebunden, responsive und state-vollstaendig sind.

---

## 8. Interaktion, Motion und Drag-and-drop

### 8.1 Motion-System

- **UX-MOTION-001 / P0:** Animationen sind hochwertig, smooth und unaufgeregt.
- **UX-MOTION-002 / P0:** Wiederkehrende Interaktionstypen verwenden zentrale Motion-Tokens fuer Dauer, Easing und ggf. Spring-Konfiguration.
- **UX-MOTION-003 / P0:** Motion verdeutlicht Hierarchie, Zustand oder raeumliche Beziehung; rein dekorative Bewegung ist zu vermeiden.
- **UX-MOTION-004 / P0:** `prefers-reduced-motion` MUSS zentral respektiert werden. Transform-/Layoutbewegung wird reduziert oder durch Opacity-/Farbwechsel ersetzt.
- **UX-MOTION-005 / P0:** Animationen duerfen keine Layoutspruenge, Input-Verzoegerung oder blockierte Interaktion erzeugen.

Die konkreten Motion-Tokens werden in Phase 1 aus Figma-Verhalten, UX-Familien und technischen Tests festgelegt. Prototyping-Millisekunden aus Figma sind keine automatische Produktionsvorgabe.

### 8.2 Drag-and-drop-Anforderungen

Die MVP-Datei `05_mvp_learnings/DRAG_AND_DROP_HANDOFF-1.md` ist eine wichtige Lernquelle. Ihr Codeaufbau ist nicht automatisch bindend; die folgenden Verhaltensergebnisse sind jedoch P0:

- **UX-DND-001:** Original, Placeholder und Drag-Ghost behalten kongruente Groesse und Form.
- **UX-DND-002:** Reorder aktualisiert die sichtbare Reihenfolge waehrend des Ziehens; beim Drop darf kein Zurueckspringen auftreten.
- **UX-DND-003:** Cross-Container- und Zonenwechsel zeigen genau einen eindeutigen Zielzustand.
- **UX-DND-004:** Serverpersistenz ist optimistisch, besitzt Rollback und erzeugt nach Erfolg kein Refetch-Flackern.
- **UX-DND-005:** Drag-Start kollidiert nicht mit Buttons, Inputs, Menues oder Textauswahl innerhalb eines Items.
- **UX-DND-006:** Maus, Touch und Tastatur bzw. eine gleichwertige Nicht-Drag-Alternative werden beruecksichtigt.
- **UX-DND-007:** Empty-, Overflow-, Scroll- und ungueltige Drop-Zustaende sind getestet.
- **UX-DND-008:** Kalender-DnD und Listen-DnD koennen unterschiedliche Engines nutzen, muessen aber dieselbe visuelle Sprache sprechen.

Empfohlene technische Richtung: dnd-kit ausserhalb des Kalenders; FullCalendar-eigene Drag-/Resize-Funktionen innerhalb des Kalenders; geteilte Fokuna-Surfaces und Tokens fuer Ghosts/Placeholder.

---

## 9. Accessibility und inklusive Bedienung

- **A11Y-001 / P0:** Ziel ist WCAG 2.2 AA fuer zentrale Flows.
- **A11Y-002 / P0:** Alle interaktiven Elemente besitzen Name, Rolle, Wert und nachvollziehbare Fokusreihenfolge.
- **A11Y-003 / P0:** Keyboard-Fokus verwendet ausschliesslich die dafuer vorgesehenen Focus-Tokens und bleibt sichtbar sowie nicht verdeckt.
- **A11Y-004 / P0:** Icon-only Controls besitzen ein zugängliches Label und ausreichende Hit Area.
- **A11Y-005 / P0:** Informationen werden nicht ausschliesslich ueber Farbe vermittelt.
- **A11Y-006 / P0:** Text- und Non-Text-Kontraste werden fuer alle produktiven Theme-/State-Kombinationen automatisiert und manuell geprueft.
- **A11Y-007 / P0:** Formulare verknuepfen Label, Beschreibung und Fehler; Fehler werden programmatisch und visuell vermittelt.
- **A11Y-008 / P0:** Modals verwalten Fokus, Escape, Return-Fokus und Hintergrundinertness korrekt.
- **A11Y-009 / P0:** Dragging besitzt eine Alternative ohne komplexe Zeigerbewegung.
- **A11Y-010 / P0:** Reduced Motion wird zentral umgesetzt und getestet.

Die sichtbaren Controls duerfen kompakter als 44 px sein, wenn ihre tatsaechliche Target-/Spacing-Loesung WCAG 2.2 einhaelt und die dichte Desktop-Nutzung nicht beeintraechtigt.

---

## 10. Technische Zielarchitektur

### 10.1 Verbindlicher Stack

- Next.js App Router, React und TypeScript
- pnpm Monorepo
- Vercel
- Neon PostgreSQL in EU-Region mit Connection Pooling
- Drizzle ORM
- Better Auth und Resend
- Tailwind CSS, shadcn/ui und Radix als technische Basis
- Fokuna Design Tokens und eigene SVG-Icons
- Motion fuer Animationen
- dnd-kit ausserhalb des Kalenders
- FullCalendar Standard mit React-Adapter
- date-fns, Luxon und rrule mit klar getrennten Rollen
- Zod, React Hook Form, TanStack Query
- Zustand nur bei echtem globalem UI-State-Bedarf
- Google Calendar API, Microsoft Graph und AccuWeather
- Stripe Billing
- S3 in EU-Region, spaeter optional CloudFront
- Sentry, PostHog, Vitest und Playwright
- Vercel Cron; Upstash Redis/QStash erst bei nachgewiesenem Bedarf

Versionen werden beim Bootstrap auf aktuelle, untereinander kompatible stabile Releases gepinnt und im Lockfile festgehalten. Das PRD schreibt keine Version fest, die vor Implementierungsbeginn veralten kann.

### 10.2 Empfohlene Monorepo-Struktur

```text
apps/
  web/                 # Hauptanwendung und Pattern-Library-Route
  admin/               # internes Admin-Backend
  worker/              # nur falls Hintergrundarbeit die Web-App uebersteigt
packages/
  ui/                  # Fokuna-Komponenten und UI-Primitives
  tokens/              # generierte Token-Artefakte und Theme-Bridge
  icons/               # typisierte zentrale Icon-Exports
  domain/              # Domaenenmodelle und reine Geschaeftsregeln
  api-contracts/       # Zod-Schemas und stabile HTTP-Vertraege
  db/                  # Drizzle-Schema, Migrations und DB-Zugriff
  config/              # gemeinsame TypeScript-, Lint- und Testkonfiguration
```

Die genaue Struktur darf beim Bootstrap angepasst werden, sofern diese Grenzen erhalten bleiben:

- Feature-UI importiert Domaenenlogik, implementiert sie aber nicht nebenbei.
- Gemeinsame UI-Komponenten liegen nicht in einzelnen Feature-Ordnern.
- API-Vertraege sind nicht an React-Komponenten gebunden.
- Datenbankzugriff findet nicht direkt aus Client-Komponenten statt.

### 10.3 API-first

- **ARCH-API-001 / P0:** Zentrale Produktfunktionen werden ueber stabile HTTP-Endpunkte fuer spaetere native Clients erreichbar.
- **ARCH-API-002 / P0:** Der fachliche Weg lautet `Route Handler -> Service -> Repository/Drizzle -> PostgreSQL`.
- **ARCH-API-003 / P0:** Server Components duerfen dieselbe Service-Schicht direkt verwenden, statt interne Route Handler per HTTP aufzurufen.
- **ARCH-API-004 / P0:** Request-, Response- und Webhook-Payloads werden mit Zod validiert.
- **ARCH-API-005 / P0:** Autorisierung erfolgt in der Service-/API-Schicht fuer jedes geschuetzte Objekt.
- **ARCH-API-006 / P0:** Externe API-Vertraege erhalten eine nachvollziehbare Versionierungsstrategie, bevor native Clients angebunden werden.

### 10.4 State Ownership

- Serverdaten: TanStack Query und serverseitige Services.
- Formularzustand: React Hook Form plus Zod.
- Teilbare Ansichtszustaende: URL Search Params.
- Lokaler Interaktionszustand: React State.
- Globaler UI-Zustand: Zustand nur fuer wenige appweite, nicht serverpersistente Faelle.
- Persistente fachliche Zustaende duerfen nicht ausschliesslich in Zustand oder Browser Storage leben.

Optimistische Updates brauchen fuer jede Mutation:

1. Snapshot oder deterministischen Rueckweg.
2. Sofortige lokale Rueckmeldung.
3. Serverpersistenz.
4. Fehler-Rollback und Nutzerhinweis.
5. Keine unnoetige Invalidierung, die sichtbar flackert.

### 10.5 Kalender- und Zeitlogik

- date-fns: allgemeine Datumsoperationen und Darstellung.
- Luxon: explizite Zeitzonen- und Offsetlogik, wenn native Date-APIs nicht genuegen.
- rrule: Wiederholungsregeln und Ausnahmen.
- FullCalendar: Kalenderdarstellung und Kalenderinteraktion, nicht externe Synchronisationswahrheit.

Ein verbindliches Timezone-/Recurrence-Konzept ist vor der ersten Kalenderpersistenz als technische Entscheidung zu dokumentieren.

### 10.6 Externe Integrationen

- OAuth-Tokens werden serverseitig verschluesselt und nie an Client-Code ausgegeben.
- Webhooks werden signaturgeprueft, idempotent verarbeitet und beobachtbar gemacht.
- Calendar Sync benoetigt Cursor/Delta, Konfliktstrategie, Retry und Reconnect-Zustand.
- Stripe ist von Auth entkoppelt; der Webhook ist Quelle fuer Abonnementstatus.
- S3-Zugriffe erfolgen ueber kurzlebige signierte URLs und serverseitige Berechtigungspruefung.
- AccuWeather-Daten werden gecacht und mit klarer Aktualitaet dargestellt.

---

## 11. Datenschutz, Sicherheit und Betrieb

- **SEC-001 / P0:** Personenbezogene Daten und Primaerdaten werden in EU-Regionen verarbeitet, soweit der Dienst dies ermoeglicht.
- **SEC-002 / P0:** Secrets liegen ausschliesslich in sicherer Umgebungs-/Secretverwaltung, nie im Repository oder Clientbundle.
- **SEC-003 / P0:** Auth-, Billing-, Upload- und Integrationsendpunkte besitzen Rate Limits bzw. Missbrauchsschutz nach Risiko.
- **SEC-004 / P0:** Eingaben werden serverseitig validiert; Datenzugriff ist objektbezogen autorisiert.
- **SEC-005 / P0:** Webhooks sind signaturgeprueft und idempotent.
- **SEC-006 / P0:** Regelmaessige PostgreSQL-Backups werden unabhaengig von Neon in einem separaten S3-Bucket gehalten und Wiederherstellung wird getestet.
- **SEC-007 / P0:** Logging darf keine Passwoerter, Tokens, privaten Journalfreitexte oder vollstaendigen Zahlungsdaten enthalten.
- **SEC-008 / P0:** Datenexport, Accountloeschung, Aufbewahrung und Datenschutztexte werden vor oeffentlichem Launch fachlich spezifiziert.

Sentry und PostHog werden mit Datenminimierung, Environment-Trennung und Consent-/Datenschutzkonzept integriert.

---

## 12. Performance, Zuverlaessigkeit und Beobachtbarkeit

### 12.1 Performance

- Core Web Vitals `good` am 75. Perzentil: LCP <= 2,5 s, INP <= 200 ms, CLS <= 0,1.
- Keine unnoetigen Client Components; Interaktivitaet wird auf erforderliche Inseln begrenzt.
- Listen, Kalender und Insights laden inkrementell und vermeiden blockierende Vollseitenabfragen.
- Fonts, Bilder und Goal-/Focus-Hintergruende werden optimiert und dimensionsstabil ausgeliefert.
- Pattern Library und Produktviews erhalten keine grossen ungenutzten Icon-/Component-Bundles.
- Drag-, Resize- und Timerinteraktionen bleiben auch bei realistischen Datenmengen fluessig.

### 12.2 Zuverlaessigkeit

- Kritische Mutationen sind idempotent oder gegen Doppelausfuehrung geschuetzt.
- Fokus-Timer basiert auf Zeitpunkten, nicht auf einem unzuverlaessigen Client-Interval als Wahrheit.
- Sync- und Webhook-Jobs besitzen Retry mit Begrenzung sowie sichtbare Fehlerzustaende.
- Fehlergrenzen verhindern, dass ein einzelnes Widget den gesamten View unbrauchbar macht.
- Datenbankmigrationen sind reproduzierbar und werden vor Produktion gegen eine Staging-Kopie getestet.

### 12.3 Beobachtbarkeit

- Sentry: Errors, Traces, Releases und Source Maps.
- PostHog: definierte Produkt-Events, Funnels und Feature-Auswertung; keine wahllose Eventflut.
- Strukturierte Serverlogs mit Request-/Job-Korrelation.
- Gesundheitschecks fuer Web, Datenbank, Webhooks und relevante Worker.
- Alerts fuer Auth-Ausfaelle, Sync-Rueckstau, Billing-Webhook-Fehler und erhoehte Serverfehlerraten.

---

## 13. Teststrategie und Qualitaetsgates

### 13.1 Testpyramide

- **Unit:** Domaenenregeln, Berechnungen, Recurrence, Insight-Metriken, DnD-Layoutfunktionen.
- **Integration:** Service plus Datenbank, Auth/Authorization, Webhooks, Sync-Konflikte, Formvalidierung.
- **Component:** States und Interaktion der Pattern-Library-Komponenten.
- **E2E:** Kritische Nutzerfluesse mit Playwright.
- **Visual Regression:** Pattern-Library-Zustaende und zentrale Views gegen freigegebene Baselines.
- **Accessibility:** automatisierte Checks plus manuelle Tastatur-/Screenreader-Stichproben.

### 13.2 Kritische E2E-Flows

Mindestens:

1. Registrierung/Verifizierung/Login/Reset.
2. Goal-Onboarding bis Goal-Detail.
3. Task erstellen, gruppieren, bearbeiten, abschliessen und verschieben.
4. Block erstellen, konfigurieren und im Kalender planen.
5. Kalender-Event verschieben/resizen inklusive Fehler-Rollback.
6. Fokus Session starten, pausieren, minimieren, wieder oeffnen und beenden.
7. Journal Check-in und Check-out mit Template.
8. Template bearbeiten und als Standard setzen.
9. Kalenderintegration verbinden, Fehler anzeigen und reconnecten.
10. Stripe Checkout/Portal und Webhook-basierter Statuswechsel.

### 13.3 Drag-and-drop-Regressionen

- DOM-Reihenfolge wird vor Drop sichtbar aktualisiert.
- Original-, Placeholder- und Ghost-Masse stimmen ueberein.
- Cross-Container-Move ist persistent.
- Timeline-Drop landet an korrekter Zeitposition.
- Zone-Placeholder und Ghost erscheinen nie doppelt.
- Failed Mutation rollt ohne Datenverlust und mit Erklaerung zurueck.
- Empty-/Overflow-/Scroll- und Keyboard-Alternative funktionieren.

### 13.4 Definition of Done pro Feature

Ein Feature ist erst fertig, wenn:

- Anforderungen und Akzeptanzkriterien erfuellt sind.
- Bestehende Pattern-Library-Komponenten verwendet oder begruendet erweitert wurden.
- Neue/veraenderte Komponenten im Komponenten-Katalog dokumentiert sind.
- Loading, Empty, Error, Disabled und Focus beruecksichtigt sind, soweit relevant.
- Accessibility, Responsive und Reduced Motion geprueft sind.
- Unit-/Integration-/E2E-Tests dem Risiko entsprechen.
- Telemetrie und Fehlerbeobachtung definiert sind.
- Keine sensiblen Daten geloggt werden.
- Der im Projekt-Repository gefuehrte Changelog und relevante technische Entscheidungen aktualisiert sind, sofern die Aenderung dies erfordert.
- Figma-Abgleich und Review abgeschlossen sind.

---

## 14. Umsetzungsphasen

### Phase 0: Discovery, Bootstrap-Entscheidungen und Repository

**Ziel:** Reproduzierbares Entwicklungsfundament ohne Produkt-UI-Schnellschuesse.

Lieferumfang:

- pnpm Monorepo mit Web-, Admin- und Shared-Package-Struktur.
- Aktuelle kompatible Versionen des genehmigten Stacks, Lockfile und Runtime-Vorgaben.
- TypeScript strict, Linting, Formatting, Test Runner und CI-Grundlage.
- Environment-Schema und dokumentierte lokale Einrichtung.
- Git-/Branch-/Commit-Konvention sowie Anlage des Projekt-Changelogs im neuen Repository.
- Technische Entscheidungen fuer API-Grenzen, Zeitzonen und Token-Generierung.

**Gate:** Frischer Checkout kann mit dokumentierten Befehlen installiert, getestet und gestartet werden.

### Phase 1: Designsystem, Tokens und Pattern Library

**Owner:** Modell/Agent mit direktem Zugriff auf die Figma-Datei.

**Ziel:** Hochwertige, vollstaendige Frontend-Basis, auf der alle spaeteren Views konsistent aufgebaut werden.

Reihenfolge:

1. Tokenexport pruefen und in `packages/tokens` integrieren.
2. Geist und Roboto Serif laden; Typografieklassen und -komponenten validieren.
3. Fokuna Icon-Paket typisiert integrieren.
4. Radix-/shadcn-Primitives visuell vollstaendig in Fokuna-Komponenten ueberfuehren.
5. Basis-Controls in den vier Groessen und dokumentierten States bauen.
6. Komplexe Patterns und Produktkomponenten auf den Basiskomponenten aufbauen.
7. Interne Pattern-Library-Uebersichtsseite erstellen.
8. Visuelle, responsive und Accessibility-Abnahme gegen Figma.

**Pflichtlieferungen:**

- `packages/tokens`, `packages/icons`, `packages/ui`.
- Katalogroute mit allen dokumentierten Komponenten und States.
- Zentralisierte Motion-, Focus-, Shadow- und Control-Size-Logik.
- Tests und visuelle Baselines.
- Kurze Komponentenbeschreibungen und Prop-/State-Vertraege.

**Handoff-Gate an Folgeagent:**

- Der Folgeagent baut Produktviews ausschliesslich aus der freigegebenen UI-Bibliothek.
- Alle Imports und Exports sind stabil und dokumentiert.
- Keine hardcodierten Figma-Werte sind fuer Standardkomponenten notwendig.
- Bekannte Designabweichungen sind explizit aufgelistet und freigegeben.

### Phase 2: App Shell, Auth, API- und Datenfundament

- App Shell, Navigation, Page Header und globale Statusmuster.
- Better Auth, Resend und geschuetzte Routen.
- Neon/Drizzle, Migrationen, Service-Schicht und API-Vertraege.
- Sentry/PostHog-Basis, Datenschutzkonfiguration und CI/CD.
- Account-/Allgemein-Grundlagen und File-Upload-Fundament.

### Phase 3: Operatives Zentrum

- Aufgabenlisten, Task-Modal, Gruppen und Subtasks.
- Blocks, Block-Templates und Bearbeitungs-Overlays.
- Kalenderdarstellung, Planung, Drag/Resize und Zeitlogik.
- Kritische optimistische Updates und DnD-Qualitaetsgate.

### Phase 4: Ziele, Fokus und Journal

- Goal-Onboarding, Overview, Timeline, Detail und Edit.
- Fokusmodus mit Sessionpersistenz, Pause und minimiertem Status.
- Journal Check-in/Check-out, Templates und Template-Editor.
- Inhalte aus den bereitgestellten Journal- und Bildressourcen.

### Phase 5: Insights, Integrationen, Billing und Admin

- Metrikvertraege und Insights.
- Google-/Microsoft-Kalendersync und AccuWeather.
- Stripe Billing und Customer Portal.
- Benachrichtigungen und Fokus-Einstellungen.
- Internes Admin-Backend.

### Phase 6: Production Hardening und Launch

- Vollstaendige E2E-, Visual- und Accessibility-Abnahme.
- Performance- und Lasttests fuer kritische Listen, Kalender und API-Endpunkte.
- Backup-/Restore-Test, Security Review und Datenschutzabnahme.
- Observability-Dashboards, Alerts und Runbooks.
- Datenmigration aus dem MVP nur, falls separat spezifiziert und freigegeben.
- Rollback-, Incident- und Release-Prozess.

---

## 15. Zusammenarbeit, Git und Dokumentation

- Git und GitHub werden regelmaessig verwendet; Commits sind fachlich geschnitten und professionell benannt.
- Relevante Meilensteine werden gepusht; keine langen, ungesicherten lokalen Arbeitsphasen.
- Pull Requests beschreiben Problem, Loesung, Testnachweis, visuelle Aenderung und Risiken.
- Abhaengigkeiten ausserhalb des festgelegten Stacks brauchen vor Installation einen Ein-Satz-Nutzen und Zustimmung.
- Temporäre Debug-Dokumente und veraltete Tests werden entfernt; dauerhafte Erkenntnisse gehoeren in Changelog, ADR oder passende Spezifikation.
- Zu Beginn der Umsetzung wird im neuen Projekt-Repository ein kompakter `CHANGELOG.md` angelegt und bei relevanten Aenderungen kurz aktualisiert. Er ist kein Bestandteil dieses PRD-Uebergabepakets.

### 15.1 Changelog-Regel fuer die Umsetzung

Der Changelog wird erst mit dem Projekt-Setup angelegt. Ein Eintrag umfasst wenige Saetze und nennt nur:

- Datum und Bereich.
- Relevante Aenderung oder Entscheidung.
- Aufgetretenes Problem und Loesung bzw. offenen Status, falls bemerkenswert.

Der Changelog ersetzt weder Git-Historie noch Issue-Tracker.

---

## 16. Risiken und Gegenmassnahmen

| Risiko | Auswirkung | Gegenmassnahme |
|---|---|---|
| Figma und Code driften auseinander | inkonsistente UI, teure Nacharbeit | Pattern-Library-Gate, visuelle Regression, Figma-Abnahme |
| Komponenten werden pro View dupliziert | fragmentiertes Designsystem | `packages/ui`, Katalogpflicht, Review-Regel |
| DnD springt oder flackert | zentrale UX wirkt unprofessionell | MVP-Learnings, Shared DnD Layer, dedizierte Regressionstests |
| Kalender-Sync erzeugt Duplikate/Konflikte | Vertrauensverlust und Datenfehler | Idempotenz, Delta-Sync, Konfliktmodell, Observability |
| Timer haengt am Browserintervall | falsche Fokuszeiten | server-/timestamp-basierter Zustand und Recovery |
| Tokenexport enthaelt Altwerte | visuelle Inkonsistenz | Phase-1-Audit gegen aktuellen Figma-Stand |
| Zu viele Bibliotheken ueberlappen | Bundle-/Wartungsprobleme | klare Rollen, keine neue Dependency ohne Zustimmung |
| Insights sind dekorativ oder falsch | geringer Produktwert | getestete Metrikvertraege und Datenherkunft |
| Subtile UI unterschreitet Kontrast | Accessibility- und Nutzungsprobleme | automatisierte Kontrastchecks plus visuelle Abnahme |
| Backendlogik landet in React | spaetere native Clients werden teuer | Service-/API-Grenzen und Architekturtests |
| Unklare Loeschsemantik | Datenverlust | Archiv/Undo/Confirm je Objekt explizit definieren |

---

## 17. Offene Produktentscheidungen

Diese Punkte sind nicht stillschweigend zu erfinden. Sie werden spaetestens vor der betroffenen Phase entschieden:

1. Exakter Release-Umfang von Magic Link, Social Login, Passkeys und 2FA.
2. Pricing, Tarife, Trial, Entitlements und Billing-Zustaende.
3. Team-/Sharing-Funktionen oder bewusst rein persoenliches Produkt.
4. Exakte Loesch-, Archiv- und Restore-Regeln je Domaenenobjekt.
5. Welche Calendar Views P0 und welche P1 sind.
6. Konfliktstrategie fuer externe Zwei-Wege-Kalendersynchronisation.
7. Quelle, Lizenz und Offlineverhalten fuer Fokusmusik/Ambient Sounds.
8. Umfang des ersten Theme-Supports und Dark-Mode-Release.
9. Fachliche Definition aller initialen Insight-Metriken.
10. Benachrichtigungskanaele, Frequenzen und Opt-in-Logik.
11. Datenexport, Aufbewahrung und Accountloeschprozess.
12. Umgang mit bestehenden MVP-Daten und moeglicher Migration.
13. Primaere UI-Sprache und Zeitplan fuer weitere Sprachen.

Offene Punkte blockieren nicht das Designsystem-Fundament, solange keine irreversible Annahme getroffen wird.

---

## 18. Quelldokumente und Ressourcen

Alle Pfade sind relativ zu diesem Dokument in `06_prd`.

### Produkt, UX und Design

- [UX-Informationsarchitektur](../00_ui_ux/00_UX/00_Fokuna_UX_Informationsarchitektur_Lastenheft.md)
- [Pattern-Library-Uebersicht](../00_ui_ux/01_Pattern-Library/00_Fokuna_Pattern_Library_Uebersicht.md)
- [Design-Handoff](../00_ui_ux/02_Views/00_Fokuna_Design_Handoff_Lastenheft.md)
- View-/Uebergabenotiz-Paare unter `../00_ui_ux/02_Views/`
- Figma `UI Design | Fokuna`, File Key `ltQMlboZomvr70Z4m0aLQj`

### Tokens und Assets

- [Token-README](../00_ui_ux/03_Tokens/README.md)
- Tokenartefakte unter `../00_ui_ux/03_Tokens/tokens/`
- Tailwind-Bridge unter `../00_ui_ux/03_Tokens/tailwind/`
- Icons und Bilder unter `../03_ressources/`
- Journalinhalte unter `../04_content/journaling/`

### Technik und Regeln

- [Technologiestack](../01_tech_stack/fokuna-technologiestack.md)
- [Projektregeln](../02_rules/rules.md)
- [MVP Drag-and-drop Learnings](../05_mvp_learnings/DRAG_AND_DROP_HANDOFF-1.md)

### Aktuelle externe Referenzen

- [Next.js Production Checklist](https://nextjs.org/docs/app/guides/production-checklist)
- [Tailwind Theme Variables](https://tailwindcss.com/docs/theme)
- [shadcn/ui Monorepo](https://ui.shadcn.com/docs/monorepo)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Motion Reduced Motion](https://motion.dev/docs/react-use-reduced-motion)
- [FullCalendar Event Dragging & Resizing](https://fullcalendar.io/docs/event-dragging-resizing)
- [Core Web Vitals](https://web.dev/articles/vitals)

---

## 19. Startfreigabe

Die Umsetzung beginnt mit Phase 0 und Phase 1. Vor dem Aufbau fachlicher Produktviews werden Repository, Tokens, Schriften, Icons, Motion-/Focus-Grundlagen und die vollstaendige Pattern Library sauber integriert. Der erste sichtbare Meilenstein ist nicht ein halbfertiger Produkt-Screen, sondern eine hochwertige, interaktive Komponenten-Uebersichtsseite, die alle spaeteren Frontend-Module verlaesslich traegt.

Nach Abnahme dieses Meilensteins wird die Arbeit an den dedizierten Folgeagenten fuer Produktaufbau und Backendlogik uebergeben. Das Phase-1-Handoff muss so sauber sein, dass dieser Agent keine Figma-Werte neu interpretieren oder Basis-Controls duplizieren muss.
