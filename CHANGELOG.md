## v1.17.12 – Forschungsfenster-Hotfix

- Fehler behoben, durch den das Forschungsfenster trotz gesetzter `hidden`-Klasse sichtbar blieb.
- Ursache war ein beim Öffnen gesetzter Inline-Wert `display:grid`, der die CSS-Regel zum Ausblenden überstimmte.
- Öffnen und Schließen bereinigen jetzt `display`, `visibility` und `pointer-events` zuverlässig.
- Vorheriger Pausenzustand wird beim Öffnen gespeichert und beim Schließen korrekt berücksichtigt.
- Mobile Kopfzeile des Forschungsfensters neu angeordnet, damit der X-Knopf auch auf schmalen Displays sichtbar bleibt.
- README, Startbildschirm und Versionsangaben auf v1.17.12 aktualisiert.

## v1.17.11 – Mobile Feinschliff & Akkuschutz

- Sicherungsaufrufe für `visibilitychange` und `pagehide` ergänzt; gespeichert wird weiterhin ausschließlich zwischen Angriffswellen.
- Aktive Kämpfe verwenden die normale Browser-Bildrate, Pause und Dialogfenster etwa 8 Bilder pro Sekunde; im Hintergrund wird die Darstellung nahezu vollständig angehalten.
- Drei rechte Taktikknöpfe in ein kompaktes Taktikmenü mit Statusanzeige zusammengeführt.
- Minimierfunktion für das Einheiten-Auswahlfenster ergänzt.
- Touchbereich der Baukarten-Informationssymbole auf bis zu 42 Pixel vergrößert, während der sichtbare Kreis kompakt bleibt.
- Bevölkerungsanzeige in den oberen HUD-Header verschoben: aktuelle Bewohner / Wohnkapazität sowie freie Bewohner werden direkt angezeigt.
- README, Anleitung, Startbildschirm und Versionsangaben auf v1.17.11 aktualisiert.

## v1.17.10 – Pause- & Mehr-Menü-Hotfix

- Fehler behoben, durch den die Partie nach dem Pausieren nicht mehr fortgesetzt werden konnte.
- Das Pausefenster entfernt beim Öffnen veraltete Inline-Sichtbarkeitswerte und wird dadurch zuverlässig angezeigt.
- Der obere Pause-/Weiter-Knopf schaltet jetzt robust zwischen Pause und Fortsetzen um.
- Das mobile Mehr-Menü wird nicht mehr durch `renderGameUI()` bei jeder HUD-Aktualisierung geschlossen.
- Sichtbarkeit und Pointer-Bedienung des Mehr-Menüs werden beim Öffnen und Schließen explizit synchronisiert.
- Versionsangaben auf v1.17.10 aktualisiert.

## v1.17.9 – Mobile Bedienkomfort & Performance

- Touch-Eingabe überarbeitet: Kleine Fingerbewegungen verschieben die Karte nicht mehr, bevor die Ziehschwelle erreicht ist.
- Pinch-Zoom verankert den Weltpunkt unter dem aktuellen Fingermittelpunkt und unterstützt gleichzeitiges Zwei-Finger-Verschieben.
- Pausierte Partien werden nicht mehr durch einen beliebigen Kartentipp fortgesetzt.
- Mobile Hauptnavigation auf fünf feste Schaltflächen mit zusätzlichem Mehr-Menü umgestellt; Desktop-Navigation bleibt vollständig direkt erreichbar.
- Baukarten-Navigation um Pfeile, Randverläufe, Zentrierung der Auswahl und gespeicherte Scrollposition pro Reiter erweitert.
- Sechs Steingebäude-WebP-Dateien auf maximal 384 Pixel optimiert; Gesamtgröße von etwa 7,4 MB auf etwa 0,25 MB reduziert.
- Mobile und viewportkritische CSS-Regeln aus `style.css` in die neu eingebundene `mobile.css` ausgelagert.
- Anleitung, README, Startbildschirm und Versionsangaben auf v1.17.9 aktualisiert.

