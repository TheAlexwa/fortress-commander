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

