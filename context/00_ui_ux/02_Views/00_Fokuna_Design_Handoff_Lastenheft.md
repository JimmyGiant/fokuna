# Fokuna Design Handoff

Stand: 18. Juli 2026  
Quelle: Figma-Datei `UI Design | Fokuna`, exportierte View-/Uebergabenotiz-Screenshots und Designsystem-Kontext

## Zweck Dieses Dokuments

Dieses Dokument ergaenzt die exportierten Layouts und Uebergabenotizen. Es wiederholt bewusst nicht jede sichtbare Information aus den Screens, sondern beschreibt die Produktidee, Designlogik, Systematik und impliziten Entscheidungen, die fuer weitere Agenten, Designer und technische Folgekonversationen wichtig sind.

Das Paket besteht aus:

- den exportierten PNG-Paaren aus View und korrespondierender Uebergabenotiz,
- der Figma-Datei als gestalterische Quelle,
- diesem Markdown als konzeptioneller Design-Handoff.

Animationszeiten, Millisekundenangaben und technische Implementierungsdetails sind hier bewusst ausgeklammert. Relevant ist vor allem, wie Screens zusammenhaengen, welche UX-Absicht dahintersteht und welche Designregeln eingehalten werden sollen.

## App-Beschreibung

Fokuna ist eine ruhige, strukturierte Productivity-SaaS-Anwendung, die Aufgabenplanung, Zielarbeit, Zeitblock-Organisation, Fokusmodus, Journaling, Kalender und persoenliche Insights in einem zusammenhaengenden Arbeitsraum verbindet. Die App soll Nutzer dabei unterstuetzen, Ziele in konkrete Aufgaben und Zeitbloecke zu uebersetzen, konzentrierte Arbeitssessions durchzufuehren, den eigenen Fortschritt zu reflektieren und wiederkehrende Muster sichtbar zu machen. Der gestalterische Anspruch ist klar, hochwertig und produktiv: nicht verspielt, nicht laut, sondern fokussiert, freundlich und verlaesslich.

## Produktlogik

Fokuna folgt aus Designsicht einer einfachen Kette:

1. Ziele geben Richtung.
2. Aufgaben und Blocks machen die Richtung planbar.
3. Kalender und Fokusmodus machen Arbeit zeitlich konkret.
4. Journal Check-in und Check-out machen Absicht und Reflexion sichtbar.
5. Insights verdichten Fortschritt, Aktivitaet und Muster.
6. Einstellungen steuern Integrationen, Verhalten und persoenliche Praeferenzen.

Diese Kette ist wichtiger als einzelne Features. Neue Screens, Komponenten oder Flows sollten diese Logik nicht aufbrechen, sondern staerken.

## Gestalterischer Charakter

Fokuna soll wie ein modernes SaaS-Produkt im Productivity-Kontext wirken:

- ruhig, klar und arbeitsorientiert,
- freundlich durch weiche Flaechen, helle Hintergruende und dezente Schatten,
- praezise durch konsistente Groessen, 8px-Raster und klare Komponentenhierarchie,
- nicht marketinghaft, nicht ueberdekoriert,
- farblich reduziert mit gezielten Akzenten fuer Handlung, Status und Kategorisierung.

Der visuelle Schwerpunkt liegt auf Arbeitsflaechen, Listen, Karten, Formularen, Overlays und Zustandswechseln. Illustrative oder stark dekorative Elemente sollen nur eingesetzt werden, wenn sie einem echten Verstaendnisgewinn dienen.

## Designsystem-Grundlagen

### Farben

Das Farbsystem ist tokenbasiert aufgebaut. Primitives dienen als Skalen, gemappte Tokens beschreiben die Verwendung im Interface. Fuer die technische Weiterfuehrung ist wichtig: Komponenten sollen nicht direkt ueber zufaellige HEX-Werte gespeist werden, sondern ueber semantische Tokens.

Kernausrichtung:

- `coral` als warmer Brand-/Action-Akzent,
- `teal` als ruhiger produktiver Akzent und primaerer Interaktionsfarbton vieler UI-Zustaende,
- `grey` als neutrales Fundament fuer Text, Border, Flaechen und Interface-Struktur,
- `category` Farben fuer nutzerwaehlbare Block-/Tag-/Kategorie-Differenzierung,
- `priority` Farben fuer Aufgabenprioritaeten.