## v1.17.8 – Stabiles HUD & Flacker-Fix

- Das im Handyvideo sichtbare Springen wurde auf zwei wechselnde horizontale Scrollpositionen der oberen Leiste zurückgeführt.
- Header von Flex-Scroll-/Scroll-Snap-Verhalten auf eine feste, überlauffreie Grid-Anordnung umgestellt.
- `overflow-x`, Scroll-Snap und die festgeschriebene `--app-width`-Pixelbreite entfernt beziehungsweise deaktiviert.
- Statusfeld darf seine Breite nicht mehr durch wechselnde Gegnerzahlen auf die Nachbarfelder übertragen.
- `backdrop-filter` im Haupt-HUD und die animierte Glanzfläche des Angriffsknopfs entfernt, um GPU-Flackern in Chrome zu vermeiden.
- Versionsangaben, README und Startbildschirm auf v1.17.8 aktualisiert.

## v1.17.7 – Steingrafiken für Gebäude

- Eigene Gebäudegrafiken für alle Steinaufwertungen von Versorgungsgebäuden hinterlegt.
- Neue Assets eingebunden für **Steinhaus**, **Steinsägewerk**, **Großer Steinbruch**, **Steinwerkstatt**, **Steinmetzhütte** und **Handelshaus**.
- Die Renderlogik erkennt das Material eines Gebäudes und nutzt bei `stone` automatisch den passenden Steinsprite.
- Vorhandene Holzgebäude und Spielstände bleiben unverändert kompatibel; nur die Darstellung der aufgewerteten Gebäude wechselt.
- README, Startbildschirm und Versionsangaben wurden auf v1.17.7 aktualisiert.

## v1.17.5 – HUD-Ruhe & Versorgungsreserve

- Die App-Höhe verwendet auf modernen Mobilbrowsern die stabile Einheit `100svh`; Animationen der Chrome-Adressleiste verschieben die obere Bedienleiste nicht mehr fortlaufend.
- JavaScript passt die Höhe nur noch auf älteren Browsern beziehungsweise bei echtem Orientierungs- oder Breitenwechsel an.
- Eine Auswahl im Kriegsrat schließt das Fenster sofort und setzt das Spiel fort.
- Der gewählte Kriegsratsbefehl bleibt über weitere Wellen gespeichert, bis der Spieler einen anderen Befehl auswählt.
- Der letzte intakte Holzfäller erhält in den Wellen 1 bis 6 zusätzlichen Schutz gegen Plünderer.
- Fehlt vollständig ein intakter Holzfäller, sammelt die Burg im Kampf automatisch 0,22 Notfallholz pro Sekunde bis zu einem Vorrat von 70 Holz.
- Ressourcenübersicht, Anleitung und Versionsangaben wurden aktualisiert.

## v1.17.4 – Mobile Bedienleisten-Fix

- Fehler behoben, durch den die untere Navigationsleiste auf bestimmten Android-Handys teilweise hinter der Systemnavigation lag.
- Neue Synchronisierung der App-Höhe mit `window.visualViewport.height`; Fallback bleibt `100dvh` beziehungsweise `100vh`.
- Die Höhe wird beim Start, beim Ändern der Browsergröße und nach einem Orientierungswechsel erneut berechnet.
- Mobile Bauleiste auf 82 px und bei sehr niedriger Ansicht auf 76 px verdichtet.
- Mobile Navigationsknöpfe auf 52 px beziehungsweise 48 px verdichtet, ohne Reiter zu entfernen.
- Versionsangaben wurden auf v1.17.4 aktualisiert.

## v1.17.3 – Steinbau & Gebäudestufen

