## v1.18.0 – Installierbare Handy-App / PWA

- Fortress Commander kann auf unterstützten Geräten über „Zum Startbildschirm hinzufügen“ als App installiert werden.
- Offizielles blau-goldenes Fortress-Commander-App-Icon in mehreren App-, Maskable-, Apple- und Favicon-Größen ergänzt.
- Manifest und PWA-Metadaten ermöglichen einen Start ohne sichtbare Browserleiste im Standalone-Modus.
- Neuer Lade-/Startbildschirm mit App-Logo für einen einheitlichen App-Start.
- Service Worker speichert alle spielrelevanten Dateien für schnellere Starts und grundlegende Offline-Nutzung zwischen den Wellen.
- Neue Versionen werden erkannt und über einen sichtbaren, freiwilligen Update-Hinweis angeboten.
- Lokale Spielstände und Kampagnenprofile bleiben unverändert erhalten; PWA-Caches enthalten keine Spielstände.
- Installationsknöpfe im Startmenü, unter „Mehr“ und in „Anzeige & Touch“ ergänzt.

## v1.17.14 – Mobile Darstellung & Touchkomfort

- Safe-Area-Unterstützung für abgerundete Displays, Kameralöcher und seitliche Aussparungen ergänzt.
- Die bisherige Querformat-Sperre wurde durch eine kompakte, spielbare Querformatansicht ersetzt.
- Neues Fenster „Anzeige & Touch“ unter Mehr mit HUD-Größe Klein, Normal oder Groß.
- Optionale Vibrationsrückmeldung für Bau, Upgrade, Angriff und ungültige Befehle.
- Wichtige HUD-Werte und Touchflächen wurden auf Mobilgeräten besser lesbar und leichter bedienbar gemacht.
- Ausgewählte Einheiten, Gebäude und Gegner werden auf der Karte deutlicher hervorgehoben.
- Anzeigeeinstellungen werden gerätebezogen im Browser gespeichert und verändern keine Spielstände.

## v1.17.13 – Fenster- & Bedienungs-Stabilität

- Öffnen, Schließen, Fokus, Sichtbarkeit und Pausenzustand aller wichtigen Dialogfenster werden zentral gesteuert.
- Direkte Inline-Werte für `display`, `visibility` und `pointer-events` wurden aus den Fensterfunktionen entfernt.
- Fenster lassen sich einheitlich über Schließen-Knopf, dunklen Hintergrund und Escape schließen.
- Die Android-Zurück-Taste schließt zuerst das oberste geöffnete Fenster, bevor die Seite verlassen wird.
- Der vorherige Pausenzustand wird auch bei bereits pausierten Partien und bei Wechseln zwischen Werte-, Forschungs-, Markt-, Opfergaben- und Veteranenfenstern korrekt übernommen.
- Fokus bleibt innerhalb des aktiven Fensters und kehrt nach dem Schließen zum vorherigen Bedienelement zurück.
- Während eines geöffneten Fensters sind Startmenü, Kampagnenkarte und Spielfläche gegen unbeabsichtigtes Durchklicken gesperrt.
- Marktplatz und Pausemenü besitzen zusätzlich einen gut erreichbaren X-Knopf.
- `node tools/validate-panels.mjs` prüft alle registrierten Fenster, Schließen-Zuordnungen und zentralen Sicherheitsfunktionen automatisch.
- Spielstände aus v1.17.12 bleiben vollständig kompatibel.

## v1.17.12 – Forschungsfenster-Hotfix

- Das Forschungsfenster entfernt beim Schließen seine Inline-Sichtbarkeitswerte und wird dadurch wieder zuverlässig ausgeblendet.
- Der vorherige Pausenzustand wird gespeichert: War das Spiel vor dem Öffnen bereits pausiert, bleibt es nach dem Schließen pausiert.
- Auf schmalen Handys bleibt der Schließen-Knopf fest sichtbar und gut erreichbar.
- Schließen über das X, einen Klick auf den Hintergrund und die allgemeine Zurück-/Abbrechen-Funktion wird unterstützt.
- Spielstände aus v1.17.11 bleiben vollständig kompatibel.