Die Category-Farben sind nicht als Brand-Farben zu verstehen. Sie dienen der visuellen Differenzierung von Bloecken, Tags und persoenlichen Kategorien. Sie sollten deshalb themenfaehig, aber nicht dominant eingesetzt werden.

### Text-, Icon-, Border- und Surface-Tokens

Die Farbvariablen sind bewusst nach Einsatzbereichen gegliedert:

- `text` fuer Schrift,
- `icon` fuer Icon-Strokes und Icon-Fills,
- `border` bzw. `stroke` fuer Linien und Umrandungen,
- `surface` fuer Flaechen.

Wenn mehrere UI-Bestandteile denselben visuellen Wert tragen muessen, sollte trotzdem der passende semantische Token verwendet werden. Beispiel: Ein Button kann in Text, Icon, Border und Surface denselben Farbton zeigen, aber die Bindung bleibt je Element semantisch korrekt. Das erleichtert spaetere Themes.

### Typografie

Die App nutzt:

- `Geist` fuer UI, Body, Label und produktnahe Oberflaechen,
- `Geist Bold/Semi Bold` fuer Betonung, Buttons, Headline- und Label-Hierarchien,
- `Roboto Serif` fuer Schmuckzeilen, emotionale Dachzeilen und besondere Zitat-/Statement-Momente.

Die Typografie wurde bewusst groesser und lesbarer angelegt als in fruehen Iterationen. Die kleinsten frueheren Groessen wurden angehoben. Neue UI-Elemente sollen nicht wieder auf 8px oder 10px Textgroessen zurueckfallen. Die kleinsten Standardtexte beginnen im aktuellen System bei `12px`; typische Interface-Groessen liegen bei `12px`, `14px`, `16px` und darueber.

Schmuckzeilen sollen sparsam eingesetzt werden. Sie sind kein Ersatz fuer normale Labels oder Headlines, sondern dienen als kleine emotionale oder redaktionelle Akzente.

### Raster, Abstaende und Groessen

Das System basiert auf einem 8px-Raster. Kleinere Ausnahmen sind nur bei sehr kleinen UI-Details vertretbar. Bedienelemente folgen einer einheitlichen Hoehenleiter, damit Buttons, Search Fields, Inputs, Dropdowns, Tabs, Tags und Toggles in gemeinsamen Zeilen sauber kombiniert werden koennen.

Wichtige UI-Hoehen:

- `28px` fuer kompakte Controls,
- `32px` fuer kleine Standard-Controls,
- `40px` fuer regulaere Controls,
- `48px` fuer groessere Eingabefelder oder prominentere Controls.

Neue Komponenten sollen sich moeglichst in diese Leiter einordnen, statt eigene Zwischenhoehen zu erfinden.

### Radius und Schatten

Es gibt unterschiedliche Radius-Logiken fuer normale Flaechen und Bedienelemente. Fuer UI-Controls existieren eigene Radius-Varianten, damit Buttons, Toggles und verwandte Elemente konsistent wirken.

Drop Shadows sind als weiche, mehrlagige Presets gedacht. Sie sollen Karten und Overlays Tiefe geben, ohne harte Kontraste zu erzeugen. Schatten sind kein dekoratives Mittel, sondern dienen der Ebenenlogik:

- Micro: sehr kleine Controls, leichte Abhebung,
- Subtle: kleine Karten oder kompakte Elemente,
- Medium: normale Karten und Panels,
- Highlight Card: prominentere Karten und visuelle Highlights.

## Komponentenlogik

### Namenslogik

In der Figma-Datei werden zwei grundlegende Praefixe verwendet:

- `C - Desktop ...` fuer wiederverwendbare Komponenten und Komponentenvarianten,
- `V - Desktop ...` fuer finale High-Fidelity-Views.

Die exportierten Screenshots betreffen die `V - Desktop ...` Views und die jeweils darunter liegenden Uebergabenotizen. Komponenten aus der Pattern Library sind die Grundlage fuer Views und sollten bei Erweiterungen wiederverwendet werden, statt neue Einzelkonstruktionen zu bauen.

### Komponentenwiederverwendung

Bei neuen Screens soll zuerst geprueft werden, ob bestehende Komponenten vorhanden sind:

- Button,
- Search Field,
- Input Field und Input Group,
- Dropdown,
- Tabs und Tab Bar,
- Toggle Group,
- Checkbox und Radiobox,
- Cards, Modal Slots,
- Callout,
- Date Picker,
- Slider,
- Tags,
- Sidebar,
- Page Header.

Der Designansatz ist komponentenbasiert. Einzelne Pixel-Layouts ohne Komponentenbindung sind nur fuer explorative Entwuerfe akzeptabel, nicht fuer finale Views.

### Icons

Icons sollen aus dem zentralen Icon-Set stammen. Bei Kategorie-Backdrops wird in der Regel `icon/inverse` verwendet, damit Icons auf farbigen Flaechen klar lesbar bleiben. Icons sollen keine unerwuenschten Hintergrundflaechen erhalten. Wenn Icons in Buttons oder Inputs austauschbar sein sollen, sind Leading- und Trailing-Icon-Slots zu verwenden.

## Modulueberblick

### Kalender

Der Kalender ist die zeitliche Orientierungsebene der App. Er soll Termine, Blocks und geplante Arbeit in einem klaren Tages- oder Wochenkontext sichtbar machen. Die Kalenderansicht ist nicht nur ein Terminraster, sondern der Ort, an dem geplante Produktivitaet konkret wird.

Wichtig fuer Folgearbeiten:

- Zeitbloecke und Aufgaben muessen visuell unterscheidbar bleiben.
- Kalenderinteraktionen sollten nahe an bekannten Kalendermustern bleiben.
- Integrationen und externe Kalender werden in den Einstellungen relevant.

### Aufgaben

Der Aufgabenbereich ist das operative Zentrum. Hier treffen Aufgabenlisten, Zielbezug, Blocks, Templates, Bearbeitungsmodi und Fokusmodus zusammen.

Wichtig:

- Aufgaben koennen eigenstaendig existieren oder mit Zielen und Blocks verbunden sein.
- Blocks sind wiederverwendbare oder geplante Einheiten, die Zeit, Kategorie, Icon, Timer und optionale Sounds/Fokus-Settings tragen koennen.
- Template-Vorlagen sollen nicht wie Dummy-Karten wirken, sondern konkrete Nutzungsszenarien abbilden.
- Fokusmodus ist ein abgeleiteter Arbeitszustand aus Aufgabe/Block, nicht ein isoliertes Feature.

### Fokusmodus

Der Fokusmodus reduziert die Oberflaeche auf die aktuell relevante Arbeitssession. Er ist bewusst deutlich anders als die Verwaltungsansichten: groesser, ruhiger, weniger Navigation, mehr Konzentration.

Wichtig:

- Der Fokusmodus kann unterschiedliche Hintergruende oder Zielbezuege zeigen.
- Settings, Ereignisse und Pause sind eingebettete Zustaende desselben mentalen Modus.
- Die minimierte Variante dient als Rueckkehranker in der normalen Aufgabenansicht.
- Es geht nicht um Animationstiming, sondern um die Beziehung: normale App -> Fokusmodus -> Pause/Settings/Ereignisse -> minimierter Fokusstatus.

### Journal

Das Journal besteht aus Check-in und Check-out. Beide sind verwandt, aber nicht gleich:

- Check-in richtet den Tag aus: Stimmung, Energie, Fokus, Absicht.
- Check-out reflektiert: Fortschritt, Hindernisse, Erkenntnisse, Abschluss.

Template-Funktionen dienen dazu, wiederkehrende Reflexionssysteme vorzubereiten. Ein Template ist aus Designsicht eine strukturierte Sammlung von Fragen und Inputtypen, nicht nur ein Textbaustein.

Wichtig:

- Template-Modals sollen informativ bleiben und nicht ueberladen wirken.
- Inputs im Journal muessen als echte Eingabeformen gedacht werden.
- Die App soll Reflexion erleichtern, nicht wie ein Formularmonster wirken.

### Ziele

Ziele bilden die strategische Ebene. Sie verbinden Motivation, Meilensteine, Rhythmus und konkrete Aktivitaeten.

Wichtig:

- Ziel-Onboarding fuehrt Nutzer Schritt fuer Schritt von Idee zu Struktur.
- Motivation und Meilensteine sind nicht nur Textfelder, sondern Orientierungshilfen.
- Rhythmus schafft die Bruecke zwischen Ziel und regelmaessiger Umsetzung.
- Ziel-Detailansichten muessen Fortschritt, Kontext und naechste Handlung klar zeigen.