- Neue Forschung „Steinbaukunst“ im eigenen Wirtschaftsreiter; verfügbar ab Welle 9 und für 5 Forschungspunkte.
- Vollständig ausgebaute Versorgungsgebäude können zwischen den Wellen dauerhaft zu Steingebäuden erweitert werden.
- Steinhaus, Steinsägewerk, großer Steinbruch, Steinwerkstatt, Steinmetzhütte und Handelshaus besitzen eigene Kosten, Namen und Gebäudeboni.
- Steingebäude erhalten ungefähr 85 bis 100 % mehr Lebenspunkte und erleiden durch Plünderer 25 % weniger Grundschaden statt 40 % Zusatzschaden.
- Produktionsgebäude, Werkstatt, Handwerkerhaus und Markt erhalten einen zusätzlichen Arbeitsplatz; fünf Arbeiter erreichen 135 % Gebäudeleistung.
- Gebäudespezifische Boni verbessern Holz, Stein, Forschung, Reparatur, Markt und Bevölkerung.
- Handwerker reparieren jetzt auch beschädigte Versorgungsgebäude; Steingebäude benötigen dabei zusätzlich 0,1 Stein pro Reparaturtakt.
- Steinaufwertungen erscheinen im Gebäude-Infofenster, in der Auswahlleiste und in der Upgrade-Zentrale; Steinbauten tragen ein sichtbares Fundament und 🏛️-Abzeichen.
- Materialstufe, investierte Ressourcen und Ausbauwelle werden gespeichert; ältere Spielstände werden automatisch als Holzbau übernommen.
- Anleitung und Versionsangaben wurden auf v1.17.3 aktualisiert.

## v1.17.2 – Bevölkerung 2.0

- Die Bewohneranzeige öffnet jetzt eine zentrale Verwaltung mit Gesamtzahl, Beschäftigten, freien Bewohnern, Mindestreserve und geflohenen Arbeitskräften.
- Holzfäller und Steinbrüche besitzen jeweils vier Arbeitsplätze, Handwerkerhaus und Werkstatt drei, der Marktplatz zwei.
- Die Gebäudeleistung skaliert mit der Besetzung: 1 Bewohner = 45 %, 2 = 75 %, 3 = 100 %, 4 = 120 %.
- Vier freiwillige Automatikprofile verteilen Bewohner ausgewogen, für Ausbau, für Verteidigung oder mit Rohstofffokus; manuelle Zuteilung bleibt jederzeit zwischen Wellen möglich.
- Eine einstellbare Mindestreserve schützt freie Bewohner für Neubauten und Notfälle.
- Die Werkstattbesetzung verändert Forschungskosten von +25 % ohne Personal bis −10 % bei voller Besetzung.
- Mehrere Bewohner im Handwerkerhaus erscheinen als einzelne Handwerker; die Gesamtleistung bleibt über die Gebäudeeffizienz kontrolliert.
- Während Angriffswellen ist die Zuteilung gesperrt. Nach zerstörten Arbeitsplätzen gelten Bewohner bis Wellenende als geflohen und kehren danach zurück.
- Arbeitsverteilung und Mindestreserve werden im Spielstand gespeichert; ältere Ein-Arbeiter-Spielstände werden automatisch übernommen.
- Auswahlfenster, Gebäudeinformationen, Ressourcenübersicht und Anleitung zeigen Arbeitsplätze, Besetzung und Leistung übersichtlich an.
- Versionsangaben im Spiel wurden auf v1.17.2 aktualisiert.

# Changelog

## v1.17.1 – Kampagnenbelohnungen

- Drei dauerhafte Weltsiegel für die Grenzmark: Verteidigung, Held und Kommandant.
- Bonusziele, Häuptlingssiege und der Weltsieg erzeugen einen dauerhaften Kommandantenpunkt-Bestwert.
- Neues Kommandantenlager direkt auf der Kampagnenkarte.
- Fünf freischaltbare Startvorteile für Gold, Holz, Stein, Forschung und Andreas-Opferpunkte.
- Höchstens zwei Startvorteile können gleichzeitig aktiviert werden.
- Aktive Vorteile gelten nur beim Beginn einer neuen Kampagne und nicht rückwirkend für laufende Spielstände.
- Kampagnenstatistik speichert beste Bonuszielzahl und das Überleben von Andreas in den vier Bosswellen.
- Kartenprofile und Spielstände aus v1.17.0 bleiben kompatibel.