## v1.17.11 – Mobile Feinschliff & Akkuschutz

- Zwischen den Wellen wird beim Wechsel in den Hintergrund, beim Ausschalten des Bildschirms und beim Verlassen des Tabs zusätzlich gespeichert.
- Die Spielschleife läuft im aktiven Kampf weiterhin flüssig, reduziert die Bildrate aber bei Pause und geöffneten Fenstern deutlich und ruht im Browserhintergrund nahezu vollständig.
- Kriegsrat, Bonusziel und Kampagnenfortschritt befinden sich in einem kompakten aufklappbaren **Taktik**-Menü.
- Das Auswahlfenster von Einheiten kann minimiert werden, ohne die Einheit abzuwählen.
- Informationssymbole auf Baukarten besitzen am Handy eine deutlich größere Touchfläche bei unverändert kompakter Darstellung.
- Die Bevölkerungsanzeige wurde aus der unauffälligen rechten Kartenecke in das obere HUD verschoben und zeigt Bewohnerplätze sowie freie Arbeiter an.
- Antippen der Bevölkerungsanzeige öffnet weiterhin direkt die zentrale Bewohnerverwaltung.
- Spielstände aus v1.17.10 bleiben vollständig kompatibel.

## v1.17.10 – Pause- & Mehr-Menü-Hotfix

- Das Pausefenster setzt das Spiel über „Spiel fortsetzen“ oder den oberen Weiter-Knopf wieder zuverlässig fort.
- Versteckte Fenster erhalten keine dauerhaften `display:none`- oder `visibility:hidden`-Inlinewerte mehr.
- Das mobile Mehr-Menü wird nicht mehr bei jeder HUD-Aktualisierung sofort geschlossen.
- Werte, Forschung und Anleitung bleiben nach dem Öffnen des Mehr-Menüs antippbar.
- Spielstände aus v1.17.9 bleiben kompatibel.

## v1.17.9 – Mobile Bedienkomfort & Performance

- Antippen und Ziehen sind sauber getrennt: Die Kamera bewegt sich erst nach Überschreiten einer klaren Ziehschwelle.
- Zwei-Finger-Zoom folgt dem aktuellen Fingermittelpunkt und ermöglicht gleichzeitiges Verschieben der Karte.
- Ein Kartentipp setzt ein pausiertes Spiel nicht mehr unbeabsichtigt fort; fortgesetzt wird ausschließlich über „Weiter“.
- Die mobile Navigation zeigt fünf feste Hauptknöpfe. Werte, Forschung und Anleitung befinden sich unter **Mehr**; am Desktop bleiben alle sieben Bereiche direkt sichtbar.
- Baukarten besitzen Pfeile und Randverläufe, merken sich ihre Position pro Reiter und zentrieren eine gewählte Karte.
- Die sechs Steingebäude-Grafiken wurden von insgesamt rund 7,4 MB auf rund 0,25 MB reduziert, ohne sichtbaren Qualitätsverlust im Spiel.
- Viewport- und mobile HUD-Regeln liegen jetzt gesammelt in `css/mobile.css`; allgemeine Komponenten bleiben in `css/style.css`.
- Spielstände aus v1.17.8 bleiben vollständig kompatibel.

## v1.17.8 – Stabiles HUD & Flacker-Fix

- Die obere Spielleiste ist kein horizontaler Scroll- oder Snap-Bereich mehr und kann daher nicht mehr zwischen zwei Scrollpositionen springen.
- Eine feste Grid-Anordnung hält Wellenanzeige, Status, Pause und Angriff unabhängig von wechselnden Statuswerten an stabilen Positionen.
- Die feste Pixelbreite aus v1.17.7 wurde entfernt; die App verwendet wieder exakt 100 % der aktuellen Layoutbreite ohne horizontalen Überlauf.
- GPU-Blur und die Glanzanimation des Angriffsknopfs wurden entfernt, um Flackern in Chrome auf Laptop und Handy zu vermeiden.
- Spielstände aus v1.17.7 bleiben vollständig kompatibel.

## v1.17.7 – Steingrafiken für Gebäude