### Insights

Insights sollen Muster und Fortschritt verdichten. Die Seite ist kein reines Dashboard um des Dashboard willen. Gute Insights sollten Nutzer zu besseren Entscheidungen fuehren.

Moegliche sinnvolle Inhalte:

- Aufgaben aktuell/offen/abgeschlossen,
- termingerechte Zielerreichung,
- Fokuszeit nach Woche oder Kategorie,
- Aktivitaet pro Woche,
- Journaling-Konstanz,
- Energie-/Stimmungsentwicklung aus Check-ins,
- haeufigste Block-Kategorien,
- Zielrhythmus eingehalten/verfehlt,
- persoenliche Bestzeiten oder produktive Tageszeiten.

Insights sollten immer eine erkennbare Aussage liefern. Reine Zahlen ohne Interpretation sind weniger wertvoll.

### Einstellungen

Einstellungen sind funktional und zurueckhaltend. Sie decken allgemeine App-Praeferenzen, Kalender, Account, Abrechnung, Benachrichtigungen und Fokusmodus ab.

Wichtig:

- Settings sollen nicht wie eine zweite App wirken.
- Formulare und Controls muessen auf dem bestehenden Komponentenstandard aufbauen.
- Integrationen muessen klar unterscheidbar sein von persoenlichen Praeferenzen.

## Interaktionsprinzipien

### Overlays und Modals

Overlays dienen der fokussierten Bearbeitung, ohne den aktuellen Kontext zu verlieren. Sie sollen nicht fuer jede kleine Auswahl verwendet werden, sondern fuer Aufgaben mit erkennbarem Bearbeitungsumfang.

Modals brauchen:

- klare Headline,
- kurze Kontextbeschreibung,
- eindeutige Primaeraktion,
- Sekundaer-/Abbruchaktion,
- konsistente Button- und Input-Komponenten,
- keine visuelle Ueberladung.

### Dropdowns und versteckte Auswahl

Dropdowns sind sinnvoll fuer begrenzte Auswahlmengen, die nicht dauerhaft sichtbar sein muessen. Bei Icon-Auswahl oder laengeren Listen sollte die Auswahl versteckt bleiben, damit Bearbeitungsoberflaechen ruhig bleiben.

### Empty States

Empty States sollen erklaeren, was der Bereich leistet, und eine naechste Handlung anbieten. Sie sollen nicht nur dekorativ sein. Tonalitaet: ermutigend, klar, kurz.

### Metamenues

Metamenues dienen typischerweise Aktionen wie:

- bearbeiten,
- duplizieren,
- loeschen,
- archivieren,
- als Standard setzen,
- Details anzeigen.

Sie sollten nicht primaere Workflows verstecken. Primaere Aktionen gehoeren sichtbar in den Screen.

## Inhaltliche Tonalitaet

Fokuna soll sachlich, warm und motivierend sprechen. Texte sollen nicht uebertrieben coachig sein. Gute Fokuna-Copy ist:

- kurz,
- konkret,
- freundlich,
- handlungsorientiert,
- nicht belehrend.

Beispiele fuer die Tonalitaet:

- "Was ist heute wichtig?"
- "Plane deinen naechsten Fokusblock."
- "Reflektiere kurz, was gut lief."
- "Als Standard festlegen"
- "Mehr erfahren"

## Datenobjekte Aus Designsicht

Diese Begriffe tauchen im Design immer wieder auf und sollten konsistent verwendet werden:

- Aufgabe: konkrete Arbeitseinheit oder To-do.
- Ziel: laengerfristige Absicht mit Meilensteinen und Rhythmus.
- Block: geplante oder wiederverwendbare Zeiteinheit mit Kategorie, Icon, Timer und optionalem Fokuskontext.
- Template: Vorlage fuer Journal oder Blocks.
- Journal Entry: konkrete Check-in- oder Check-out-Antwort.
- Kategorie: visuelle Nutzerklassifikation, nicht Brand-System.
- Prioritaet: Aufgabenwichtigkeit mit eigener Farbskala.
- Fokus Session: aktive Arbeitsphase aus Aufgabe oder Block.

## Accessibility Und Lesbarkeit