## v1.17.0 – Kampagnenkarte

- Neuer großer Kampagnenkarten-Bildschirm zwischen Startmenü und Festung.
- Die bisherige 32-Wellen-Kampagne ist jetzt **Welt 1 – Die Grenzmark**.
- Vorhandene Spielstände können direkt auf der Weltkarte fortgesetzt werden.
- Vier weitere Regionen sind sichtbar: Nebelwald, gefrorener Pass, verbrannte Ebenen und das Herz des Eisenclans.
- Nicht fertige Welten öffnen nur eine Vorschau mit dem Hinweis **„Noch im Aufbau“**.
- Rückkehr zur Kampagnenkarte ist zwischen zwei Wellen über das Pause-Menü möglich.
- Separates lokales Kartenprofil merkt Bestfortschritt, Bosse und zuletzt gespielte Welt.
- Speicherstände aus v1.16.0 bleiben kompatibel.

## v1.16.0 – Kampagne & Endlosmodus

- Die reguläre Partie besitzt jetzt ein klares Ziel: Die Festung muss 32 Wellen der Eisenclans überstehen.
- Welle 8, 16, 24 und 32 bilden eigene Kampagnenmeilensteine mit stärkeren Häuptlingen und einmaligen Belohnungen.
- Der finale Kriegsherr in Welle 32 besitzt deutlich mehr Leben, Schaden und eine größere rote Bossdarstellung.
- Ein goldener Kampagnenbutton zeigt den Fortschritt und öffnet eine Übersicht mit allen Meilensteinen, Belohnungen und dem nächsten Ziel.
- Nach dem Sieg erscheint ein eigenes Abschlussfenster mit der Wahl zwischen Kampagnenende und Endlosmodus.
- Der Endlosmodus übernimmt die vollständige Festung, beginnt mit Welle 33 und verstärkt spätere Häuptlinge weiter.
- Kampagnenstatus, Meilensteine, Endlosfortschritt und eine noch offene Siegesentscheidung werden im Spielstand gespeichert.
- Alte Spielstände bis Welle 32 beginnen regulär in der Kampagne; ältere Spielstände oberhalb von Welle 32 werden automatisch als Endlospartie übernommen.
- Die Anleitung erklärt Kampagne, Meilensteine, finalen Kriegsherrn und Endlosmodus.
- Versionsangaben im Spiel wurden auf v1.16.0 aktualisiert.

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

- Gegner-Sprites nutzen jetzt eine deutlich lebendigere Laufanimation mit Schrittbewegung, Wippen und leichter Körperrotation.
- Die Schatten wurden näher an die Einheit gesetzt und an die Bewegung gekoppelt, damit Gegner nicht mehr schwebend wirken.
- Beim Angreifen wird nun ein kurzer Bewegungsimpuls ausgelöst, damit Treffer visuell klarer lesbar sind.
- Versionsangaben im Spiel wurden auf v1.15.34 aktualisiert.

# Fortress Commander – Changelog

## v1.15.33 – Gegnergrafiken

- Für alle sechs Gegnerklassen wurden neue comicartige Sprites integriert: Plünderer, Clanspäher, Speerjäger, Eisenschild, Blutberserker und Eisenclan-Häuptling.
- Das Gegner-Rendering verwendet jetzt bevorzugt eigene Bildassets; die bisherige Vektorzeichnung bleibt als technischer Fallback bestehen.
- Versionsangaben im Spiel wurden auf v1.15.33 aktualisiert.

## v1.15.32 – Schotterwege

- Neue comicartige Schotterweg-Grafik für die vier Hauptstraßen integriert.
- Die Straßen enden jetzt knapp außerhalb des äußeren Mauerrings und führen nicht mehr bis in den Wald.
- Kreisförmige Innenwege bleiben erhalten; Versionsangaben wurden auf v1.15.32 aktualisiert.

