# Fortress Commander – Projektstatus

## Verifizierter Stand

- Version: 1.18.18
- Release-Name: Marktplatz & Lesbarkeit
- Branch: main
- Ausgangscommit: 318025b (v1.18.17: Reparatur und Clanspäher-Schaden)
- Aktueller v1.18.18-Stand: noch nicht committed
- Service-Worker-Cache: fortress-commander-v1.18.18
- Manueller Spieltest für v1.18.18: noch ausstehend

## Technischer Prüfstatus

- v1.18.17 wurde manuell getestet und auf GitHub veröffentlicht.
- v1.18.18 erweitert ausschließlich Marktplatz/UI/Dokumentation und Versions-/Prüfdateien.
- Goldproduktion und bestehende Wirtschaftserträge werden nicht reduziert.
- Geschützte Kampf- und Balancewerte bleiben unverändert.
- JavaScript-Syntax, Validatoren, UTF-8 und Git-Diff müssen nach Patch-Anwendung erneut geprüft werden.

## In v1.18.18 vorgesehen

1. Gebäudenamen und Beschreibungstexte in der Arbeitsverteilung erhalten auf dunklen Karten deutlich mehr Kontrast.
2. Der Marktplatz zeigt Gold, Holz und Stein gemeinsam an.
3. Der bestehende Holz-/Gold-Handel bleibt erhalten.
4. Neue Vorratslieferung: 500 Gold werden mit der vorhandenen Marktrate in Holz umgewandelt.
5. Neue Steinlieferungen: 1.500 Gold für 100 Basis-Stein oder 5.250 Gold für 350 Basis-Stein; der vorhandene Handelsabschlag bestimmt die tatsächliche Liefermenge.
6. Die Goldproduktion bleibt unverändert; überschüssiges Gold erhält stattdessen eine zusätzliche freiwillige Verwendung.

## Bekannte bestätigte offene Punkte

1. Der PWA-Updatebanner behauptet auch bei saveCompatible:false, dass der Spielstand erhalten bleibt.
2. Offline kann die aktive alte Version bei einem wartenden Update ihre alten Patchdetails ausliefern.

## Weitere technische Auffälligkeiten

- Alle sechs data/*.json-Dateien sind leer; der aktuelle Laufzeitcode lädt sie laut Audit nicht.
- Abrisserstattungen werden pro Ressourcenart abgerundet.
- Einige mobile Update- und Scrollbuttons unterschreiten 44 × 44 Pixel.
- Das vollständige HUD wird in jedem Animationsframe neu berechnet und beschrieben.
- Mehrere alte Funktions- und CSS-Reste besitzen im aktuellen Projekt keine Verbraucher.
- Speichern des Weltkartenprofils ist nicht an jeder Aufrufstelle gegen LocalStorage-Fehler geschützt.
- Die vier Dateien unter docs/ sind leer.

## Bereits bestätigt aus v1.18.17

- Zerstörte mittlere/äußere Befestigungen bleiben zerstört und müssen regulär neu errichtet werden.
- Handwerker brechen Reparaturen an vollständig zerstörten baubaren Befestigungen ab.
- Mehrere Handwerker teilen Reparaturleistung und Materialkosten konsistent.
- CRLF-/LF-Fehlalarm im Stabilitätsvalidator ist behoben.
- Clanspäher verursachen wieder ihren vorgesehenen Schaden an Mauern und Toren, ohne Balancewertänderung.

## Offene manuelle Tests für v1.18.18

- Arbeitsverteilung auf Handy: Holzfäller, Steinbruch, Handwerkerhaus, Werkstatt und Marktplatz gut lesbar.
- Marktplatz: Gold-, Holz- und Steinwerte korrekt sichtbar.
- 500-Gold-Holzlieferung und beide Steinlieferungen mit korrektem Ressourcenabzug testen.
- Marktplatzstufen/Handelshaus: Handelsabschlag verändert die gelieferte Menge weiterhin korrekt.
- Zu wenig Gold: Lieferung wird abgelehnt, ohne Ressourcen zu verändern.
- Save/Load nach einem Handel zwischen den Wellen.
- Mobile Marktplatzdarstellung ohne abgeschnittene Buttons oder Texte.

## Dokumentationsstatus

- README, CHANGELOG, Ingame-Anleitung und release-notes.json werden mit v1.18.18 aktualisiert.
- Patchdetails beschreiben die neue Goldverwendung und die bessere Lesbarkeit.
- Die bekannten PWA-Folgepunkte bleiben für ein separates Update offen.

## Savegame-Status

- v1.18.18 führt keine neue persistente Datenstruktur ein.
- Bestehende Savegames bleiben daher nach statischer Einschätzung kompatibel.
- Historische Savegame-Fixtures für v1.15–v1.18 bleiben als eigener Prüfschritt offen.

## Geschützte Balance-Dateien

- data/buildings.json
- data/enemies.json
- data/units.json
- js/buildings.js
- js/combat.js
- js/enemies.js
- js/fortifications.js

Keine Balancewerte ohne ausdrücklichen Auftrag verändern.

## Empfohlene nächste Arbeiten

1. v1.18.18 lokal anwenden und über Go Live / Port 5500 testen.
2. Erst nach Testfreigabe PROJECT_STATE.md auf den bestätigten Teststatus setzen und committen.
3. Danach PWA-Savehinweis und Offline-Patchdetails als getrennten kleinen Patch behandeln.
4. Mobile Buttons unter 44 × 44 Pixel separat prüfen.

## Arbeitsregel für ChatGPT / Work / Codex

Vor jeder Änderung zuerst PROJECT_STATE.md, Git HEAD, Branch, GAME_VERSION und git status prüfen. Bei Widersprüchen gilt immer der reale Git-/Dateistand.
