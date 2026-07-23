# Fokuna Pattern Library Uebersicht

Stand: 22. Juli 2026  
Quelle: Figma-Datei `UI Design | Fokuna`, Bereich `Pattern Library`

## Zweck

Diese Datei ergaenzt das Design-Handoff und die View-Uebergabenotizen um eine Uebersicht der zentralen Pattern-Library-Komponenten. Die Screenshots zeigen die Komponentenbereiche in Figma; die Beschreibungen erklaeren, welche Rolle die Komponente im Produkt spielt, welche Varianten und Zustaende sie besitzt und worauf bei der technischen Umsetzung geachtet werden sollte.

Die Pattern Library ist die Grundlage fuer neue Views. Neue finale Screens sollen nach Moeglichkeit aus diesen Komponenten zusammengesetzt werden, statt visuell aehnliche Einzelelemente neu zu bauen.

## Grundprinzipien

- Komponenten mit `C - Desktop ...` sind wiederverwendbare Produktkomponenten.
- Unterkomponenten mit fuehrendem Punkt, z. B. `.tab-item`, sind interne Bausteine und sollten nur dann direkt verwendet werden, wenn bewusst ein zusammengesetztes Pattern gebaut wird.
- Farben, Typografie, Spacing, Radius, Border und Schatten sollen ueber bestehende Variablen und Styles gespeist werden.
- Typografie: immer Text-Tokens (`--fk-type-font-font-size-…`, `--fk-type-font-line-height-…`, `--fk-type-font-font-weight-…`, `--fk-type-font-font-family-…`). Keine harten Literale wie `font-weight: 700` oder `font-size: 16px` in Komponenten-CSS.
- Controls sollen sich an der gemeinsamen Hoehenleiter orientieren: `28px`, `32px`, `40px`, `48px`.
- Kleine Controls verwenden in der Regel `Label/SM` oder `Body/SM`, mittlere Controls `Label/MD` oder `Body/MD`, grosse Controls `Label/LG` oder `Body/LG`.
- Icons sollen aus dem zentralen Icon-Set kommen und ueber Icon-Slots austauschbar bleiben, wenn die Komponente das vorsieht.
- Interaktive States sollen technisch als Zustand umgesetzt werden, nicht als hart kopierter Layer.
- Komponenten sollen nicht fuer einzelne Screens hart ueberschrieben werden. Wenn ein Zustand haeufig gebraucht wird, gehoert er als Variante oder Property in die Pattern Library.

## State-Logik

Fuer die technische Umsetzung ist wichtig, zwischen Varianten, Properties und States zu unterscheiden:

- `Variante`: Grundauspraegung einer Komponente, z. B. Button `intent=primary` oder Callout `type=warning`.
- `Property`: steuerbare Option innerhalb einer Variante, z. B. `leading icon=true`, `label visible=true` oder `clear button=true`.
- `State`: interaktiver oder inhaltlicher Zustand, z. B. `default`, `hover`, `pressed`, `active`, `selected`, `disabled`, `open`, `filled`, `error`, `loading`.
- `Focus`: technischer Tastatur-/Browser-Fokus. Die Focus-Variable ist fuer echte Accessibility-Fokusrahmen reserviert und soll nicht als normale Highlight-Farbe zweckentfremdet werden.

## Komponentenuebersicht

### 01 Button

Screenshot: [01_Button.png](01_Button.png)

Die Button-Komponente ist die zentrale Aktionskomponente der App. Sie bildet verschiedene Intents, States, Groessen und Icon-Konfigurationen ab. Besonders wichtig ist die einheitliche Behandlung von Surface, Border, Text und Icon ueber semantische Farbvariablen. Flaechige Buttons nutzen inverse Text- und Iconfarben; Outline-Varianten bleiben transparent und arbeiten mit Stroke- und Texttokens.

Varianten und Properties:

- `intent`: `primary`, `secondary`, `tertiary`, `ghost` bzw. outline/low emphasis je nach Figma-Set.
- `type` / `buttonType`: `primary` (flaechig), `outline`, `link`, `icon-text-inline`.
- `size`: an der Control-Hoehenleiter ausrichten, typischerweise `sm=28px`, `md=32px`, `lg=40px`, optional `xl=48px`, sofern in der Komponente vorhanden.
- `state`: `default`, `hover`, `pressed`, `disabled`, ggf. `loading`.
- `icon only`: Variante ohne Text; benoetigt trotzdem ein technisches Label.
- `leading icon`: optionaler linker Icon-Slot, standardmaessig bei vielen Buttons ausblendbar.
- `trailing icon`: optionaler rechter Icon-Slot, haeufig Chevron Right fuer Weiter/Mehr.
- `label`: Textinhalt; bei flaechigen/outline/`link` semibold, bei `icon-text-inline` regular (Body).

States:

- `default`: regulaerer Ruhezustand.
- `hover`: sichtbar leicht staerkerer Surface-, Border- oder Textzustand, aber keine Layoutverschiebung.
- `pressed`: aktiv gedrueckter Zustand, meist dunkler/kontrastreicher als Hover.
- `disabled`: nicht interaktiv, mit gedimmtem Text/Icon und grauer bzw. neutraler Surface/Border-Logik.
- `loading`: Aktion laeuft; Label kann erhalten bleiben oder durch Loading-Text ersetzt werden. Spinner/Icon darf nicht die Buttonhoehe veraendern.
- `focus visible`: technischer Tastaturfokus; nicht als permanenter visueller Zustand in Mockups missbrauchen.

Wichtig fuer Umsetzung:

- Primaere Aktionen sichtbar und sparsam einsetzen.
- `primary` und `secondary` sind flaechtig und tragen inverse Text- und Iconfarben.
- `tertiary` passt zu Dropdown-, Toolbar- und ruhigen Utility-Buttons: helle Flaeche (`surface/base`), `border/default`, `text/primary`, `icon/primary` und Micro Shadow. Hover wechselt auf `border/strong`.
- `ghost` ist fuer niedrig priorisierte Aktionen ohne dominante Flaeche gedacht.
- Flaechige Buttons und Outline-`tertiary` erhalten den Micro Shadow; Outline primary/secondary sowie Ghost nicht.
- `link`: Text+Icon ohne Flaeche, Label/Semibold, Icon-Gap 6 px, kein horizontales Padding; Standard-Trailing-Chevron.
- `icon-text-inline`: ruhige Text+Icon-Utility (z. B. Zurueck, Neues …, Loeschen in Modals), Body/Regular, Icon-Gap 4 px, kein horizontales Padding, kein Default-Chevron; schrumpft auf Inhalt (`width: max-content`), Icons Stroke `1.5` (Loeschen: `delete-alt`, nicht das Fill-`delete`). Default-Farbe `text/primary`; fuer abgeschwaechte Manage-Links (`… verwalten`) `intent=tertiary` → `text/tertiary` (Hover `text/secondary`).
- Leading- und Trailing-Icon-Slots nicht durch feste Icons ersetzen.
- Icon-only Buttons muessen klare `aria-labels` erhalten.

### 02 Callout

Screenshot: [02_Callout.png](02_Callout.png)

Callouts dienen kurzen Hinweisen, Warnungen, Fehlern oder informativen Kontexten. Die visuelle Logik basiert auf einer linken Statuslinie ueber die Hoehe des Inhaltsbereichs, mit optionaler Icon-Variante. Sie sollen Hinweise innerhalb eines Formulars oder Views betonen, ohne den Screen zu dominieren.

Varianten und Properties:

- `type`: `default`, `info`, `warning`, `error`.
- `icon`: optional sichtbar; wenn sichtbar, muss es semantisch zur Variante passen.
- `title`: optionaler kurzer Titel.
- `body`: Hinweistext, moeglichst knapp.
- `action`: optionaler Link oder Button, nur wenn aus dem Hinweis eine direkte Handlung folgt.

States:

- `default`: neutraler Hinweis, graue/neutral gemappte Linie.
- `info`: informativer Hinweis, gruene/tealbasierte Statuslogik.
- `warning`: Warnhinweis, orange/gelbe Statuslogik.
- `error`: Fehler oder blockierender Zustand, rote Statuslogik.
- `with icon`: zusaetzliche Erkennbarkeit, ohne die linke Linie zu ersetzen.
- `without icon`: reduzierte Standardvariante, wenn der Text allein reicht.

Wichtig fuer Umsetzung:

- Statusfarben duerfen nicht mit Category- oder Brandfarben verwechselt werden.
- Die linke Linie ist das Hauptmerkmal und soll ueber Tokens gepflegt werden.
- Text bleibt knapp und handlungsorientiert.
- Callouts sind nicht fuer dauerhafte Navigation oder komplexe Inhalte gedacht.

### 03 Cards & Slots

Screenshot: [03_Cards_Slots_and_Modal.png](03_Cards_Slots_and_Modal.png)

Diese Seite definiert Kartengrundlagen und generische Inhalts-Slots. Cards bilden wiederkehrende Inhaltscontainer. **Produktive Dialoge** (Organizational, Confirmation, Aufgaben Modal) liegen gebuendelt unter **§42 Modals**.

Varianten und Properties:

- `card`: Basiscontainer fuer Inhalte, meist mit Surface, Border und optionalem Shadow (`elevated`: none/micro/subtle/medium/highlight).

States:

- `default/rest`: normale Kartenoberflaeche.
- `hover`: nur bei klickbaren Karten oder Listencontainern relevant.
- `selected/active`: fuer auswaehlbare Karten; muss klarer sein als Hover.
- `disabled/unavailable`: Inhalte bleiben erkennbar, aber Interaktion ist gedimmt.

Card:

- Neutrale Flaeche: `surface/base`, Card-Radius, optionale Elevation (Referenz: medium Shadow).
- Inhalt kommt von aussen; die leere Card im Specimen zeigt nur die Oberflaeche.
- Keine verschachtelten Karten, wenn eine Section oder Gruppe reicht.

Wichtig fuer Umsetzung:

- Cards nutzen Surface-, Border- und Shadow-Tokens.
- Keine verschachtelten Kartenlayouts aufbauen, wenn eine Section oder Gruppe reicht.
- Dialoge und Modal-Compositions siehe §42 Modals (`/pattern-library/modals`).

### 04 Calendar Drawer

Screenshot: [04_Calendar_Drawer.png](04_Calendar_Drawer.png)

Der Calendar Drawer strukturiert Kalenderinhalte, importierte Termine, Tasks und Blocks in einer seitlichen Zeituebersicht. Die Unterkomponenten unterscheiden verschiedene Kalendereintragstypen und visualisieren Zeitbezug, Herkunft und Status.

Varianten und Properties:

- `entry type`: Termin, Aufgabe, Block, Import/externes Ereignis.
- `header`: Text-Icon-Dropdown (`appearance=text`, Kalender-Icon, MD) links, Switcher (MD) rechts — gleiche Hoehe.
- `padding`: 24 px innen, linker 1 px Border (`border/default`).
- `time axis`: Stundenmarken 07:00–18:00 mit gleichmaessigem Abstand (67 px Pitch), Linie und Label bündig.
- `time`: Start-/Endzeit oder Dauer.
- `source`: Kalenderquelle bzw. Kontext.
- `status`: erledigt, geplant, laufend oder verpasst, sofern fachlich relevant.
- `compact/expanded`: kurzer Listeneintrag vs. Eintrag mit Zusatzinformationen.

States:

- `default`: normaler Eintrag.
- `hover`: Eintrag ist interaktiv und oeffnet Details oder Kontextmenue.
- `selected`: aktuell ausgewaehlter Eintrag.
- `active/now`: Eintrag liegt in der aktuellen Zeit oder ist gerade laufend.
- `completed`: abgeschlossene Aufgabe bzw. erledigter Block.
- `disabled/past-muted`: vergangene oder nicht bearbeitbare Eintraege sind visuell ruhiger.

Wichtig fuer Umsetzung:

- Kalender-, Aufgaben- und Blockelemente muessen visuell unterscheidbar bleiben.
- Zeitindikator und Eintragskarten sind Teil eines gemeinsamen Zeitsystems.
- Drawer-Inhalte sollen scanbar sein und keine vollwertige Detailansicht ersetzen.
- Meta-Actions sollten ueber bestehende Dropdown-/Menu-Patterns geloest werden.
- Die einzelnen Eintragstypen fuer Task, importiertes Kalenderereignis und Zeitblock sind separat dokumentiert, siehe Abschnitte `23` bis `25`.

### 05 Checkbox

Screenshot: [05_Checkbox.png](05_Checkbox.png)

Checkboxen werden fuer Mehrfachauswahl, erledigte Aufgaben und optionale Einstellungen genutzt. Zusaetzlich gibt es Favorite Checkbox und Checkbox Label Varianten fuer Kombinationen aus Control und Beschriftung.

Varianten und Properties:

- `size`: passend zur Control-Hoehenleiter und Textgroesse.
- `checked`: an/aus.
- `indeterminate`: optional fuer teilweise ausgewaehlte Gruppen.
- `disabled`: nicht interaktiv.
- `label visible`: fuer Checkbox Label Varianten.
- `favorite`: Sondervariante fuer Favorisieren, nicht fuer normale Formulare.

States:

- `unchecked/default`: keine Auswahl; starke Kontur (`border-tertiary` bzw. Priority-Farbe).
- `checked/selected`: ausgewaehlt, voll gefuellt mit Haken und aktivem Token.
- `indeterminate`: Teilzustand bei Gruppen.
- `hover` (unchecked): Kontur bleibt; Fill `surface-muted`.
- `disabled unchecked`: leerer, gedimmter Zustand.
- `disabled checked`: ausgewaehlt, aber nicht interaktiv.
- `focus visible`: Tastaturfokus um das Control oder die gesamte Label-Zeile.

Wichtig fuer Umsetzung:

- Checkbox Label nutzt die passende Label-Typografie.
- Hit Area groesser denken als sichtbares Kaestchen.
- Label-Klick muss die Checkbox toggeln.
- Favorite Checkbox nicht fuer normale Binaerentscheidungen verwenden.
- Priority-Checkboxen: gleiche State-Logik (starke farbige Kontur → muted Hover-Fill → volle Priority-Fuellung).

### 06 Radiobox

Screenshot: [06_Radiobox.png](06_Radiobox.png)

Radioboxen dienen der exklusiven Auswahl innerhalb einer Gruppe. Die Label-Komponente vereint Radiobox und Beschriftung in den definierten Groessen.

Varianten und Properties:

- `size`: passend zur Control-Hoehenleiter.
- `selected`: ja/nein.
- `disabled`: nicht interaktiv.
- `label visible`: fuer kombinierte Radio-Label-Komponenten.

States:

- `unselected/default`: Option ist nicht gewaehlt.
- `selected`: genau eine Option in der Gruppe ist aktiv.
- `hover`: leichte visuelle Rueckmeldung.
- `disabled unselected`: nicht waehlbar.
- `disabled selected`: aktuell gesetzt, aber nicht aenderbar.
- `focus visible`: Tastaturfokus fuer die aktuell fokussierte Option.

Wichtig fuer Umsetzung:

- Immer gruppenlogisch verwenden: eine Auswahl aus mehreren Optionen.
- Label-Typografie verwenden.
- Label-Klick muss die Option auswaehlen.
- Nicht als Checkbox-Ersatz einsetzen.

### 07 Breadcrumb

Screenshot: [07_Breadcrumb.png](07_Breadcrumb.png)

Breadcrumbs zeigen hierarchische Positionen innerhalb tieferer Ansichten oder Bearbeitungskontexte. Sie unterstuetzen Orientierung, besonders bei Ziel-, Aufgaben- und Detailflows.

Varianten und Properties:

- `item`: klickbarer Pfadbestandteil.
- `current item`: aktuelle Ebene.
- `separator`: visuelle Trennung zwischen Ebenen.
- `truncation`: optional fuer lange Pfade.

States:

- `default`: klickbare vorherige Ebene.
- `hover`: Linkcharakter wird sichtbar.
- `pressed`: Klickfeedback.
- `current`: aktuelle Ebene, nicht als normaler Link behandeln.
- `disabled`: Pfadbestandteil ist nicht erreichbar.

Wichtig fuer Umsetzung:

- Nicht fuer Hauptnavigation verwenden.
- Gesamter Breadcrumb-Trail (Segmente, Current, Separator-Icons, Collapsed-Trigger) nutzt `text-quarternary`.
- Lange Breadcrumbs muessen kuerzbar oder responsiv umbrechbar sein.
- Ab drei Segmenten die Collapsed-/Punkt-Variante nutzen (`first › … › current`), damit der Pfad einzeilig bleibt; Umbruch nur als aeusserster Notfall.
- Separatoren sind rein visuell und nicht Teil des Screenreader-Labels.

### 08 Switcher

Screenshot: [08_Switcher.png](08_Switcher.png)

Switcher sind kompakte Auswahl- oder Umschaltelemente fuer kleine Moduswechsel. Sie unterscheiden sich von Toggle Groups dadurch, dass sie eher fuer enge, lokale Umschaltungen gedacht sind.

Varianten und Properties:

- `size`: aus der gemeinsamen Hoehenleiter.
- `option count`: meistens zwei Optionen, ggf. wenige mehr.
- `selected item`: aktive Option.
- `icon`: optional, wenn der Modus durch Icon allein verstaendlich ist.

States:

- `default/inactive`: Option ist verfuegbar, aber nicht aktiv.
- `active/selected`: Option ist aktuell gewaehlt.
- `hover`: lokale Rueckmeldung auf interaktive Option.
- `pressed`: kurzes Klickfeedback.
- `disabled`: einzelne Option oder gesamter Switcher ist nicht verfuegbar.

Wichtig fuer Umsetzung:

- Nur fuer klar begrenzte Optionen nutzen.
- Visuell nicht mit Tabs verwechseln.
- Zustandsfarbe muss tokenbasiert bleiben.
- Wechsel sollte sofort wirken oder klar bestaetigt werden.

### 09 Form

Screenshot: [09_Form.png](09_Form.png)

Die Form-Seite enthaelt `Input Field` und `Input Group`. `Input Field` ist das reine Eingabefeld mit States, Groessen und optionalen Icons. `Input Group` kombiniert Label, Input, Sublabel und optionalen Button.

Varianten und Properties:

- `input field size`: `sm=28px`, `md=32px`, `lg=40px`, `xl=48px`.
- `state`: default, hover, filled, disabled, error.
- `leading icon`: optionaler Icon-Slot vor dem Text.
- `trailing icon`: optionaler Icon-Slot nach dem Text.
- `placeholder/value`: leerer vs. gefuellter Inhalt.
- `input group`: Label, Input Field, Sublabel/Helper Text und optionaler Button.
- `button visible`: optionaler Button innerhalb oder neben der Gruppe.
- `label visible`: Label ein-/ausblendbar.
- `sublabel visible`: Helper- oder Fehlertext ein-/ausblendbar.

States:

- `empty/default`: Feld ist leer und zeigt Placeholder.
- `hover`: Feld reagiert auf Mausinteraktion.
- `filled`: Wert ist gesetzt.
- `disabled`: Feld nicht editierbar, visuell gedimmt.
- `error`: Validierungsfehler, mit Error-Stroke und Fehlertext.
- `success/valid`: optional nur verwenden, wenn fachlich benoetigt.
- `focus visible`: technischer Fokus; in der Variantenmatrix nicht als eigenstaendiger Dauerzustand fuehren, aber im Code unterstuetzen.

Wichtig fuer Umsetzung:

- Input Groups sollen echte Input-Field-Instanzen nutzen.
- Leading- und Trailing-Icon-Slots analog zu Buttons erhalten.
- Label, Sublabel und Button per Properties steuerbar halten.
- Error-Text ersetzt oder ergaenzt Helper Text, darf aber keine Layoutspruenge erzeugen.
- Pflichtfelder nicht nur farblich markieren.

### 10 Date Picker

Screenshot: [10_Date_Picker.png](10_Date_Picker.png)

Der Date Picker bildet Datums- und Zeitraumwahl ab. Er verwendet die definierten Farb- und Typografietokens und soll Kalenderinteraktionen klar, reduziert und gut lesbar darstellen.

Varianten und Properties:

- `mode`: einzelnes Datum oder Zeitraum.
- `input state`: leer, gefuellt, disabled, error.
- `calendar open`: Kalender-Popover sichtbar.
- `selected date`: ausgewaehlter Tag.
- `range start/end`: Start und Ende einer Spanne.
- `month navigation`: vorheriger/naechster Monat.

States:

- `input default`: Feld geschlossen, kein Datum gewaehlt.
- `input filled`: Datum oder Zeitraum gewaehlt.
- `open`: Kalender ist sichtbar.
- `day default`: normaler Tag.
- `day hover`: Tag unter Cursor.
- `day selected`: ausgewaehlter Tag, mit Teal/Highlight und inverse Zahl.
- `day in range`: Tag liegt innerhalb eines gewaehlten Zeitraums.
- `day today`: heutiges Datum, falls separat markiert.
- `day outside month`: gedimmte Tage aus Vor-/Folgemonat.
- `day disabled`: nicht waehlbar.

Wichtig fuer Umsetzung:

- Browser-Fokusfarbe nicht als visuelles Highlight zweckentfremden.
- Ausgewaehlte Tage muessen ausreichend Kontrast haben.
- Icons ohne unerwuenschte Hintergrundflaechen darstellen.
- Navigation und Auswahl muessen auch per Tastatur funktionieren.

### 11 Dropdown

Screenshot: [11_Dropdown.png](11_Dropdown.png)

Dropdowns decken sowohl Meta-Menues als auch Dropdown Buttons ab. Sie werden fuer versteckte Auswahl, Kontextmenues und sekundaere Aktionen eingesetzt.

Varianten und Properties:

- `dropdown button` (`form=button`): sichtbarer Trigger mit Border, Micro Shadow, Label und Chevron.
- `text` (`form=text`): borderloser Text-Trigger ohne Border/Shadow; gleiche Groessenskala wie Button.
- `type=single | key-value | icon`: reines Label, Key+Value oder Leading-Icon + Label.
- `size`: `sm` 28, `md` 32, `lg` 40, `xl` 48 — fuer Button- und Text-Form identisch.
- `meta menu`: Icon-only oder dezenter Trigger fuer Kontextaktionen.
- `menu item`: einzelne Aktion oder Auswahloption.
- `selected value`: aktueller Wert bei Auswahl-Dropdowns.
- `placement`: Popover-Position relativ zum Trigger.

States:

- `trigger default`: geschlossen.
- `trigger hover`: Trigger reagiert.
- `trigger open`: Menue sichtbar, Chevron/Surface darf Zustand anzeigen.
- `trigger disabled`: nicht nutzbar.
- `item default`: normaler Menueeintrag.
- `item hover`: aktueller Hover-Eintrag.
- `item selected`: aktuelle Auswahl.
- `item disabled`: Eintrag nicht auswaehlbar.
- `item destructive`: gefaehrliche Aktion wie Loeschen, farblich semantisch kennzeichnen.

Wichtig fuer Umsetzung:

- Meta-Menues fuer Aktionen wie Bearbeiten, Loeschen, Duplizieren.
- Dropdown Buttons fuer kontrollierte Auswahl oder versteckte Panel-Interaktion.
- Keine primaeren Workflows komplett hinter Dropdowns verstecken.
- Menues muessen ausserhalb klicken, Escape und Tastaturnavigation unterstuetzen.
- Rechtsklick-Kontextmenues nutzen dasselbe `.fk-menu`-Styling wie Meta-Menues (`FokunaContextMenu`), inkl. Separator, destruktiver Items und Submenus mit Checkmark fuer den aktuellen Wert.
- Eingebettete Select-/Dropdown-Listen (z. B. Zeitschaetzung im Kontextmenue) nutzen `.fk-menu--select` mit hoeherem z-index als Kontext-Submenus, damit die Optionsliste vor dem Panel liegt.

### 12 Filter Bar

Screenshot: [12_Filter_Bar.png](12_Filter_Bar.png)

Die Filter Bar kombiniert mehrere Filter- oder Steuerkomponenten in einer kompakten Zeile. Sie soll Listen- und Uebersichtsbereiche strukturieren, ohne viel vertikale Flaeche zu verbrauchen.

Varianten und Properties:

- `search`: optionales Search Field.
- `filter chip/dropdown`: einzelner Filter.
- `view switcher`: optionaler Moduswechsel.
- `sort`: Sortierauswahl.
- `clear filters`: optional, wenn Filter aktiv sind.

States:

- `default`: keine Filter aktiv.
- `filtered/active`: mindestens ein Filter gesetzt.
- `chip selected`: einzelner Filter ist aktiv.
- `chip hover`: interaktives Feedback.
- `chip disabled`: Filter nicht verfuegbar.
- `overflow`: bei zu vielen Filtern in Menue oder horizontales Scrolling ausweichen.

Wichtig fuer Umsetzung:

- Controls innerhalb der Bar muessen gleiche Hoehenlogik nutzen.
- Filterzustaende klar sichtbar machen.
- Bei vielen Filtern lieber gruppieren als horizontal ueberladen.
- Aktive Filter sollten ruecksetzbar sein.

### 13 Sidebar

Screenshot: [13_Sidebar.png](13_Sidebar.png)

Die Sidebar bildet die primaere App-Navigation und mehrere Sidebar-Level ab. Enthalten sind Header, Menu Items, Menu Groups, Tags, Icon Squircles, Level 1, Level 2, Blocks und kombinierte Sidebar-Varianten.

Varianten und Properties:

- `level`: Level 1 Hauptnavigation, Level 2 Kontext-/Bereichsnavigation.
- `padding`: Level 1 `24 px` oben/unten und `12 px` seitlich; Level 2 `24 px` vertikal und `16 px` seitlich.
- `menu item`: Icon, Label, optional Badge/Count.
- `menu group`: gruppierte Navigation mit optionalem Collapse.
- `block item`: Blockliste oder Schnellzugriff.
- `tag/category`: farbige Kategoriekennzeichnung.
- `active page`: aktuelle View.
- `user/settings`: unterer Account- und Einstellungsbereich.

States:

- `default`: normaler Navigationspunkt.
- `hover`: visuelle Rueckmeldung.
- `active/current`: aktuelle Seite oder aktueller Bereich.
- `expanded`: Gruppe oder Level-2-Bereich ist geoeffnet.
- `collapsed`: Gruppe oder Sidebar-Abschnitt ist reduziert.
- `disabled`: nicht verfuegbarer Punkt.
- `notification/badge`: Punkt besitzt ungelesene oder zaehlbare Inhalte.

Wichtig fuer Umsetzung:

- Sidebar ist ein fester Navigationsanker und kein normaler Contentbereich.
- Level 1 und Level 2 muessen in Breite und Verhalten konsistent bleiben.
- Aktive Zustaende, Tags und Blocklisten brauchen klare visuelle Prioritaet.
- Icon-Squircles arbeiten mit Category-/Surface-Logik und inverse Icons.
- Navigation muss semantisch als Navigation ausgezeichnet werden.
- L2-Abschnitte Kategorien, Labels und Ziele sind jeweils innerhalb ihres Abschnitts per Drag & Drop sortierbar (`sortOrder`); Task-Drops auf Kategorie/Label bleiben davon getrennt.

### 14 Switch

Screenshot: [14_Switch.png](14_Switch.png)

Switches sind binaere Ein/Aus-Kontrollen. Sie sollten fuer direkte Statusumschaltung verwendet werden, nicht fuer Navigation oder Auswahl aus mehreren Optionen.

Varianten und Properties:

- `size`: passend zur Control-Hoehenleiter.
- `checked`: ein/aus.
- `disabled`: nicht interaktiv.
- `label`: ausserhalb oder in einer Gruppenkomponente.

States:

- `off/default`: deaktivierter Zustand.
- `on/checked`: aktivierter Zustand.
- `hover`: leichtes Feedback auf Track oder Thumb.
- `pressed`: Thumb/Track reagieren auf Klick.
- `disabled off`: nicht aenderbarer Aus-Zustand.
- `disabled on`: nicht aenderbarer Ein-Zustand.
- `focus visible`: technischer Tastaturfokus.

Wichtig fuer Umsetzung:

- Zustand muss eindeutig sein.
- Label im Kontext bereitstellen, auch wenn der Switch selbst kompakt ist.
- Nicht mit Toggle Groups vermischen.
- Zustand sollte sofort gespeichert oder klar als pending markiert werden.

### 15 Slider

Screenshot: [15_Slider.png](15_Slider.png)

Slider und Step Slider dienen numerischen Einstellungen, z. B. Prozent- oder Intensitaetswerte. Der Step Slider bildet feste Schritte ab.

Varianten und Properties:

- `type`: freier Slider oder Step Slider.
- `value`: aktueller Wert.
- `min/max`: Wertebereich.
- `step`: feste Schritte, bei Desktop-Slider u. a. in 10%-Schritten.
- `label/value visible`: optionale Wertanzeige.
- `disabled`: nicht interaktiv.

States:

- `default`: normaler Regler.
- `hover`: Track oder Thumb reagieren.
- `dragging/active`: Nutzer zieht den Thumb.
- `disabled`: Wert sichtbar, aber nicht aenderbar.
- `step selected`: diskreter Schritt ist aktiv.
- `invalid/out of range`: nur falls fachlich durch Validierung noetig.

Wichtig fuer Umsetzung:

- Wenn genaue Werte relevant sind, Zahl anzeigen oder Eingabe ergaenzen.
- Step Slider fuer klar definierte Raster nutzen.
- Aktiver Track muss klar von inaktivem Track unterscheidbar sein.
- Tastatursteuerung mit Pfeiltasten und Step-Logik beruecksichtigen.

### 16 Tab Select

Screenshot: [16_Tab_Select.png](16_Tab_Select.png)

Tab Select ist eine karten- oder listenartigere Auswahlkomponente fuer visuell reichere Optionen, etwa Modi oder Musik-/Sound-Auswahl. Es ist nicht identisch mit einer klassischen Tab Bar.

Varianten und Properties:

- `item`: auswaehlbares Element mit Label und optionalem Icon.
- `size`: gemeinsame Hoehenleiter.
- `layout`: horizontal oder kompakter Gruppenaufbau.
- `icon visible`: optional.
- `selected item`: aktuell aktive Auswahl.

States:

- `default`: nicht aktive Option.
- `hover`: Option reagiert auf Interaktion.
- `active/selected`: Option ist gewaehlt.
- `disabled`: Option nicht verfuegbar.
- `focus visible`: Tastaturfokus auf Item.

Wichtig fuer Umsetzung:

- Fuer Auswahlkarten mit Icon/Text-Kontext geeignet.
- Aktiver Zustand klar ueber Tokenfarbe abbilden.
- Nicht fuer einfache Seiten-Tabs verwenden.
- Auswahl sollte semantisch als Radiogroup oder Tablist modelliert werden, je nach Funktion.

### 17 Tab Bar

Screenshot: [17_Tab_Bar.png](17_Tab_Bar.png)

Die Tab Bar ist fuer horizontale Navigation zwischen gleichrangigen Inhaltsansichten gedacht. Sie arbeitet mit Item-Komponenten, Active Indicator und darunterliegender Bar.

Varianten und Properties:

- `size`: `sm`, `md`, `lg`, `xl` analog zur Control-Hoehenleiter.
- `item`: Textlabel, optional spaeter Icon.
- `active item`: aktiver Tab.
- `bar`: durchgehende darunterliegende Linie.
- `indicator`: aktive Linie, waechst mit der Breite des aktiven Items.

States:

- `inactive/default`: Tab ist nicht aktiv.
- `hover`: Tab zeigt Interaktion.
- `active`: Text und Indicator sind aktiv.
- `disabled`: Tab nicht erreichbar.
- `overflow`: bei vielen Tabs scrollen oder in Dropdown auslagern.

Wichtig fuer Umsetzung:

- Items muessen in der Breite auf ihren Inhalt reagieren und duerfen nicht hart umbrechen.
- Text der Items lautet im Komponentenbeispiel `Item`.
- Underline/Indicator bleibt 4px hoch.
- Active Indicator sitzt auf einer durchgehenden Basislinie.
- Zwischen Label und Linie bleibt ein kleiner, konsistenter Abstand.
- Gesamt-Hoehe muss zur Control-Hoehenleiter passen.

### 18 Tags

Screenshot: [18_Tags.png](18_Tags.png)

Tags dienen der kompakten Darstellung von Eigenschaften, Kategorien, Metadaten oder Filterchips. Sie koennen Icon und Text kombinieren und in Bars gruppiert werden.