## v1.15.31 – Turm- und Statuengrafiken

- Neue Comic-Grafiken für Bogenturm, Armbrustturm, Katapult und Kriegerstatue integriert.
- Rendering der vier Bauwerke auf Sprite-Basis umgestellt, inklusive Auswahlmarkierung sowie Lebens- und EXP-Anzeigen für Türme.
- Versionsangaben im Spiel auf v1.15.31 aktualisiert.

## v1.15.30 – Außenbereich-Korrektur
- die Außenbereich-Grafik wurde als durchgehende Wald- und Wiesenlandschaft ohne sichtbare Kachelgrenzen neu aufgebaut
- die grüne Zone rund um die Festung bleibt zur Mitte hin offen und wird zu den Kartenrändern dichter bewaldet
- das vorhandene Render-Verhalten bleibt bestehen; nur das Umgebungs-Asset wurde korrigiert

## v1.15.29 – Außenbereich-Grafik
- der grüne Kartenboden ab dem mittleren Festungsring nutzt jetzt eine detailreichere Außenbereich-Grafik
- Waldzonen, Sträucher, Felsen und kleine Naturdetails werden über ein neues Umgebungs-Asset dargestellt
- die bisherigen prozeduralen Außenbereich-Details bleiben als Fallback erhalten, falls das Asset nicht geladen werden kann

## v1.15.28 – Turmplatz-Sichtbarkeit
- Turmfundamente am mittleren und äußeren Mauerring werden nur noch bei ausgewähltem Turmbau angezeigt
- bereits belegte Turmplätze erhalten keine zusätzliche Fundament-Markierung
- das Verhalten entspricht jetzt den Turmplätzen direkt an der Holzfestung

## v1.15.27 – Innerer Mauerring-Ausbau
- der innere Mauerring startet jetzt als Holzpalisade statt als feste Steinmauer
- innere Segmente können wie die mittlere und äußere Holzpalisade zu Steinmauern ausgebaut werden
- innere Mauersegmente speichern jetzt ihr Material korrekt in Spielständen

## v1.15.26 – Festungshof-Skalierung
- der Festungshof wurde vergrößert und auf den Innenbereich bis an den Mauerring angepasst
- die saubere Freistellung bleibt erhalten; nur die Skalierung und Platzierung im Asset wurden optimiert
- keine Renderlogik geändert; das aktualisierte Hof-Asset wird weiterhin direkt geladen

## v1.15.25 – Festungshof-Bereinigung
- der Festungshof verwendet jetzt eine bereinigte Bodengrafik ohne weiße Ränder und ohne eingebrannte Bauplatz-Overlays
- die Grafik ist sauber freigestellt und besser auf den nutzbaren Innenbereich abgestimmt
- der bestehende Renderpfad bleibt unverändert; nur das Hof-Asset und die Versionsangaben wurden aktualisiert

## v1.15.24 – Festungshof-Freistellung
- der sichtbare Karohintergrund außerhalb des runden Festungshofs wurde entfernt
- `assets/environment/fortress-yard.webp` besitzt jetzt echte Transparenz außerhalb der Arena
- Spielmechanik und Positionierung des Hofes bleiben unverändert

## v1.15.23 – Festungshof-Grafik
- der braune Festungshof verwendet jetzt ein neues comicartiges Bodendesign
- Rendering lädt das neue Asset `assets/environment/fortress-yard.webp` direkt aus dem Asset-Ordner
- der bisherige per Canvas gezeichnete Innenhof bleibt als Fallback erhalten, falls das Asset nicht geladen werden kann

## v1.15.22 – Holzburg-Grafik
- die zentrale Holzburg verwendet jetzt eine neue comicartige Hauptgrafik
- Rendering lädt das neue Asset `assets/buildings/wood-fortress-center.webp` direkt aus dem Asset-Ordner
- die bisherige Canvas-Zeichnung der Holzburg bleibt als Fallback erhalten, falls das Asset nicht geladen werden kann