Das Design ist hell, weich und teilweise subtil. Bei Umsetzung und Weiterentwicklung muss deshalb besonders auf Kontrast geachtet werden.

Wichtig:

- Text auf farbigen Flaechen braucht ausreichenden Kontrast.
- Sehr helle Category-Tints duerfen nicht fuer kleinen Text ohne dunklere Textvariante genutzt werden.
- Icons auf farbigen Category-Flaechen sollen inverse sein.
- Fokus-Variablen sind fuer Browser-/Keyboard-Fokus gedacht und sollen nicht als generische Highlight-Farbe missbraucht werden.
- Kleine Labels sind moeglich, aber nicht kleiner als der aktuelle kleinste Standard.

## Theming Und Zukunftsfaehigkeit

Die App soll spaeter unterschiedliche Farbthemes unterstuetzen. Deshalb ist es wichtig, semantische Tokens ernst zu nehmen. Coral und Teal koennen perspektivisch andere konkrete Farbwerte tragen. Begriffe wie `primary`, `secondary`, `surface`, `text`, `icon`, `border`, `category` und `priority` sind fuer die Zukunft robuster als komponentenspezifische Sonderfarben.

Bei neuen Variablen gilt:

- zuerst pruefen, ob ein bestehender semantischer Token reicht,
- dann pruefen, ob ein Alias sinnvoll ist,
- erst danach neue Primitives anlegen,
- keine mehrfachen Skalen fuer denselben Farbzweck erzeugen.

## Responsive Und Layoutannahmen

Die Desktop-Views orientieren sich an einer SaaS-App mit linker Sidebar. Die Sidebar ist ein fester Navigationsanker. Layouts sollen mit einem strukturierten Grid arbeiten und Inhaltsbereiche so halten, dass Listen, Karten und Formulare vergleichbar bleiben.

Wichtig:

- Sidebar nicht als normalen Content-Gutter behandeln.
- Hauptcontent braucht klare Innenabstaende.
- Kartenraster sollen rhythmisch und scanbar bleiben.
- Lange Formulare sollen in sinnvolle Gruppen geteilt werden.
- Controls in einer Zeile sollen dieselbe Hoehe teilen.

## Was Folgeagenten Nicht Tun Sollten

- Keine neuen Einzelkomponenten bauen, wenn passende Pattern-Library-Komponenten existieren.
- Keine harten HEX-Werte in finale Designs uebernehmen.
- Keine alten kleinen Typografiegroessen wieder einfuehren.
- Keine Animationstiming-Spezifikation aus Screens ableiten.
- Keine Farbbedeutungen vermischen: Category ist nicht Priority, Brand ist nicht Category.
- Keine Focus-Token fuer visuelle Highlights zweckentfremden.
- Keine Modal-Komplexitaet erhoehen, wenn ein einspaltiger, klarer Aufbau reicht.

## Offene Designfragen Fuer Spaetere Phasen

Diese Punkte sind nicht zwingend fuer das aktuelle Handoff zu klaeren, sollten aber in der technischen oder produktstrategischen Folgearbeit auftauchen:

- Welche Datenquellen speisen Insights konkret?
- Welche Kalenderintegrationen sind in MVP und spaeter geplant?
- Wie granular werden Wiederholungsregeln fuer Blocks und Ziele?
- Werden Templates kuratiert, nutzererstellt oder beides?
- Welche Fokusmodus-Hintergruende sind systemseitig erlaubt?
- Wie werden Sounds/Musikquellen technisch bereitgestellt?
- Wie weit reicht Theming im ersten Release?
- Welche Inhalte brauchen echte leere, Lade- und Fehlerzustaende?

## Empfohlene Nutzung Des Handoff-Pakets

1. Zuerst dieses Dokument lesen, um Produktlogik und Designprinzipien zu verstehen.
2. Danach die PNG-Paare je Bereich in Reihenfolge durchgehen.
3. Bei Detailfragen die Uebergabenotiz im jeweiligen PNG lesen.
4. Komponenten in Figma pruefen, bevor technische Spezifikationen geschrieben werden.
5. Erst danach technische Anforderungen, Datenmodelle, API-Fragen und Implementierungsdetails ableiten.

Die Screens zeigen den aktuellen Designstand. Dieses Dokument erklaert, warum die App so aufgebaut ist und welche gestalterischen Leitplanken bei der Weiterarbeit erhalten bleiben sollen.