- Steinaufgewertete Versorgungsgebäude verwenden jetzt eigene Grafiken statt der bisherigen Holzgebäude mit Fundament-Overlay.
- Hinterlegt wurden individuelle Steingrafiken für **Steinhaus**, **Steinsägewerk**, **Großer Steinbruch**, **Steinwerkstatt**, **Steinmetzhütte** und **Handelshaus**.
- Die Darstellung schaltet automatisch um, sobald ein ausgebautes Gebäude das Material `stone` besitzt.
- Spielstände aus v1.17.6 bleiben vollständig kompatibel.

## v1.17.5 – HUD-Ruhe & Versorgungsreserve

- Die mobile Oberfläche nutzt eine stabile kleine Viewporthöhe, damit die obere Leiste beim Ein- und Ausblenden der Browserleiste ruhig bleibt.
- Der Kriegsrat schließt sich direkt nach einer Auswahl; derselbe Befehl bleibt für kommende Wellen vorgemerkt, bis er geändert wird.
- In den ersten sechs Wellen ist der letzte Holzfäller besser vor Plünderern geschützt. Ohne intakten Holzfäller liefert ein Burg-Sammeltrupp im Kampf 0,22 Holz pro Sekunde, bis 70 Holz erreicht sind.

## v1.17.4 – Mobile Bedienleisten-Fix

- Die tatsächliche sichtbare Höhe des mobilen Browserfensters wird über `visualViewport` ermittelt und als feste Spielhöhe verwendet.
- Die untere Hauptnavigation bleibt dadurch oberhalb der Android-Systemleiste vollständig sichtbar.
- Baukarten und Navigationsknöpfe sind auf kleinen und niedrigen Handybildschirmen kompakter, ohne Funktionen zu entfernen.
- Größenänderungen, Browserleisten und ein Wechsel der Geräteausrichtung lösen eine erneute Höhenanpassung aus.
- `viewport-fit=cover` und `interactive-widget=resizes-content` verbessern die Zusammenarbeit mit mobilen Browsern und sicheren Bildschirmbereichen.

## v1.17.3 – Steinbau & Gebäudestufen

Ab Welle 9 kann in einer Werkstatt die Forschung **Steinbaukunst** freigeschaltet werden. Ein Versorgungsgebäude muss zuerst seine normale Holz-Maximalstufe erreichen und kann anschließend zwischen den Wellen dauerhaft in Stein ausgebaut werden.

### Steinbauten

- Steinhaus: 7 Bewohnerplätze
- Steinsägewerk: +1 Arbeitsplatz und +15 % Holzproduktion
- Großer Steinbruch: +1 Arbeitsplatz und +18 % Steinproduktion
- Steinwerkstatt: +1 Arbeitsplatz und zusätzlich 5 % günstigere Forschung
- Steinmetzhütte: +1 Handwerker und +18 % Reparaturleistung
- Handelshaus: +1 Händler, +10 % Einkommen und 3 Prozentpunkte weniger Handelsverlust
- Alle Steinbauten besitzen deutlich mehr Lebenspunkte und hohen Plündererschutz.
- Reparaturen an Steingebäuden verbrauchen neben Holz 0,1 Stein pro Takt.
- Alte Spielstände bleiben kompatibel und behandeln vorhandene Versorgungsgebäude als Holzbau.

## v1.17.2 – Bevölkerung 2.0

Die Bevölkerung wird jetzt zentral verwaltet. Wirtschaftsgebäude besitzen mehrere Arbeitsplätze und skalieren abhängig von ihrer Besetzung. Zwischen den Wellen kann der Spieler Bewohner manuell verteilen oder eines von vier Automatikprofilen verwenden. Eine Mindestreserve hält Arbeitskräfte für Neubauten und Notfälle frei.

### Arbeitsplätze und Leistung

