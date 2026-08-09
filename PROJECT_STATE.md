# Fortress Commander – Projektstatus

## Verifizierter Ausgangsstand

- Ausgangsversion: 1.18.18
- Ausgangsrelease: Marktplatz & Lesbarkeit
- Branch: main
- Ausgangscommit: 551a08650094e4ad05e77c0c1ef9c7b77710f42e
- Ausgangscommit war lokal und auf origin/main identisch.
- v1.18.18 ist veröffentlicht; die frühere Angabe „noch nicht committed“ war veraltet.

## Freigegebener Versionsstand

- Zielversion: 1.18.19
- Release-Name: Mehrwelt-Speicherfundament
- Service-Worker-Cache: fortress-commander-v1.18.19
- Status: vom Nutzer manuell getestet und zur Veröffentlichung freigegeben.

## Technische Umsetzung

1. `js/world-definitions.js` enthält unabhängige Definitionen für alle fünf bekannten Kampagnenwelten.
2. Welt 1 `borderlands` bleibt spielbar, verwendet `classic-fortress-v1`, endet nach Welle 32 und besitzt Bosswellen 8, 16, 24 und 32.
3. Welt 2 `mistwood` bleibt `construction`; ihre spätere Freischaltregel nach Abschluss der Grenzmark ist nur vorbereitet.
4. Das Weltkartenprofil verwendet Format 3 und bewahrt getrennte Fortschritte aller bekannten Welten sowie bestehende Kommandantenvorteile.
5. Kommandantenpunkte werden über vorhandene Weltfortschritte summiert; ohne Welt-2-Fortschritt bleibt das Welt-1-Ergebnis unverändert.
6. Laufende Spielsitzung, ausgewählte Kartenwelt und gespeicherte Welt-ID werden eindeutig getrennt.
7. LocalStorage-Schreibfehler der Weltkarte werden abgefangen.

## Savegame-Strategie

- Grenzmark verwendet weiterhin exakt `fortressCommander.save.v1`.
- Nebelwald verwendet vorbereitet `fortressCommander.save.v1.mistwood`.
- Weitere bekannte Welten folgen `fortressCommander.save.v1.<worldId>`.
- Neue Snapshots speichern `worldId` zusätzlich zum unveränderten `saveFormat: 1`.
- Alte Snapshots ohne `worldId` werden ausschließlich als Grenzmark-Save akzeptiert.
- Ein Save mit falscher, widersprüchlicher oder unbekannter Welt-ID wird verständlich abgelehnt.
- Es findet keine physische Migration, Kopie oder Löschung des bisherigen Grenzmark-Saves statt.
- Ressourcen, Forschung, Gebäude, Befestigungen, Bewohner, Einheiten, Kamera, Kampagne, Belagerung, Kriegsrat, Bonusziele und Weltlaufstatistik bleiben Bestandteil des Snapshots.

## Automatischer Prüfstatus

- Savegame-Kompatibilität und Speichertrennung sind statisch sowie durch `tools/validate-multiworld-save.mjs` abgedeckt.
- Der neue Validator prüft Alt-Saves, getrennte Schlüssel, Löschisolation, Profilformat 2 → 3, Mehrweltfortschritt, Kommandantenpunkte, Welle 32, Endlosmodus sowie Kamera- und Einheitenpositionen.
- Bestehende Validatoren bleiben als funktionale Altprüfungen erhalten und werden auf Version 1.18.19 weitergeführt.
- Vollständige Syntax-, Validator-, UTF-8- und Diff-Prüfung wurde nach Patch-Anwendung und vor dem Commit erneut erfolgreich ausgeführt.

## Welt-2-Status

- Der Nebelwald ist in v1.18.19 nicht spielbar.
- Es wurden keine neue Landschaft, Nebeleffekte, Gegner, Routen oder Welt-2-Balancewerte ergänzt.
- Der Kartenknoten bleibt sichtbar und zeigt weiterhin „Noch im Aufbau“.

## Bestätigter manueller Teststatus

- v1.18.19 wurde vom Nutzer manuell über VS Code Live Server / Port 5500 getestet.
- Der manuelle Test war erfolgreich; laut Nutzer funktioniert alles und sieht gut aus.
- Das Mehrwelt-Speicherfundament funktioniert im freigegebenen Stand.
- Der bestehende Stand kann committed und auf `origin/main` veröffentlicht werden.
- Welt 2 bleibt weiterhin im Aufbau und ist noch nicht spielbar.

## Bekannte offene Folgepunkte

1. Der PWA-Updatebanner behauptet auch bei `saveCompatible:false`, dass der Spielstand erhalten bleibt.
2. Offline kann die aktive alte Version bei einem wartenden Update ihre alten Patchdetails ausliefern.
3. Die sechs `data/*.json`-Dateien und vier Dateien unter `docs/` sind weiterhin leer.
4. Einige mobile Update- und Scrollbuttons unterschreiten weiterhin 44 × 44 Pixel.
5. Das vollständige HUD wird weiterhin in jedem Animationsframe aktualisiert.

## Geschützte Balance-Dateien

- data/buildings.json
- data/enemies.json
- data/units.json
- js/buildings.js
- js/combat.js
- js/enemies.js
- js/fortifications.js

Keine Balancewerte ohne ausdrücklichen Auftrag verändern.