Varianten und Properties:

- `type`: neutral, category, priority, metadata, filter.
- `size`: gemeinsame Hoehenleiter bzw. kompakte Tag-Hoehen.
- `leading icon`: optional.
- `trailing action`: optional, z. B. entfernen.
- `selected`: bei Filterchips.
- `color`: Category- oder Priority-Token, wenn semantisch passend.

States:

- `default`: rein informativ oder nicht aktiv.
- `hover`: nur bei interaktiven Tags/Filterchips.
- `selected/active`: Filter oder Auswahl ist aktiv.
- `disabled`: nicht nutzbar.
- `removable`: Tag zeigt Close/Remove-Action.
- `priority`: nutzt Task-Priority-Farbskala.
- `category`: nutzt Category-Farbvariablen.

Wichtig fuer Umsetzung:

- Tags sind keine Primaerbuttons.
- Category- und Priority-Farben nur semantisch korrekt einsetzen.
- Kleine Textgroessen muessen lesbar bleiben.
- Interaktive Tags brauchen erkennbare Tastatur- und Screenreader-Zustaende.

### 19 Toggle Group

Screenshot: [19_Toggle_Group.png](19_Toggle_Group.png)

Toggle Groups dienen der Umschaltung zwischen mehreren klaren Modi, z. B. Check-in/Check-out oder Darstellungsmodi. Sie bestehen aus Toggle Items und einer Toggle Bar.

Varianten und Properties:

- `size`: gemeinsame Hoehenleiter.
- `item count`: zwei oder mehr Optionen.
- `active item`: aktuell ausgewaehlter Modus.
- `icon visible`: optional.
- `label`: Pflicht, wenn Icon allein nicht eindeutig ist.

States:

- `default/inactive`: Option ist nicht aktiv.
- `hover`: Option reagiert.
- `active/selected`: Option ist aktuell gesetzt.
- `pressed`: Klickfeedback.
- `disabled`: Option oder gesamte Gruppe nicht verfuegbar.
- `focus visible`: Tastaturfokus.

Wichtig fuer Umsetzung:

- Fuer lokale Moduswechsel, nicht fuer globale Navigation.
- Aktiver Zustand muss eindeutig, aber nicht zu laut sein.
- Einheitliche Hoehen und Radiusvariablen verwenden.
- Bei genau einer aktiven Auswahl technisch als Radiogroup oder segmented control modellieren.

### 20 Search Field

Screenshot: [20_Search_Field.png](20_Search_Field.png)

Das Search Field bildet kompakte und fokussierte Suchzustaende ab. Der unfokussierte Zustand kann schmaler sein; fokussierte Varianten duerfen wachsen.

Varianten und Properties:

- `size`: `sm`, `md`, `lg`, `xl` analog zur Control-Hoehenleiter.
- `collapsed/default width`: kompakte Breite, z. B. `120px` im unfokussierten Zustand.
- `focused/expanded width`: breitere Suchflaeche.
- `value`: leer oder gefuellt.
- `clear visible`: X-Icon sichtbar, wenn Inhalt vorhanden ist.
- `disabled`: Suche nicht verfuegbar.

States:

- `collapsed/default`: kompakter Zustand, Placeholder oder kurzer Text sichtbar.
- `hover`: Feld reagiert ohne Groessensprung.
- `focused/expanded`: Feld waechst und erlaubt komfortable Eingabe.
- `filled`: Suchbegriff sichtbar, Clear-Action vorhanden.
- `disabled`: nicht editierbar.
- `no results`: gehoert meist zum Suchergebnisbereich, nicht direkt ins Feld, sollte aber fachlich mitgedacht werden.

Wichtig fuer Umsetzung:

- Search Icon links, Clear Icon nur bei Inhalt.
- Unfokussierte Breite kann kompakt bleiben.
- Text darf nicht aus dem Feld laufen.
- Breitenwechsel sollte layoutstabil sein und keine Nachbarelemente unkontrolliert verschieben.

### 21 Page Header

Screenshot: [21_Page_Header.png](21_Page_Header.png)

Page Header strukturieren View-Koepfe mit Titel, Actions, Search, Meta-Controls und Varianten. Sie sind zentral fuer die Konsistenz der finalen Desktop-Views.

Varianten und Properties:

- `title`: optionaler Haupttitel; Mapped-Varianten wie Aufgaben lassen den Left Slot leer.
- `subtitle/meta`: optionaler Kontext.
- `primary action`: wichtigste Aktion, z. B. Neues Element.
- `secondary actions`: zusaetzliche Buttons oder Dropdowns.
- `search`: optionales Search Field.
- `filter/sort`: optionale Filter- oder Sortiercontrols.
- `breadcrumb`: optional bei tieferen Kontexten.
- `sidebar toggle`: Icon-only Tertiary Outline mit `border/default` (gleich wie Meta/Search); Icon `sidebar-left-arrow`, je nach Offen/Geschlossen horizontal gespiegelt (`scaleX(-1)`, ohne Animation).
- `Fokus` (Aufgaben): Secondary Button mit ausgefülltem `magic-eye` (`fill="on"`).

States:

- `default`: Titel mit ggf. Actions.
- `titleless`: nur Actions rechts (z. B. Aufgaben Mapped).
- `with search`: Header enthaelt Suche.
- `with filters`: Header enthaelt Filter-/Sortierlogik.
- `empty/no actions`: reduzierte Variante ohne rechte Controls.
- `loading`: wenn View-Daten noch geladen werden, Controls ggf. disabled.
- `sticky`: optionales Verhalten beim Scrollen, falls technisch vorgesehen.

Wichtig fuer Umsetzung:

- Header nicht je View neu bauen.
- Actions und Search nach bestehender Control-Hoehenleiter ausrichten.
- Mapped-Varianten beachten, wenn Header in finalen Views genutzt werden.
- Primaeraktion muss visuell und semantisch eindeutig sein.
- Utility-Icon-Buttons (Meta, Sidebar-Toggle) teilen sich denselben Border wie Search (`border/default`).

### 22 UI Shell

Screenshot: [22_UI_Shell.png](22_UI_Shell.png)

Die UI Shell bildet das Desktop-Grundgeruest der App mit Sidebar- und Contentstruktur. Sie ist die Layoutbasis fuer viele High-Fidelity-Views.

Varianten und Properties:

- `sidebar`: Level 1 Navigation.
- `secondary sidebar`: optionaler Level-2-Bereich.
- `content`: Hauptflaeche der aktiven View.
- `overlay/drawer`: optionale eingeblendete Panels.
- `active route`: bestimmt aktive Navigation.
- `user context`: Account/Profilbereich.

States:

- `default`: normale Desktop-Shell.
- `level 2 open`: sekundaerer Navigationsbereich sichtbar.
- `level 2 closed`: nur Hauptnavigation sichtbar.
- `modal overlay`: View wird abgedimmt und Modal liegt darueber.
- `drawer open`: seitlicher Drawer sichtbar.
- `focus mode/miniplayer`: Spezialzustand mit eingeblendetem Fokus-/Timer-Element, sofern in Views vorgesehen.
- `loading/empty`: Contentbereich kann Lade- oder Empty-State anzeigen.

Wichtig fuer Umsetzung:

- Sidebar-Breite und Contentbereich als feste Layoutannahmen behandeln.
- Shell nicht mit View-spezifischem Content vermischen.
- Neue Desktop-Views sollten sich zuerst an dieser Struktur orientieren.
- Shell-Zustaende sind Routing- und Layout-Zustaende, keine einzelnen Komponentenstates.

### 23 Calendar Item Task

Screenshot: [23_Calendar_Item_Task.png](23_Calendar_Item_Task.png)

`.calendar item - task` ist der kompakte Eintragstyp fuer Aufgaben innerhalb des Calendar Drawers. Er stellt eine Aufgabe in einer zeitlichen Liste dar und muss im Drawer anders funktionieren als ein voller Task-Listen-Eintrag: sehr kompakt, gut scanbar und fuer Drag-and-Drop geeignet.

Varianten und Properties:

- `priority`: aktuell in Figma u. a. `Default` und eine Drag-Variante abgebildet.
- `state`: `Default`, `prio-high`, `selected`, `drag-placeholder`.
- `checkbox`: Aufgabe kann direkt als erledigt markiert werden.
- `title/meta`: Aufgabenname und kurze Kontextinformationen.

States:

- `default`: normaler Task im Calendar Drawer.
- `prio-high`: Aufgabe wird als priorisiert sichtbar gemacht; im Code besser als eigene Priority-Property statt als visueller Sonderfall modellieren.
- `selected`: Eintrag ist ausgewaehlt oder gehoert zum aktuell geoeffneten Detail.
- `dragged`: Eintrag folgt dem Pointer bzw. Tastatur-Drag; sollte leicht angehoben wirken und ueber umliegenden Eintraegen liegen.
- `drag-placeholder`: reserviert die urspruengliche oder zukuenftige Position im Drawer, waehrend das eigentliche Element gezogen wird.

Wichtig fuer Umsetzung:

- Dragged und Placeholder sind funktionale DnD-Zustaende und muessen technisch getrennt vom Hover-State umgesetzt werden.
- Placeholder darf keine echte Aufgabe ausloesen und sollte fuer Screenreader als Drop-Position bzw. Reorder-Ziel behandelt werden.
- Die Checkbox bleibt ein eigener interaktiver Bereich und darf Drag-Start nicht ungewollt ausloesen.
- Bei Tastaturbedienung sollte Reordering auch ohne Pointer moeglich sein.

### 24 Calendar Item Imported

Screenshot: [24_Calendar_Item_Imported_Calendar.png](24_Calendar_Item_Imported_Calendar.png)

`.calendar item - importet calendar` beschreibt externe oder normale Kalenderereignisse im Calendar Drawer. Diese Eintraege repraesentieren meist importierte Termine und unterscheiden sich von Tasks dadurch, dass sie nicht direkt abhakbar sind.

Varianten und Properties:

- `State`: `Default`, `Urgent`.
- `state`: `Default`, `selected`, `dragged`, `drag-placeholder`.
- `title/time`: Terminname und zeitlicher Bezug.
- `source`: optionaler Kalender- oder Herkunftskontext.

States:

- `default`: normaler Kalendertermin.
- `urgent`: visuell hervorgehobener Termin, z. B. kurzfristig oder konfliktbehaftet.
- `selected`: Termin ist aktuell aktiv oder im Detailbereich geoeffnet.
- `dragged`: Termin wird innerhalb der Zeitachse verschoben.
- `drag-placeholder`: zeigt die Zielposition beim Verschieben eines Termins.

Wichtig fuer Umsetzung:

- Externe Kalenderereignisse koennen je nach Kalenderquelle eventuell nur lesend sein. Dann darf Drag-and-Drop nicht angeboten werden.
- Urgent ist ein fachlicher Status und sollte nicht mit Task-Priority verwechselt werden.
- Beim Verschieben muss die neue Zeit im Modell aktualisiert oder eine Kalender-Sync-Rueckfrage ausgeloest werden.