- Holzfäller: bis zu 4 Bewohner
- Steinbruch: bis zu 4 Bewohner
- Handwerkerhaus: bis zu 3 Bewohner
- Werkstatt: bis zu 3 Bewohner
- Marktplatz: bis zu 2 Bewohner
- Leistung: 1 Bewohner = 45 %, 2 = 75 %, 3 = 100 %, 4 = 120 %
- Werkstattpersonal verändert zusätzlich die Forschungskosten von +25 % bis −10 %.
- Zerstörte Arbeitsplätze setzen Bewohner während der Welle als geflohen; danach werden sie wieder frei oder über das aktive Profil neu verteilt.

## v1.17.1 – Kampagnenbelohnungen

- Die reguläre Partie besitzt jetzt ein klares Ziel: Die Festung muss 32 Wellen der Eisenclans überstehen.
- Welle 8, 16, 24 und 32 bilden eigene Kampagnenmeilensteine mit stärkeren Häuptlingen und einmaligen Belohnungen.
- Der finale Kriegsherr in Welle 32 besitzt deutlich mehr Leben, Schaden und eine größere rote Bossdarstellung.
- Ein goldener Kampagnenbutton zeigt den Fortschritt und öffnet eine Übersicht mit allen Meilensteinen, Belohnungen und dem nächsten Ziel.
- Nach dem Sieg erscheint ein eigenes Abschlussfenster mit der Wahl zwischen Kampagnenende und Endlosmodus.
- Der Endlosmodus übernimmt die vollständige Festung, beginnt mit Welle 33 und verstärkt spätere Häuptlinge weiter.
- Kampagnenstatus, Meilensteine, Endlosfortschritt und eine noch offene Siegesentscheidung werden im Spielstand gespeichert.
- Alte Spielstände bis Welle 32 beginnen regulär in der Kampagne; ältere Spielstände oberhalb von Welle 32 werden automatisch als Endlospartie übernommen.
- Die Anleitung erklärt Kampagne, Meilensteine, finalen Kriegsherrn und Endlosmodus.
- Versionsangaben im Spiel wurden auf v1.17.1 aktualisiert.

## Kampagnenbelohnungen

Die Grenzmark besitzt drei Weltsiegel. Erfüllte Bonusziele, Häuptlingssiege und der Kampagnenabschluss erhöhen Kommandantenpunkte. Im Kommandantenlager werden damit dauerhafte Startvorteile freigeschaltet; vor einer neuen Kampagne können höchstens zwei gleichzeitig aktiviert werden.

## Kampagnenkarte

Nach dem Startmenü öffnet sich eine große Fantasy-Weltkarte. Die aktuelle Kampagne ist **Welt 1 – Die Grenzmark**. Vier weitere Welten sind bereits sichtbar, zeigen beim Antippen aber ausschließlich den Hinweis **„Noch im Aufbau“**. Zwischen zwei Wellen kann die laufende Festung gespeichert und zur Karte verlassen werden.

## v1.15.49 – Bonusziele pro Welle

- Jede Welle erhält ein freiwilliges taktisches Bonusziel mit zusätzlicher Belohnung; ein Fehlschlag beendet die Partie nicht.
- Mögliche Ziele sind vollständige Musterung, Tore halten, Festung unversehrt, äußerer Ring hält, Held ohne Wanken und Häuptling früh brechen.
- Ziele werden nur gewählt, wenn sie mit dem aktuellen Festungsausbau beziehungsweise dem vorhandenen Helden erfüllbar sind; jede achte Welle nutzt das Häuptlingsziel.
- Ein eigener 🎯-HUD-Button und ein übersichtliches Fenster zeigen Aufgabe, Fortschritt, Status und Belohnung vor und während des Angriffs.
- Der Belagerungshinweis nennt das aktuelle Bonusziel und seinen Fortschritt zusätzlich zur Wellenformation.
- Belohnungen umfassen Gold, Holz, Stein, Forschungspunkte, kostenlose Reparatur oder Andreas-EXP.
- Zielzustand und Auswahl werden zwischen den Wellen gespeichert; ältere Spielstände erhalten automatisch ein passendes Ziel.
- Die Anleitung erklärt alle sechs Bonusziele und ihre Belohnungsarten.
- Versionsangaben im Spiel wurden auf v1.15.49 aktualisiert.

## v1.15.48 – Veteranen-Spezialisierungen