## v1.15.21 – Handwerkerhaus-Grafik
- das Handwerkerhaus (`repair`) verwendet jetzt eine eigene comicartige Gebäudegrafik
- Rendering lädt das neue Asset `assets/buildings/repair-house.webp` direkt aus dem Asset-Ordner
- die bisherige Canvas-Zeichnung bleibt als Fallback erhalten, falls das Asset nicht geladen werden kann

## v1.15.20 – Wirtschaftsgebäude-Grafiken
- Holzfäller, Steinbruch, Handwerkerhaus und Marktplatz verwenden neue comicartige Gebäudegrafiken
- das Rendering lädt die neuen Wirtschaftsgebäude-Assets direkt aus dem Asset-Ordner
- die bisherige Vektorzeichnung bleibt als Fallback erhalten, falls ein Asset nicht geladen werden kann

## v1.15.19 – Wohngebäude-Grafiken
- Zeltlager und Holzhaus verwenden neue comicartige Gebäudegrafiken
- das Rendering lädt die neuen Wohngebäude-Assets direkt aus dem Asset-Ordner
- die bisherige Vektorzeichnung bleibt als Fallback erhalten, falls ein Asset nicht geladen werden kann

## v1.15.18 – Testressourcen
- Rohstoffübersicht erhält eine klar als Testfunktion markierte Werkzeug-Kachel
- Auswahlfenster ermöglicht jeweils +500 Gold, Holz, Stein oder Forschung
- Testgutschriften aktualisieren die Anzeige sofort und werden im Spielstand gespeichert

## v1.15.15 – Kampfanimationen
- Bogenschütze erhält eine kurze Spann- und Schussanimation
- Burgwache erhält einen sichtbaren Schwertschlag mit Hieb-Bogen
- Animationszustände werden direkt aus dem bestehenden Angriffstimer abgeleitet
- Angriffswerte, Nachladezeit, Zielerfassung und Balance bleiben unverändert

## v1.15.14 – Laufanimationen
- zwei Geh-Frames für den Bogenschützen ergänzt
- zwei Geh-Frames für die Burgwache ergänzt
- Framewechsel erfolgt ausschließlich, während sich die jeweilige Einheit tatsächlich bewegt
- im Stillstand wird weiterhin die statische Standgrafik verwendet

## v1.15.13 – Freistellungskorrektur
- Freistellung von Bogenschütze und Burgwache bereinigt
- helle Restflächen und sichtbare Hintergrundkästchen an den Einheiten entfernt
- Einheiten-Grafiken bleiben statisch, Spielverhalten und Steuerung unverändert

## v1.15.12 – Einheiten-Grafiken
- neue statische WebP-Grafiken für Bogenschütze und Burgwache integriert
- Einheiten-Rendering lädt die neuen Grafiken aus dem Asset-Ordner
- bisherige Canvas-Zeichnung bleibt als Fallback erhalten, falls eine Grafik nicht geladen werden kann

## v1.15.11 – Startbildschirm-Optimierung
- Das Titelbild wurde aus der CSS-Datei in `assets/ui/start-screen.webp` ausgelagert.
- Die eingebettete Base64-PNG-Grafik wurde entfernt.
- Aufbau und Bedienung des Startbildschirms bleiben unverändert.
- Die deutlich kleinere WebP-Datei verbessert Dateigröße, Browser-Cache und Wartbarkeit.

## v1.15.10 – Burgwachen-Befehle
- Burgwache erhält einen normalen Bewegungsbefehl wie der Bogenschütze.
- Das bisherige allgemeine Automatik-Icon entfällt für die Burgwache.
- Drei eigene Automatik-Befehle für die Burgwache: Burghalten, Äußerer Ring und Ausfall.
- Alle drei Burgwachen-Befehle tragen einen kleinen Automatik-Hinweis direkt im Button.
- Bogenschützen behalten ihre bisherigen Automatik- und Bereichs-Icons.