### 25 Calendar Item Block

Screenshot: [25_Calendar_Item_Block.png](25_Calendar_Item_Block.png)

`.calendar item - block` ist der Drawer-Eintrag fuer Zeitbloecke. Er verbindet Kalenderzeit mit Fokuna-spezifischen Blockeigenschaften wie Kategorie, Farbe, Icon oder Timer-Kontext.

Varianten und Properties:

- `state`: `default`, `selected`, `drag-placeholder`, `dragged`.
- `category`: farbliche Kennzeichnung des Blocks.
- `title/time`: Blockname und Zeitbereich.
- `metadata`: optionale Hinweise wie Timer, Musik oder Wiederholung.

States:

- `default`: normaler Block im Drawer.
- `selected`: Block ist aktiv ausgewaehlt oder wird im Editor bearbeitet.
- `dragged`: Block wird zeitlich verschoben; visuell oberhalb der Liste darstellen.
- `drag-placeholder`: reserviert die Zielposition und Groesse des Blocks.

Wichtig fuer Umsetzung:

- Blockeintraege sind in der App staerker steuerbar als importierte Termine.
- Category-Farbe darf fuer Erkennung eingesetzt werden, Icon-Stroke bleibt bei farbiger Flaeche `icon/inverse`.
- DnD muss Dauer und Startzeit respektieren; Placeholder sollte die neue geplante Position zeigen.

### 26 Task Add Item

Screenshot: [26_Task_Add_Item.png](26_Task_Add_Item.png)

`C - Desktop - Add ItemItem` ist der Inline-Einstieg zum Anlegen neuer Aufgaben oder Unteraufgaben. Die Komponente wechselt von einem ruhigen Add-Trigger in ein aktives Eingabeformular.

Varianten und Properties:

- `is subtask`: `false` oder `true`.
- `type`: `inactive` oder `active`.
- `title input`: Aufgabenname.
- `description input`: optionale Beschreibung.
- `quick properties`: Prioritaet, Datum und weitere Metadaten.
- `actions`: Abbrechen und Aufgabe hinzufuegen.

States:

- `inactive`: kompakte Zeile mit Plus und Text, oeffnet das Eingabeformular.
- `inactive subtask`: gleiche Logik, aber textlich und ggf. eingerueckt fuer Unteraufgaben.
- `active`: Formular ist geoeffnet; Eingaben und Actions werden sichtbar.
- `input filled`: fachlich noetig, auch wenn nicht separat als Variante dargestellt.
- `submitting/loading`: sollte technisch vorgesehen werden, wenn Aufgabe gespeichert wird.
- `error`: Validierungsfehler, z. B. leerer Titel, muss ueber Form-Patterns abbildbar sein.

Wichtig fuer Umsetzung:

- Der Wechsel von inactive zu active soll die Liste nicht unkontrolliert verschieben.
- Beim Speichern entsteht ein neues `Task List Item` oder Subtask-Item.
- Escape, Klick ausserhalb oder Abbrechen schliesst den aktiven Zustand und verwirft ungespeicherte Inhalte (Listen und Aufgaben-Modal). Offene Quick-Property-Popovers schliessen zuerst per Escape. Abbrechen ist ein Link-Button ohne Trailing-Icon.
- Quick Properties links: `Prioritaet` und `Datum` oeffnen Popovers (Prioritaetsmenue bzw. DatePicker mit Quick-Chips Heute/Morgen/Kein).
- Enter kann speichern, Shift+Enter sollte in mehrzeiligen Feldern Zeilenumbruch erlauben.
- Im `active`-Zustand entfaellt der untere Border des unmittelbar vorherigen List Items (bzw. des letzten Items in einem Tree), damit die Formular-Card keine Doppellinie erzeugt. Listen-Container nutzen dafuer die Klasse `fk-task-list`.

### 27 Task Group Header List Item

Screenshot: [27_Task_Group_Header_List_Item.png](27_Task_Group_Header_List_Item.png)

`C - Desktop - Task Group Header List Item` ist der Kopf einer normalen Aufgaben-Gruppe. Er strukturiert Listenabschnitte wie Abschnitte, Tagesgruppen oder thematische Gruppen.

Varianten und Properties:

- `status`: `default`, `hover`.
- `expanded`: visuell ueber Chevron ableitbar, technisch als eigene Collapse-Property fuehren.
- `title`: Gruppenname, z. B. Abschnitt.
- `drag handle`: optional fuer Umordnung von Gruppen.

States:

- `default`: Gruppe ist sichtbar und nicht aktiv angefasst.
- `hover`: zeigt Interaktion fuer Drag Handle, Collapse oder Bearbeitung.
- `expanded`: Aufgaben der Gruppe sind sichtbar.
- `collapsed`: Aufgaben sind verborgen, nur Header bleibt sichtbar.
- `dragged`: sollte technisch analog zu `Task Group` abgebildet werden, auch wenn Header selbst nur default/hover zeigt.

Wichtig fuer Umsetzung:

- Header klickt nicht automatisch jede Aufgabe an; Collapse/Expand und Drag muessen getrennte Zielbereiche haben.
- Gruppentitel kann spaeter editierbar werden, sollte aber nicht mit dem ganzen Header-Klick kollidieren.
- Hover darf keine Hoehenspruenge erzeugen.
- Der Count hinter dem Titel nutzt `text-quarternary` (nicht tertiary).
- Der Count zaehlt alle sichtbaren Tasks der Gruppe inklusive verschachtelter Subtasks (nicht nur Root-Items).

### 28 Milestone Header Item

Screenshot: [28_Milestone_Group_Header_List_Item.png](28_Milestone_Group_Header_List_Item.png)

`C - Desktop - Milestone Group Header List Item` ist der Kopf einer Milestone-Gruppe. Er ist dem normalen Task Group Header aehnlich, traegt aber semantisch Fortschritt und Zielbezug.

Varianten und Properties:

- `status`: `default`, `hover`.
- `expanded`: Milestone-Aufgaben sichtbar oder verborgen.
- `title`: Milestone-Name.
- `progress/status`: fachlich ableitbarer Zustand des Meilensteins.

States:

- `default`: normaler Milestone-Kopf.
- `hover`: interaktive Rueckmeldung.
- `expanded`: zugehoerige Tasks sichtbar.
- `collapsed`: nur Milestone-Kopf sichtbar.
- `completed`: sollte fachlich vorgesehen werden, falls ein Meilenstein abgeschlossen ist.

Wichtig fuer Umsetzung:

- Milestones duerfen nicht wie normale Abschnittsueberschriften behandelt werden, weil sie Ziel- und Fortschrittssemantik tragen.
- Fortschrittsanzeige sollte aus enthaltenen Aufgaben berechnet werden.
- Collapse/Expand muss den Timeline-/Milestone-Kontext erhalten.

### 29 Task List Item

Screenshot: [29_Task_List_Item.png](29_Task_List_Item.png)

`C - Desktop - Task List Item` ist der zentrale Listeneintrag fuer Aufgaben. Er verbindet Checkbox, Titel, Metadaten, Ziel-/Datumshinweise, Tags, Favorite und Drag-and-Drop-Verhalten.

Varianten und Properties:

- `state`: `default`, `hover`, `drag-placeholder`, `dragged`.
- `favorite`: `false`, `true`.
- `checkbox`: erledigt/nicht erledigt.
- `title`: Aufgabenname.
- `metadata`: Subtask-Count, Datum, Priority-Tag, Ziel, Kategorie, Labels.
- `priority`: `none` | `urgent` | `high` | `medium` | `low` — steuert das `Tag Item Priority`-Pill in der Meta-Zeile.
- `drag handle`: fuer Reordering.

States:

- `default`: normaler Listeneintrag.
- `hover`: zeigt zusaetzliche Affordanzen wie Drag Handle oder Favorite deutlicher.
- `favorite=false`: Stern/Favorit ist nicht aktiv.
- `favorite=true`: Aufgabe ist favorisiert; Stern aktiv.
- `checked/completed`: fachlich notwendig, auch wenn Checkbox-State aus Unterkomponente kommt.
- `dragged`: Eintrag wird bewegt, wirkt angehoben und bleibt als Inhalt sichtbar.
- `drag-placeholder`: Platzhalter in der Liste fuer die potentielle Drop-Position.
- `selected/open`: falls Klick den Aufgaben-Modal-Slot oeffnet, technisch als ausgewaehlter Kontext fuehren.

Wichtig fuer Umsetzung:

- Checkbox, Favorite, Drag Handle und Zeilenklick brauchen getrennte Event-Zonen.
- Drag-and-Drop darf nicht beim Anklicken der Checkbox starten.
- Metadata-Tags muessen mit bestehenden Tag- und Category-/Priority-Tokens arbeiten.
- Meta-Reihenfolge: Subtasks → **Tag Item Priority** (nur wenn Prioritaet ≠ `none`) → Faelligkeit → Ziel → Kategorie → Labels.
- `Tag Item Priority` ist kein allgemeiner Tag, sondern ein runder Priority-Marker ausschliesslich in der Task-List-Item-Meta: farbiger Kreis (16px) + Flag-Icon (8px), ohne Textlabel. Farben aus `--fk-color-task-priority-*`; Medium nutzt `text-secondary` fuer das Icon, die uebrigen `task-priority-on-color`. Labels (`Wichtig` / `Hoch` / `Medium` / `Niedrig`) bleiben als `aria-label`/`title`.
- Faelligkeits-Meta: `Heute` und `Morgen` duerfen betont werden (`tone=coral`); alle anderen Daten (inkl. spaetere Zukunft und formatierte Datumsangaben) nutzen neutrales Grau wie Standard-Meta (`tone=neutral`) — keine Korall-/Error-Farbe fuer spaetere Termine.
- Lange Titel muessen umbrechen oder ellipsieren, ohne die Listenhoehe unkontrolliert zu zerstoeren.
- Hierarchie: bis zu fuenf Ebenen (`indentLevel` 0–4). Chevron- und Checkbox-Spalte sind gleich breit (16px), Gap 8px → Indent-Schritt 24px. Dadurch sitzt der Chevron des Kindes zentriert unter der Parent-Checkbox, und der Parent-Titel beginnt an der linken Kante der Kind-Checkbox.
- Auf Ebene 5 (`indentLevel` 4) koennen keine weiteren Subtasks angelegt werden; Expand/Collapse bleibt fuer Ebenen 1–4 mit Kindern verfuegbar.
- Im Aufgaben-Modal entfaellt auf Ebene 5 der gesamte Unteraufgaben-Block.
- Task-Titel (`strong`) erhalten `padding-top: 1px` fuer die optische Vertikalzentrierung zur Checkbox.
- Listen-/Gruppenbreite der Aufgaben-View: `--fk-task-column-width` (Default `800px`); Modal-Subtasks bleiben fluid (`width: auto` / `100%`).
- Rechtsklick oeffnet ein Kontextmenue: Bearbeiten (Modal), Prioritaet (Submenu mit farbigen Flag-Icons), Faelligkeit, Zeitschaetzung und Labels (Level-2-Panels mit denselben Controls wie die Modal-Rail: Quick-Picks + DatePicker bzw. Dauer-Dropdown bzw. Label-Suche/Liste), Verschieben, Duplizieren, Loeschen.
- Prioritaets-Submenu und Modal-Rail nutzen dieselben farbigen `flag`-Icons; Faelligkeit/Zeitschaetzung sind eingebettete Submenu-Panels (nicht separate Popovers). Verschieben listet vorhandene Gruppen (`groupKey`). Loeschen steht separat als destruktive Aktion.
- Das Dauer-Dropdown innerhalb des Zeitschaetzungs-Submenus muss oberhalb des Kontextmenues stacken (`.fk-menu--select` ueber `.fk-menu--submenu`).