- Türme, Bogenschützen, Burgwachen und Andreas schalten auf EXP-Stufe 3 eine einmalige Veteranenwahl frei.
- Jede Einheit beziehungsweise jeder Turm besitzt zwei klar unterschiedliche Wege mit einem starken Vorteil und einem nachvollziehbaren Nachteil.
- Bogentürme wählen Schnellfeuer oder Jagdplattform; Armbrusttürme Panzerbrecher oder Henkerschuss; Katapulte Splittergeschosse oder Brecherkugel.
- Bogenschützen wählen Plänkler oder Scharfschütze; Burgwachen Torwächter oder Ausfallkämpfer; Andreas Wächter der Festung oder Bezwinger des Eisenclans.
- Die Spezialisierungen verändern Zielwahl, Reichweite, Nachladezeit, Flächenschaden, Rüstungsdurchdringung, Bewegung, Rüstung, Eliteschaden und Heldenaura tatsächlich im Kampf.
- Gewählte Wege sind dauerhaft, kostenlos und zusätzlich zu den bisherigen freien EXP-Aufwertungspunkten aktiv.
- Goldene Markierungen auf Karte, Level-Dock, Auswahlleiste, Wertefenster und Upgrade-Zentrale zeigen bereite oder bereits gewählte Veteranenpfade.
- Ein eigenes Auswahlfenster erklärt Rolle, Vorteil und Nachteil beider Wege; die Anleitung enthält alle zwölf Spezialisierungen.
- Ältere Spielstände bleiben kompatibel. Bereits vorhandene Einheiten und Türme ab EXP-Stufe 3 erhalten die Veteranenwahl nach dem Laden.
- Versionsangaben im Spiel wurden auf v1.15.48 aktualisiert.

## v1.15.47 – Kriegsrat vor der Welle

- Vor jeder Welle kann im neuen Kriegsrat genau ein Festungsbefehl gewählt werden.
- Wellentyp, Hauptgegner, gefährlichste Front und passende Empfehlungen werden angezeigt.
- Mauern verstärken, Kampfbereitschaft, Vorräte, Reparaturbereitschaft, Fernkampfvorbereitung und ein neutraler Modus besitzen echte Vor- und Nachteile.
- Wirkungen greifen in Produktion, Markt, Reparaturen, Mauerschaden, Türme und Einheiten ein.
- Die Auswahl ist bis zum Angriff veränderbar, wird danach gesperrt und mit dem Spielstand gespeichert.
- Anleitung und HUD wurden um den Kriegsrat ergänzt.
- Versionsangaben im Spiel wurden auf v1.15.47 aktualisiert.

## v1.15.46 – Gegnerfähigkeiten & Kampfinfos

- Alle sechs Gegnerklassen besitzen jetzt eine eigene aktive oder passive Fähigkeit.
- Clanspäher suchen beschädigte oder offene Tore; Speerjäger greifen aus der zweiten Reihe an.
- Eisenschilde geben nahen Verbündeten Projektilschutz, der durch Katapult-Rüstungsbruch ausfällt.
- Blutberserker verfallen unter 50 % Leben in Raserei; Häuptlinge stärken ihre Eskorte und verursachen beim Tod einen Moralbruch.
- Plünderer greifen im Innenhof bevorzugt Versorgungsgebäude an und verursachen dort erhöhten Schaden.
- Turm- und Einheitenkarten besitzen ein kleines ⓘ mit Rolle, Stärken, Schwächen und taktischem Einsatz.
- Anleitung, Gegnerlexikon und Gegnerdetailfenster erklären Fähigkeiten und passende Konter.
- Versionsangaben im Spiel wurden auf v1.15.46 aktualisiert.

## v1.15.45 – Taktisches Kontersystem

- Bogentürme verursachen gegen Eisenclan-Plünderer und Clanspäher 35 % zusätzlichen Schaden.
- Armbrusttürme ignorieren 50 % der gegnerischen Rüstung und priorisieren gepanzerte Eliteziele.
- Katapulttreffer senken 4 Sekunden lang die Rüstung um 20 Prozentpunkte und das Bewegungstempo um 15 %.
- Burgwachen erhalten nahe intakter Tore +15 % Schaden und +15 Prozentpunkte Rüstung und können Angreifer direkt am Tor binden.
- Bogenschützen können zwischen den Zielprioritäten „Nächste Gegner“, „Schnelle Gegner“ und „Stärkste Gegner“ wechseln.
- Belagerungshinweise empfehlen passende Verteidiger für den angekündigten Wellentyp.
- Konterinformationen erscheinen in Auswahlfenstern, Detailansichten und Anleitung.
- Versionsangaben im Spiel wurden auf v1.15.45 aktualisiert.

## v1.15.44 – Angriffsreihen-Fix

- Gegner in der Kernzone speichern beim ersten Erreichen der Festung einen festen Angriffswinkel.
- Der seitliche Reihenversatz dreht das Angriffsziel dadurch nicht mehr fortlaufend mit.
- Die vordersten Gegner erreichen wieder zuverlässig ihre Angriffsplätze und beschädigen die zentrale Festung.
- Wartende zweite und dritte Reihen rücken nach wie vorgesehen.
- Bestehende Spielstände aus v1.15.43 bleiben kompatibel; fehlende Angriffswinkel werden automatisch ergänzt.
- Versionsangaben im Spiel wurden auf v1.15.44 aktualisiert.

## v1.15.43 – Belagerungsdichte

- Ab Welle 4 steigt die sichtbare Zahl normaler Gegner stufenweise an: +35 % bis Welle 8, +60 % bis Welle 16 und +80 % ab Welle 17.
- Zusätzliche Gegner bestehen ausschließlich aus Plünderern, Spähern und Speerjägern; Eisenschilde, Berserker und Häuptlinge werden nicht künstlich vervielfacht.
- Ein Bedrohungsbudget senkt Leben und Schaden der normalen Massenkämpfer proportional, sodass ihre gemeinsame Kampfstärke trotz höherer Stückzahl nahezu gleich bleibt.
- Goldbelohnung und Kampf-EXP der Massenkämpfer werden ebenfalls proportional verteilt, damit die Wirtschaft und Einheitenentwicklung nicht beschleunigt werden.
- Gegner besitzen eine weiche, typabhängige Kollision und werden sanft voneinander getrennt, statt auf demselben Punkt zu stehen.
- Eine räumlich begrenzte Kollisionsprüfung arbeitet nur mit nahen Gegnern und wird in reduzierter Frequenz ausgeführt, um mobile Geräte zu schonen.
- Ein Schutz gegen Festhängen lockert die Kollision kurzzeitig und gibt blockierten Gegnern einen kleinen seitlichen Impuls.
- Tore besitzen sechs direkte Angriffsplätze, Mauersegmente vier bis fünf und die Festung acht; weitere Gegner bilden sichtbare zweite und dritte Reihen.
- Angriffswellen rücken in Gruppen von acht bis zwölf Gegnern mit kurzen Pausen zwischen den Pulsen vor.
- Gleichzeitig aktive Gegner sind auf 64 bei Mobilgeräten und 72 auf größeren Geräten begrenzt; weitere Gegner bleiben als sichtbare Reserve an den Lagern.
- Lagerreserven werden während der laufenden Welle weiterhin mit Zelt, Silhouetten, Spezialgegner-Symbolen und Restzahl dargestellt.
- Bestehende Spielstände aus v1.15.x bleiben kompatibel; eine bereits vorbereitete alte Belagerung wird unverändert beendet und die neue Dichte gilt ab der folgenden Welle.
- Versionsangaben im Spiel wurden auf v1.15.43 aktualisiert.

## v1.15.42 – HUD-Bereinigung