### 30 Task Group

Screenshot: [30_Task_Group.png](30_Task_Group.png)

`C - Desktop - Task Group` fasst einen Header, mehrere Task List Items und den Add-Item-Einstieg zu einer sortierbaren Gruppe zusammen.

Varianten und Properties:

- `state`: `default`, `dragged`, `drag-placeholder`.
- `header`: Task Group Header.
- `items`: Liste von Task List Items.
- `add item`: Inline-Erstellung neuer Aufgaben.
- `collapsed`: technisch noetig, auch wenn nicht als eigene Variante im Set liegt.

States:

- `default`: Gruppe mit Header, Aufgaben und Add-Item.
- `collapsed`: nur Header sichtbar; Items und Add-Item verborgen.
- `dragged`: komplette Gruppe wird bewegt, typischerweise kompakter dargestellt.
- `drag-placeholder`: reserviert die Position der Gruppe im Layout.
- `empty`: Gruppe ohne Aufgaben sollte Add-Item oder Empty-Hinweis zeigen.

Wichtig fuer Umsetzung:

- Gruppe ist Container-Pattern, nicht nur visuelle Karte.
- Reordering kann auf Gruppenebene und Item-Ebene stattfinden; beide Logiken muessen sauber getrennt sein.
- Drag Placeholder muss die Gruppenhoehe bzw. den Drop-Kontext plausibel abbilden.
- Wenn das Add Item aktiv ist, entfaellt der untere Border des letzten List Items in der Gruppe (siehe Task Add Item).

### 31 Milestone List Item

Screenshot: [31_Milestone_List_Item.png](31_Milestone_List_Item.png)

`C - Desktop - Milestone List Item` ist der Listeneintrag fuer einzelne Milestones. Er ist dem Task List Item verwandt, enthaelt aber staerkere Ziel-/Fortschrittssemantik.

Varianten und Properties:

- `state`: `default`, `hover`, `drag-placeholder`, `dragged`.
- `favorite`: `false`, `true`.
- `checkbox/progress`: Abschluss oder Fortschritt des Meilensteins.
- `title`: Milestone-Name.
- `metadata`: Fortschritt, Zielname, Datum, Etiketten.

States:

- `default`: normaler Milestone.
- `hover`: zeigt interaktive Flaechen.
- `favorite=false`: nicht favorisiert.
- `favorite=true`: favorisiert.
- `completed`: sollte aus Fortschritt/Checkbox ableitbar sein.
- `dragged`: Milestone wird bewegt.
- `drag-placeholder`: Zielposition beim Reordering.
- `expanded/open`: wenn zugehoerige Aufgaben gezeigt werden.

Wichtig fuer Umsetzung:

- Milestone-Items koennen als Einstieg in eine Milestone-Gruppe oder Detailansicht dienen.
- Fortschrittswerte duerfen nicht hart im UI stehen, sondern muessen aus Tasks/Zielen ableitbar sein.
- Drag-and-Drop sollte Abhaengigkeiten zu enthaltenen Aufgaben beachten.

### 32 Milestone Task Group

Screenshot: [32_Milestone_GroupTask_Group.png](32_Milestone_GroupTask_Group.png)

`C - Desktop - Milestone GroupTask Group` gruppiert Milestones und ihre zugehoerigen Aufgaben in einer Timeline- oder Zielstruktur. Es ist ein zusammengesetztes Pattern fuer Zielplanung und Aufgabenhierarchie.

Varianten und Properties:

- `state`: aktuell `default`.
- `milestones`: Liste aus Milestone List Items oder Headern.
- `tasks`: untergeordnete Task List Items pro Milestone.
- `timeline indicator`: visuelle Verbindung zwischen Milestones.
- `add milestone`: optionaler Einstieg zum Ergaenzen.

States:

- `default`: voll sichtbare Milestone-Gruppe.
- `milestone expanded`: einzelne Milestone-Tasks sind sichtbar.
- `milestone collapsed`: Milestone bleibt sichtbar, Tasks verborgen.
- `milestone completed`: abgeschlossener Abschnitt der Timeline.
- `empty`: keine Milestones vorhanden.
- `dragged/placeholder`: falls Milestones reorderbar sind, analog zu Milestone List Item behandeln.

Wichtig fuer Umsetzung:

- Die Timeline-Linie ist semantisch nur visuell; die Datenstruktur bleibt Milestone -> Tasks.
- Vertikale Rail und Plus von „Meilenstein hinzufügen“ teilen dieselbe X-Achse (`--fk-milestone-axis-x` = Kreismitte). Nach Indent-Grid-Aenderungen an Task Rows diese Achse neu kalibrieren.
- Completion sollte aus den enthaltenen Aufgaben berechnet werden.
- Bei langen Zielstrukturen muss die Gruppe performant rendern und ggf. virtualisiert werden.

### 33 Aufgaben Modal Header

Screenshot: [33_Aufgaben_Modal_Header.png](33_Aufgaben_Modal_Header.png)

`C - Aufgaben - Modal - Header` bildet den oberen Aufgabenbereich im Task-Modal. Er enthaelt Checkbox, Titel, Beschreibung und Favorite und kann zwischen ruhiger Anzeige und Bearbeitung wechseln.

Varianten und Properties:

- `status`: `unfocused`, `focused`, `filled-out`.
- `checkbox`: erledigt/nicht erledigt.
- `favorite`: Favorit an/aus.
- `title`: Aufgabenname.
- `description`: optionale Beschreibung.
- `actions`: Abbrechen/Speichern im fokussierten Zustand.

States:

- `unfocused`: normaler Lesemodus, keine aktive Bearbeitung.
- `focused`: Bearbeitungsmodus mit Eingabeflaechen und Actions.
- `filled-out`: ausgefuellter Zustand mit sichtbarer Beschreibung.
- `completed`: ueber Checkbox ableitbar; Titel ggf. visuell als erledigt markieren.
- `favorite`: ueber Favorite Checkbox ableitbar.
- `saving/error`: technisch notwendig beim Persistieren bzw. bei Validierung.

Wichtig fuer Umsetzung:

- Der Header ist kein statischer Textblock, sondern ein inline editierbares Aufgabenformular.
- Speichern/Abbrechen duerfen nur im Bearbeitungszustand sichtbar bzw. aktiv sein.
- Beschreibung kann leer sein, soll aber im Edit-Modus als Feld erreichbar bleiben.

### 34 Aufgaben Modal Menu Rechts

Screenshot: [34_Aufgaben_Modal_Menu_Rechts.png](34_Aufgaben_Modal_Menu_Rechts.png)

`C - Aufgaben - Modal - Menu rechts` ist die rechte Eigenschaftsleiste im Aufgabenmodal. Sie sammelt strukturierte Task-Properties wie Prioritaet, Faelligkeit, Zeitschaetzung und Labels.

Varianten und Properties:

- `priority`: aufklappbarer Property-Bereich.
- `due date`: Faelligkeit/Datum.
- `time estimate`: Zeitschaetzung.
- `labels`: Labels (Taxonomie; Chip-Komponente bleibt §18 Tags).
- `plus action`: oeffnet bzw. erweitert den jeweiligen Bereich.

States:

- `collapsed/default`: alle Property-Zeilen sind kompakt.
- `row hover`: einzelne Property-Zeile reagiert.
- `row expanded`: Detailauswahl ist sichtbar.
- `value set`: Zeile zeigt gesetzten Wert statt Plus oder Placeholder.
- `disabled`: Property kann in bestimmtem Kontext nicht bearbeitet werden.

Wichtig fuer Umsetzung:

- Aufgeklappte Bereiche sollen bestehende Komponenten nutzen: Dropdown, Date Picker, Tags, Slider/Input je nach Property.
- Property-Popovers haben keinen eigenen Titel und kein Close-X — die Rail-Zeile benennt die Aktion bereits (analog zu den Level-2-Panels im Aufgaben-Kontextmenue). Klick ausserhalb oder Escape schliesst nur das Popover, nicht das Task-Modal.
- Plus ist eine Add-/Open-Aktion, kein reiner Dekorationshinweis.
- Property-Werte muessen in der Task-Datenstruktur gespeichert werden und auch in List Items erscheinen koennen.

### 35 Aufgaben Modal Task Slot

Screenshot: [35_Aufgaben_Modal_Task_Slot.png](35_Aufgaben_Modal_Task_Slot.png)

`.slot - aufgaben modal - task` ist der zusammengesetzte Slot fuer das Aufgabenmodal. Er verbindet Breadcrumb, Aufgaben-Header, Subtask-/Task-Gruppe, rechte Eigenschaftsleiste und Loeschaktion. Die zusammengesetzte Live-Composition liegt unter §42 Modals.

Varianten und Properties:

- `breadcrumb`: Kontextpfad zur Aufgabe.
- `header`: Aufgaben Modal Header.
- `subtasks`: Task Group bzw. Unteraufgaben.
- `right menu`: Aufgaben Modal Menu Rechts.
- `delete action`: destruktive Aktion.
- `modal close`: ueber uebergeordnetes Modal/Slot-Pattern.

States:

- `default`: Aufgabe wird angezeigt.
- `editing title/description`: Header ist fokussiert.
- `subtasks expanded`: Unteraufgaben sichtbar.
- `subtasks empty`: Add-Item fuer erste Unteraufgabe.
- `property editing`: rechte Eigenschaftsleiste hat eine geoeffnete Property.
- `delete confirm`: vor dem Loeschen oeffnet sich die Confirmation-Variante unter §42 Modals; erst nach Bestaetigung wird geloescht.
- `saving/loading`: Aenderungen werden gespeichert.

Wichtig fuer Umsetzung:

- Dieser Slot sollte innerhalb des bestehenden Modal-Patterns verwendet werden, nicht als eigenstaendiges Overlay.
- Unteraufgaben nutzen dieselbe Task-Listenlogik wie normale Aufgaben, aber mit Subtask-Kontext.
- Auf der tiefsten Hierarchieebene (Ebene 5) wird der Unteraufgaben-Block im Modal vollstaendig ausgeblendet.
- Subtask-Items im Modal haben keinen Hover-Hintergrund.
- Die Unteraufgaben-Group-Header-Zeile im Modal hat keinen Hover-Hintergrund.
- Loeschen ist destruktiv und braucht die Confirmation-Variante unter §42 Modals.
- Breadcrumb, Header und rechte Property-Leiste muessen mit den entsprechenden Pattern-Library-Komponenten verbunden bleiben.
- Der Count hinter dem Titel (z. B. Unteraufgaben) nutzt `text-quarternary`.
- Dialoghoehe: `min(80dvh, 900px)`, damit das Modal beim Oeffnen als Arbeitsflaeche wirkt und nicht auf Inhaltsmindesthoehe schrumpft.

### 36 Block Bar & Rail

Screenshot: [36_Block_Timeline_Edit_Rail.png](36_Block_Timeline_Edit_Rail.png)

`C - Desktop - Blocks` verbindet einen wiederverwendbaren Block-Baustein mit zwei vertikalen Rails. Die Timeline stellt die aktiven Zeitblock-Typen dauerhaft in der App-Navigation bereit; die Edit Rail ordnet dieselben Typen kompakt und zeigt freie Positionen fuer weitere Blocks.

Varianten und Properties:

- `BlockTile tone`: `coral`, `purple`, `gold`, `blue`, `pink`, `teal`; gespeist aus den Category-Tokens.
- `BlockTile icon`: austauschbare 24px-Instanz aus dem zentralen Iconset, standardmaessig mit 2px Stroke und `icon/inverse`.
- `BlockTile badge`: optionale 16px-Badge fuer offene bzw. enthaltene Eintraege.
- `BlockRail state`: `default` oder `editable`.
- `padding`: Timeline (`default`) `20 px` oben, `12 px` seitlich, `24 px` unten; Edit Rail unveraendert.
- `activeId`: markiert den aktuell gewaehlten Block und wird ueber `onActiveChange` aktualisiert.
- `emptySlots`: Anzahl der freien Edit-Slots; Figma zeigt sechs Positionen.

States:

- `default/timeline`: 72 x 840px, ruhige `surface/subtle`-Flaeche, Top-Padding 20px, sechs Blocks oben und Edit-Aktion unten.
- `editable`: 72 x 645px, weisse Card-Flaeche, 20px Radius, weicher Shadow und 8px innenliegende Schmucklinie.
- `selected`: der aktive Block wird semantisch ueber `aria-pressed` markiert; die Kategorie-Kachel bleibt visuell ruhig und unveraendert.
- `empty`: 40 x 40px freier Slot mit `surface/subtle`, 12px Radius und neutralem Verlauf-Stroke.
- `badge`: korallenfarbener Zaehler rechts oben; die Tile-Geometrie bleibt unveraendert.
- `hover/focus`: dezente Helligkeitsreaktion bzw. sichtbarer Tastatur-Fokus, ohne Layoutverschiebung.

Wichtig fuer Umsetzung:

- `BlockTile` ist eine eigenstaendige Komponente und darf auch in Karten, Auswahlfenstern und Block-Vorlagen wiederverwendet werden.
- Die beiden Rails komponieren `BlockTile`; sie duplizieren weder Icon- noch Badge-Logik.
- Sortierung und Drag-and-drop werden spaeter durch die Anwendungslogik geliefert. Die Pattern-Komponente stellt dafuer stabile IDs und die visuelle Edit-Struktur bereit.
- Kategorie, Icon und Badge sind Daten des Blocks. Die Rail selbst entscheidet nicht ueber deren Inhalt.
- Die Timeline bleibt im normalen App-Betrieb sichtbar. Die Edit Rail ist ein temporaerer Bearbeitungszustand und zeigt freie Slots explizit.

### 37 Goal Card

Screenshot: [37_Goal_Card.png](37_Goal_Card.png)

`C - Desktop - Goal Card` ist die kompakte Zielvorschau der Ziele-Uebersicht. Sie verbindet ein optionales Titelbild, den berechneten Zielfortschritt, Titel und Kontextdaten mit einer Vorschau der naechsten Meilensteine. Die gesamte Karte kann als Navigation in die Ziel-Detailansicht dienen.

Varianten und Properties:

- `title`: kurzer, praegnanter Zielname; lange Titel duerfen umbrechen, ohne Metadaten zu ueberlagern.
- `image`: optionales Ziel- oder Motivbild im 144px hohen Media-Slot; ohne Bild erscheint eine ruhige tokenisierte Platzhalterflaeche.
- `progress`: Wert von 0 bis 100; visuell als 48px-SVG-Ring in einer konkav gerundeten Media-Aussparung und technisch als Progressbar ausgegeben. Der Stroke startet bei 12 Uhr, laeuft im Uhrzeigersinn und besitzt runde Enden.
- `location`: optionaler Ortskontext mit 16px-Icon.
- `tags`: optionale Liste aus Label und austauschbarem 16px-Icon; die Zeile darf bei mehreren Eintraegen umbrechen.
- `milestones`: geordnete Meilensteinliste mit Titel, optionalem Datum und optionaler Subtask-Statistik.
- `milestonePreviewLimit`: optionale explizite Obergrenze. Ohne Vorgabe zeigt die Karte bis zu drei vorhandene Meilensteine vollstaendig; ab dem vierten wird automatisch eine Summary-Zeile reserviert.
- `totalMilestones`: Gesamtzahl fuer den Hinweis auf weitere Meilensteine.
- `emptyMilestoneActionLabel` und `emptyMilestoneActionHref`: optionale Aktion des zentrierten Empty States. Innerhalb einer insgesamt verlinkten Goal Card bleibt der Aktionstext Teil des Kartenlinks.
- `href`: macht die Karte zu einem semantischen, tastaturbedienbaren Link zur Ziel-Detailansicht.

States:

- `default`: 274 x 396px mit 8px Aussenpadding, 20px Card-Radius, 16px Media-Radius und Subtle Element Shadow.
- `hover/pressed`: dezente Elevation bzw. Rueckkehr in die Ausgangslage, ohne die innere Geometrie zu veraendern.
- `focus visible`: klarer tokenisierter Tastaturfokus ausserhalb der Karte.
- `without context`: fehlen Ort und Tags, wird die komplette Kontextzeile entfernt; es bleiben keine leeren Icons oder Phantomabstaende.
- `milestone without metadata`: fehlen Datum und Subtasks, bleibt nur der Meilensteintitel sichtbar und der naechste Eintrag rueckt sauber nach.
- `empty milestones`: eine zentrierte Fahne und der Hinweis `Keine Meilenstein` in `text-quarternary` sowie die gruene Aktion `Anlegen` ersetzen die Timeline, ohne die Kartenbreite oder Media-Geometrie zu veraendern.
- `without image`: der Media-Slot bleibt fuer ein stabiles Kartenraster erhalten und zeigt einen neutralen Bild-Platzhalter.

Wichtig fuer Umsetzung:

- Fortschritt, Meilensteinanzahl und Subtask-Zaehler werden aus den Goal-Daten berechnet und nicht als unabhaengige UI-Werte gespeichert.
- Die Timeline ist im Code datengetrieben und nicht absolut positioniert; dadurch bleiben optionale Inhalte und laengere Bezeichnungen robust.
- Bis zu drei vorhandene Meilensteine werden direkt gezeigt. Ab vier Eintraegen reserviert die automatische Vorschau den dritten Slot fuer `+ X weitere Meilensteine`; `milestonePreviewLimit` kann dieses Verhalten fachlich ueberschreiben.
- Der abgeschlossene Meilenstein verwendet ein Checkmark mit 3px Stroke. Die Subtask-Metainformation teilt sich dasselbe Icon-Asset mit dem Task-Pattern; die letzte Timeline-Verbindung fadet per Gradient aus.
- Die konkave Progress-Aussparung wird durch eine 71 x 72px grosse, tokenisierte SVG-Form ueber der rechten unteren Bildecke simuliert. Das Bild selbst bleibt unveraendert; der Fortschrittsring liegt als eigener Layer ueber der Form.
- Der Progressring besitzt keine eigene weisse Hinterlegung. Beim initialen Laden animiert sein Stroke von 0 bis zum normalisierten Zielwert; bei reduzierter Bewegung wird diese Animation deaktiviert.
- Fehlende optionale Inhalte werden vollstaendig aus dem Layout entfernt. Platzhalter sind nur fuer den bewusst stabil gehaltenen Media-Slot vorgesehen.
- Wenn die gesamte Karte verlinkt ist, duerfen keine weiteren interaktiven Controls in den Link verschachtelt werden.
- Bild-Alternativtext wird nur verwendet, wenn das Motiv zusaetzliche Information traegt; rein dekorative Bilder erhalten einen leeren Alternativtext.

### 38 Insight Dashboard Cards

Screenshot: [38_Insight_Dashboard_Cards.png](38_Insight_Dashboard_Cards.png)

`C - Desktop - Cards` sind die modularen Insight-Karten fuer Ziel-Detail und Insights. Sie sitzen auf dem generischen Card-Slot (`03`) mit Schmuckrahmen und fuellen ihn mit festen Inhaltstypen: Kennzahlen, Aktivitaetsbalken, Meilenstein-Timeline, Progress, Konsistenz und Prioritaeten.

Varianten und Properties:

- `InsightCard`: wiederverwendbare Huelle mit `size` (`sm` 214x216, `md` 452x216, `lg` 452x456), optionalem Icon, Titel, Subtitle und Action-Slot.
- `InsightActivityCard`: Wochenbalken mit optionalem Threshold; Segmenthoehe skaliert mit `max(Daten, Ziel)`, die rote Linie bleibt im Plot unterhalb von Titel/Subline.
- `InsightQuoteCard`: volle Brand-Secondary-Flaeche mit Schmuckzeile (Roboto Serif Italic).
- `InsightPlaceCard`: Media-Karte mit OpenStreetMap (Leaflet) hinter dem Header; standardmaessig ohne Controls und ohne Interaktion.
- Inhalte: Deadline, Metric, Milestones, Progress Ring (konzentrische Halo-/Track-Ringe 180/134px, Stroke 16, Label zentriert), Segment Gauge, Bar List, Consistency, Priorities.

States und Motion:

- Charts und Progress animieren beim Mount (Balken, Segmente, Ring, Consistency-Tage); bei `prefers-reduced-motion` ohne Animation.
- Activity ohne Goal zeigt keine Threshold-Kontrolle; mit Goal steuert der Picker den Threshold live.

Wichtig fuer Umsetzung:

- Keine Chart-Library; reine CSS/SVG-Umsetzung mit Design-Tokens.
- Alle Karten nutzen `Card` inkl. dekorativem Innenrahmen und denselben Elevations.
- Icons stammen aus `@fokuna/icons`; Subtask-Metadaten teilen sich das Icon mit Goal Card / Task.

### 39 Block Card

Screenshot: [39_Block_Card.png](39_Block_Card.png)