- Die doppelte Festungs-Lebensanzeige wurde aus der oberen Leiste entfernt.
- Die Holzfestung besitzt jetzt einen deutlich größeren, farbabhängigen Lebensbalken direkt über der Burg, inklusive Warnpuls und Trefferblitz bei kritischem Schaden.
- Die obere Leiste zeigt nur noch Welle, aktuelle Gegner- beziehungsweise Bereitschaftszahl, Pause und Angriff.
- Wellentyp und Frontverteilung stehen ausschließlich im Belagerungshinweis und werden dort auf kleinen Displays vollständig umgebrochen.
- Forschungspunkte wurden aus der Rohstoffleiste entfernt und bleiben am Forschungsbutton sowie in den Forschungsfenstern sichtbar.
- Die Bewohneranzeige wurde auf beschäftigt/gesamt verkürzt; freie Bewohner werden durch einen grünen Punkt signalisiert.
- Die sichtbaren Zoomschaltflächen und die Prozentanzeige wurden vollständig entfernt. Mausrad, Zwei-Finger-Geste und Tastatursteuerung bleiben erhalten.
- Bauplatz-, Ehrenplatz- und Ringbeschriftungen erscheinen nur noch im jeweils passenden Baumodus.
- Lebens- und Erfahrungsbalken von Einheiten, Türmen und Gegnern werden nur noch bei Schaden, Auswahl, Aufwertungsbereitschaft oder besonderen Gegnerklassen eingeblendet.
- Versionsangaben im Spiel wurden auf v1.15.42 aktualisiert.

## v1.15.41 – Angriffsformationen

- Neue Wellentypen kündigen die Zusammensetzung und Angriffsformation bereits während der Belagerungsphase an.
- Späherangriffe konzentrieren schnelle Clanspäher und Speerjäger auf zwei gegenüberliegende Flanken.
- Schildwälle bündeln schwere Eisenschilde an einer klar erkennbaren Hauptfront.
- Berserkerstürme greifen mit vielen Blutberserkern über zwei benachbarte Lager an.
- Vier-Fronten-Angriffe verteilen die Armee bewusst gleichmäßig auf alle vier Tore.
- Jede achte Welle bleibt eine Häuptlingswelle; Boss und Eliteeskorte sammeln sich an einer Schwerpunktfront.
- HUD, Belagerungshinweis, Lageranzeige und Angriffsmeldungen zeigen den aktuellen Wellentyp.
- Wellentyp und Formation werden mit der Belagerungsphase gespeichert; ältere Spielstände bleiben kompatibel.
- Versionsangaben im Spiel wurden auf v1.15.41 aktualisiert.

## v1.15.40 – Ruf des Helden

- Andreas besitzt jetzt die aktiv einsetzbare Spezialfähigkeit „Ruf des Helden“.
- Die Fähigkeit wirkt 10 Sekunden und hat 60 Sekunden Abklingzeit.
- Nahe verbündete Einheiten erhalten während der Wirkung zusätzlich +25 % Schaden, +20 Prozentpunkte Rüstung und +15 % Bewegungstempo.
- Andreas erhält währenddessen +30 Prozentpunkte Rüstung und bindet nahe Gegner im inneren Festungsbereich an sich.
- Ein eigener Fähigkeitsschalter zeigt Bereitschaft, aktive Restzeit und Abklingzeit direkt in der Heldenauswahl an.
- Gold-rote Auraeffekte, verstärkte Einheitenmarkierungen und der Spruch „Für die Festung!“ verdeutlichen die Aktivierung.
- Der Fähigkeitenzustand wird mit dem Helden gespeichert; ältere Spielstände bleiben kompatibel.
- Versionsangaben im Spiel wurden auf v1.15.40 aktualisiert.

## v1.15.39 – Andreas – Heldenauftritt

- Andreas besitzt jetzt eigene transparente Grafiken für Stand und Bewegung im Rot-Gold-Stil.
- Die bisher verwendeten Grafiken der Burgwache werden für Andreas nicht mehr genutzt.
- Ein eigenes Andreas-Porträt wurde in Auswahl-HUD, Aufwertungsanzeigen, Einheitenübersicht und Beschwörungsmeldung integriert.
- Die Auswahlmarkierung des Helden verwendet einen animierten doppelten Gold-Rot-Ring mit vier Heldenmarken.
- Lebens- und Erfahrungsbalken, Namensschild und Detailanzeige wurden auf die größere Heldenfigur abgestimmt.
- Versionsangaben im Spiel wurden auf v1.15.39 aktualisiert.

## v1.15.38 – Opfergabe des Helden