`C - Desktop - Card - Time Blocks` ist die Auswahl- und Vorschaukarte fuer einen Time Block (z. B. Meditation). Sie sitzt auf dem generischen Card-Slot (`03`) und kombiniert Kategorie-Kachel, Dauer, Kurzbeschreibung und Metadaten wie Pomodoro oder Sound. Verwandt mit Block Bar & Rail (`36`); die Kachel teilt sich die visuelle Sprache mit `BlockTile`.

Varianten und Properties:

- `title` / `description`: Blockname und kurze Erklaerung (beide `body-lg`; Description in `text-tertiary`).
- `icon` / `tone`: 40×40 Kategorie-Kachel (`BlockTile`-Look); Icon und Kategorie-Farbe kommen aus den Block-Daten.
- `durationLabel` / `durationIcon`: Dauer-Tag (Standard `clock`, Groesse `lg`) neben der Kachel.
- `meta`: optionale Outline-Tags im Footer (z. B. Pomodoro, Sound).
- `onMenuClick` / `menu`: Outline-Icon-Button `more-vertical` in `sm` (28×28) rechts oben.

States:

- `default`: 334 × 240 px, Padding 24, Card-Radius 20, Subtle Elevation, dekorativer Innenrahmen.

Wichtig fuer Umsetzung:

- Die Kategorie-Kachel ist dekorativ und nicht selbst der primaere Selektor; Interaktion laeuft ueber Menu bzw. die umgebende Auswahlflaeche.
- Meta-Tags und Dauer nutzen die bestehende `Tag`-Komponente; Icon-Set aus `@fokuna/icons` (z. B. `balance` fuer Meditation).

### 40 Template Card

Screenshot: [40_Template_Card.png](40_Template_Card.png)

`C - Desktop - Card - Template` ist die Vorschaukarte fuer Journal- bzw. Tages-Templates (konkrete Szenarien wie „Eat that Frog“). Sie sitzt auf dem generischen Card-Slot (`03`) und zeigt Icon, Kurztext und Anzahl der Check-In-/Check-Out-Elemente.

Varianten und Properties:

- `title` / `description`: Template-Name und Beschreibung (beide `body-lg`; Description in `text-tertiary`).
- `icon`: 24px Header-Icon (Standard `notes`).
- `meta`: Outline-Tags mit Element-Zaehlern (z. B. `sunrise` / `sunset` fuer Morgen- und Abend-Elemente).
- `onMenuClick` / `menu`: Outline-Icon-Button `more-vertical` in `sm` (28×28) rechts oben.

States:

- `default`: 374 × 240 px, Padding 24, Card-Radius 20, Subtle Elevation, dekorativer Innenrahmen.
- Templates sind inhaltliche Szenarien, keine Dummy-Platzhalterkarten.

Wichtig fuer Umsetzung:

- Footer zeigt nur Meta-Tags; keine zusaetzliche CTA im Footer.
- Wiederverwendung von `Card`, `Tag`, `Button` und Icons aus `@fokuna/icons`.

### 41 View Overlay

Screenshot: [41_View_Overlay.png](41_View_Overlay.png)

`.slot - Modal Full Screen` ist der globale View-Overlay fuer groessere Bearbeitungs- und Verwaltungsmodi. Er legt sich ueber den kompletten View (Scrim + Panel), gleitet von unten ein und stellt Header, zentrierten Inhaltsslot und Footer-Aktionen bereit. Einsatz u. a. Journal Templates Edit, Ziel bearbeiten und Block bearbeiten.

Varianten und Properties:

- `title` / `icon`: Header links; Titel in `body-xl` Semibold, optionales 24px-Icon in `icon-tertiary`.
- `children`: mittlerer Inhaltsslot, max. 920px breit, vertikal scrollbar.
- `footerStart` / `footerEnd`: Footer-Aktionen; typisch destruktiv links, Verwerfen/Speichern rechts.
- `open` / `onOpenChange` / `trigger`: Radix-Dialog-Steuerung analog zu `Modal`.
- `closeLabel`: zugaengliches Label fuer den Close-Control oben rechts.

States:

- `open`: Scrim (`text-primary` bei 20% Opacity) und Panel (`surface-subtle`, `border-subtle`, Highlight Shadow) decken den View ab.
- `enter`: Panel gleitet von unten ein; Scrim fadet ein.
- Inhaltliche Tabs, Formulare und Listen liegen im Slot und nutzen bestehende Patterns (Tab Bar, Form, Button).

Wichtig fuer Umsetzung:

- Shell bleibt inhaltsneutral; Feature-Layouts (Template-, Ziel-, Block-Edit) belegen nur den Slot.
- Padding 40px (`space-10`), Abstand Header/Body/Footer 80px.
- Keine verschachtelten Fullscreen-Overlays; nested Dialoge bleiben beim bestehenden `Modal`.
- Speichern persistiert, Verwerfen/Close verwirft lokale Aenderungen — Fachlogik liegt in der View.

### 42 Modals

Screenshot: [03_Cards_Slots_and_Modal.png](03_Cards_Slots_and_Modal.png) · [42_Delete_Confirm.png](42_Delete_Confirm.png) · [35_Aufgaben_Modal_Task_Slot.png](35_Aufgaben_Modal_Task_Slot.png)

Gemeinsamer Eintrag fuer alle produktiven Modal-Compositions. Live-Specimen: `/pattern-library/modals`. Navigation unter **Layout · Modals**.

Shell und Basis-Modal (`Modal` / `.slot - Modal`):

- Shell mit Header, Body, Footer; `size`: `sm` (420 px), Default (~560 px), `lg` (760 px).
- Titel-Typografie ausschliesslich ueber Text-Tokens: `Heading/SM` + `heading-primary` Family/Weight. Keine harten `font-size`/`font-weight`-Literale.
- Close `24 px` Icon, Stroke `1.5`.
- Default-Modal-Padding (`20×24`) bleibt die Shell-Basis; Compositions setzen eigene Contracts bewusst per Klasse.
- Nie zwei produktive Dialoge gleichzeitig (z. B. Task-Modal schliessen, dann Organizational oeffnen). Confirmation darf als kurzer Overlay ueber dem Ausloeser liegen.

Organizational Modal:

- Einsatz: Katalog-/Taxonomie-Verwaltung (Kategorien, Labels, spaeter Abschnitte); nicht Task-Detail, nicht Fullscreen.
- Shell: `Modal` `size=sm`; Spacing-Contract `32 / 16 / 24` (Header `32 32 16`, Body `0 32`, Footer `24 32 32`).
- Views Create / Liste / Detail immer mit Footer; Header nur Titel (keine Description-Subline).
- Create: Name + Farbe; Erfolg schliesst Modal. Footer: „… verwalten“ (tertiary) + CTA.
- Liste: Katalogzeilen; Footer „Neues …“.
- Detail: Felder wie Create; Footer destruktives Loeschen links + Primary Speichern rechts; Zurueck nur im Listenflow. Name und Farbe werden erst mit Speichern persistiert.
- Referenz: `TaxonomyCreateModal` / `TaxonomyOrganizeModal`.

Confirmation Modal:

- Pflicht vor Loeschen von Aufgabe, Kategorie oder Label.
- Gleicher Org-Shell-Contract; Message im Body (`Body/LG`); Name und `N Aufgaben` in `Label/Primary`.
- Kategorie: Cascade inkl. Nested-Descendants; Label: Aufgaben bleiben.
- Footer rechtsbuendig (`flex-end`, Gap `12`): Abbrechen (outline tertiary, ohne Icon) direkt links neben Primary Loeschen.
- Referenz: `ConfirmDeleteModal`.

Aufgaben Modal:

- Zusammengesetzter Task-Detail-Dialog (`TaskModalDialog` + `TaskModalSlot` + Header + Menu).
- Breite ca. `848 px`, Hoehe `min(80dvh, 900px)`.
- Bausteine im Detail: §33 Header, §34 Menu Rechts, §35 Task Slot.
- Delete Action oeffnet Confirmation Modal (§42 Variante).
- Breadcrumb optional; Subtasks ueber Task Group; Property-Rail rechts.

Verwandt:

- View Overlay (§41) bleibt eigener Fullscreen-Slot — nicht Teil dieser sm/md-Modal-Seite.

Wichtig fuer Umsetzung:

- Neue Dialoge zuerst gegen §42 und das Live-Specimen `/pattern-library/modals` pruefen.
- Organizational Spacing und Footer-Logik nicht neu erfinden.
- Typografie nur ueber `--fk-type-font-…`-Tokens.

### 43 Toast

Screenshot: [43_Toast.svg](43_Toast.svg)

Kurzlebige, nicht-blockierende Bestaetigung fuer **reversible Sekundaeraktionen** — unten zentriert, **einzeilig**. Primaerer Produktfall: Aufgabe per Sidebar-Drop in eine andere Kategorie verschieben, mit optionalem Rueckgaengig. Destruktive Aktionen bleiben beim Confirmation Modal (§42).

Aufbau und Verhalten:

- Viewport fixed, `bottom` `space-6`, horizontal zentriert; Swipe nach unten schliesst.
- Slot: `surface-base`, `border-default`, Radius `16 px` (`radius-xl`), Elevation `shadow-medium-card`.
- Titel: einzeilig `Body/MD` mit normalem Body-Gewicht (`body-primary`), nicht Label/Semibold.
- Action: `Button` `type=icon-text-inline` `size=sm`, Leading-Icon vor dem Label (Default Undo: `arrow-undo-down`); Farbe Text + Icon `text-action-secondary` (Hover: `text-action-secondary-hover`).
- Auto-Dismiss ca. 6 s; gleiche `id` ersetzt den vorherigen Toast (z. B. rasche Drops derselben Aufgabe).
- API: `ToastProvider` (App-Root) + `useToast().toast({ title, action? })`.

Einsatz:

- Geeignet: Kategorie-Verschieben, vergleichbare Undo-faehige Anpassungen ohne Modal.
- Nicht geeignet: Loeschen, irreversibles, komplexe Entscheidungen — dafuer §42 Confirmation.
- Nicht uebermassig einsetzen; jeder Fall bewusst waehlen.
- Keine zweizeiligen Descriptions — Toast bleibt einzeilig.

Verwandt:

- Callout (§02) fuer inline Hinweise im Layout; Toast fuer globale, zeitlich begrenzte Rueckmeldung.
- Confirmation Modal (§42) fuer destruktive Bestaetigungen.

Wichtig fuer Umsetzung:

- Kein zusaetzliches Sonner-Package noetig — Basis ist Radix Toast im bestehenden `radix-ui`-Stack, an Fokuna Tokens angepasst.
- Live-Specimen: `/pattern-library/toast`.

## Einsatz im Lastenheft

Diese Pattern-Library-Uebersicht soll zusammen mit den View-Screenshots und View-Uebergabenotizen gelesen werden. Die Views zeigen das konkrete Produktverhalten; diese Datei zeigt die wiederverwendbaren Bausteine dahinter. Fuer technische Folgearbeiten sollte erst geprueft werden, ob ein UI-Element bereits in dieser Pattern Library existiert, bevor ein neues technisches Component Pattern definiert wird.