- Die Kriegerstatue stärkt verbündete Einheiten innerhalb der Festung mit +5 % Schaden.
- Gold, Holz und Stein können im neuen Opfergabenfenster im Verhältnis 1:1 gespendet werden.
- Der globale Ritualfortschritt wird bis 2.000 Opferpunkte angezeigt und bleibt beim Speichern erhalten.
- Bei 2.000 Opferpunkten wird einmalig „Andreas, der große Held“ beschworen.
- Andreas besitzt 650 Leben, 35 % Rüstung, erhöhten Schaden gegen Elitegegner und verwendet die Befehle der Burgwache.
- Seine Sammelruf-Aura gewährt nahen verbündeten Einheiten +10 % Schaden, Rüstung und Bewegungstempo.
- Nach der Beschwörung erscheint der Hinweis: „Andreas, der große Held, wurde beschworen, um für die Festung zu kämpfen!“
- Andreas und eine bereits für das Ritual verwendete Kriegerstatue können nicht verkauft werden.
- Bestehende Spielstände aus v1.15.x bleiben kompatibel; alte Spielstände starten mit 0 Opferpunkten.
- Versionsangaben im Spiel wurden auf v1.15.38 aktualisiert.

## v1.15.37 – Belagerungslager 2.0

- Die Belagerungsphase verwendet jetzt vier feste Lager: Nord, Ost, Süd und West.
- Jedes Lager ist eindeutig dem entsprechenden Festungstor zugeordnet.
- Nachzügler behalten ihre geplante Lager- und Torrichtung, statt zufällig an einem Kartenrand zu erscheinen.
- Lageranzeigen zeigen eingetroffene und insgesamt geplante Gegner als Verhältnis an.
- Schildträger, Berserker und Bosse werden direkt am Lager mit Symbol und Anzahl angekündigt.
- Die gefährlichste Angriffsrichtung wird mit einer roten Warnmarkierung hervorgehoben.
- Der Belagerungshinweis im HUD zeigt eine kompakte Vorschau aller vier Fronten.
- Bestehende Spielstände aus v1.15.x bleiben kompatibel.
- Versionsangaben im Spiel wurden auf v1.15.37 aktualisiert.

## v1.15.36 – Forschungsfenster-Fix

- Der Forschungsbutton öffnet den Forschungsbaum wieder zuverlässig.
- Beim Öffnen werden `display`, `visibility` und `pointer-events` des Forschungsfensters explizit reaktiviert.
- Versionsangaben im Spiel wurden auf v1.15.36 aktualisiert.

## v1.15.35 – Gegner bodennäher

- Die Gegner-Sprites wurden einige Pixel tiefer gesetzt, damit ihre Füße optisch auf dem Boden stehen.
- Vertikales Wippen und Angriffsbewegungen wurden reduziert, um den Schwebeeffekt zu beseitigen.
- Schatten sitzen jetzt näher an den Füßen und reagieren nur noch dezent auf die Laufbewegung.
- Versionsangaben im Spiel wurden auf v1.15.35 aktualisiert.

## v1.15.34 – Gegneranimationen verbessert

- Alle Gegner-Sprites bewegen sich jetzt mit einer lebendigeren Laufanimation statt nur zu schweben.
- Schatten wurden näher an die Füße gesetzt und reagieren subtil auf die Bewegung, damit Gegner nicht mehr fliegend wirken.
- Beim Angriff lösen Gegner jetzt einen kurzen Vorwärtsimpuls aus, der den Treffer visuell besser unterstützt.
- Versionsangaben im Spiel wurden auf v1.15.34 aktualisiert.

## v1.15.33 – Gegnergrafiken

- Für alle sechs Gegnerklassen wurden neue comicartige Sprites integriert: Plünderer, Clanspäher, Speerjäger, Eisenschild, Blutberserker und Eisenclan-Häuptling.
- Das Gegner-Rendering verwendet jetzt bevorzugt eigene Bildassets; die bisherige Vektorzeichnung bleibt als technischer Fallback bestehen.
- Versionsangaben im Spiel wurden auf v1.15.33 aktualisiert.

