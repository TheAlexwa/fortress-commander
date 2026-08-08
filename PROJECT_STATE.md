# Fortress Commander – Projektstatus

## Verifizierter Stand

- Version: 1.18.17
- Release-Name: Reparaturstabilität
- Branch: main
- Letzter veröffentlichter Ausgangscommit: 440672f0369e06505ad079b28369a144c47ff7f4
- Aktueller v1.18.17-Stand: noch nicht committed
- Service-Worker-Cache: fortress-commander-v1.18.17-r2
- Manueller Spieltest: durchgeführt

## Technischer Prüfstatus

- JavaScript-Syntaxprüfungen für den v1.18.17-Stand bestanden.
- Alle vorhandenen Validatoren nach den Reparaturpatches bestanden.
- UTF-8-Prüfungen ohne bestätigte Mojibake-Schäden.
- CRLF-/LF-Fehlalarm des Stabilitätsvalidators wurde behoben.
- Zerstörungs-, Reparatur- und Clanspäherkorrekturen wurden im Browser über VS Code Live Server / Port 5500 getestet.
- Kein Commit und kein Push für v1.18.17 zum Zeitpunkt dieser Statusdatei.

## In v1.18.17 behoben und getestet

1. Zerstörte mittlere und äußere Mauern sowie Tore bleiben nach 0 HP wirklich zerstört und werden nicht durch Handwerker kostenlos wiederbelebt.
2. Handwerker brechen eine laufende Reparatur ab, sobald die reparierte mittlere/äußere Befestigung vollständig zerstört wurde.
3. Mehrere Handwerker teilen die Reparaturleistung und die zugehörigen Holz-/Steinkosten konsistent; der Ressourcenverbrauch wird nicht mehr pro Handwerker vollständig mehrfach berechnet.
4. Der Stabilitätsvalidator ist gegen CRLF-/LF-Zeilenenden robust und erzeugt auf Windows-Arbeitskopien keinen falschen Änderungsalarm mehr.
5. Clanspäher erreichen den gültigen Angriffspunkt an Mauern und Toren wieder und verursachen dort den bereits vorgesehenen Befestigungsschaden. Die Schadens-/Balancewerte wurden dabei nicht erhöht.
6. Der Service-Worker-Cache wurde für den endgültigen getesteten Stand auf fortress-commander-v1.18.17-r2 erhöht.

## Bekannte bestätigte offene Punkte

1. Der PWA-Updatebanner behauptet auch bei saveCompatible:false, dass der Spielstand erhalten bleibt.
2. Offline kann die aktive alte Version bei einem wartenden Update ihre alten Patchdetails ausliefern.

## Weitere technische Auffälligkeiten

- Alle sechs data/*.json-Dateien sind leer und daher keine gültigen JSON-Dokumente; der aktuelle Laufzeitcode lädt sie laut Audit nicht.
- Abrisserstattungen werden pro Ressourcenart abgerundet.
- Einige mobile Update- und Scrollbuttons unterschreiten 44 × 44 Pixel.
- Das vollständige HUD wird in jedem Animationsframe neu berechnet und beschrieben.
- Mehrere alte Funktions- und CSS-Reste besitzen im aktuellen Projekt keine Verbraucher.
- Speichern des Weltkartenprofils ist nicht an jeder Aufrufstelle gegen LocalStorage-Fehler geschützt.
- Die vier Dateien unter docs/ sind leer.

## Manuell getestete Punkte in v1.18.17

- Zerstörte äußere Mauer bleibt zerstört.
- Laufende Handwerkerreparatur an einer vollständig zerstörten äußeren Befestigung wird nicht fortgesetzt.
- Regulärer Wiederaufbau zerstörter Befestigungen bleibt der vorgesehene Weg.
- Clanspäher verursachen wieder Schaden an Mauern und Toren.
- Der aktualisierte Service Worker lädt den aktuellen Reparaturstand.

## Offene manuelle Tests

- Neues Spiel und reale Alt-Spielstände aus v1.15–v1.18.
- Save/Load inklusive Kamera, Einheitenbefehlen und Festungszuständen.
- Vollständiger Reparatur-/Kostenvergleich mit mehreren Handwerkern in längeren Spielsituationen.
- Mauer-, Tor- und Turmkollisionen in mehreren Wellen.
- Eigene Torwege.
- Gegner an intakten Toren und Breschen.
- Schwere Schildträger und Stauvermeidung.
- Vollständiger Abrissworkflow und Rundung der Erstattung.
- Mobile Portrait-/Landscape-Darstellung.
- PWA-Installation, Offline-Neustart und echter Wechsel zwischen zwei veröffentlichten Service-Worker-Versionen.

## Dokumentationsstatus

- README, CHANGELOG und release-notes.json wurden für v1.18.17 angepasst.
- Die Ingame-Anleitung deckt den aktuellen Funktionsumfang weitgehend ab.
- Reparatur- und Zerstörungszustände wurden in v1.18.17 technisch geklärt.
- Nach dem Commit von v1.18.17 soll diese Datei mit dem tatsächlich erzeugten Commit-Hash aktualisiert werden.
- README und CHANGELOG enthalten laut Audit noch ältere redaktionelle Strukturreste.
- Die vier Dateien unter docs/ sind leer.

## Savegame-Status

- Save-Format 1 und Spielversion werden gespeichert.
- Ressourcen, Forschung, Gebäude, Einheiten, Befestigungen, Bewohner, Kampagne und Kamera werden erfasst.
- Migrationen für ältere Mauergeometrie und Turmplätze sind vorhanden.
- Statische Kompatibilität für den vorgesehenen v1.15–v1.18-Pfad ist plausibel.
- Die v1.18.17-Reparaturen ändern keine grundlegende Savegame-Struktur.
- Rückwärtskompatibilität ist ohne echte historische Savegame-Fixtures nicht vollständig verifiziert.

## Update-/PWA-Status

- Sichtbare Version und GAME_VERSION stehen auf 1.18.17.
- Service-Worker-Cache des getesteten Endstands: fortress-commander-v1.18.17-r2.
- Patchdetails können vor einer Updateinstallation geöffnet werden.
- Release Notes werden online netzwerkzuerst geladen und sicher als Text gerendert.
- Der Cache-Wechsel wurde während der v1.18.17-Reparatur lokal erfolgreich genutzt.
- Zukunftspfade für inkompatible Saves und Offline-Patchdetails bleiben offen.
- Ein echter Browser-Test mit einer wartenden veröffentlichten Folgeversion ist noch offen.

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

1. v1.18.17 nach finaler Git-Prüfung committen und auf GitHub veröffentlichen.
2. Danach in einem kleinen Folgeupdate den PWA-Savehinweis bei saveCompatible:false korrigieren.
3. Offline-Patchdetails bei einem wartenden Update korrigieren und mit einer echten Folgeversion testen.
4. Mobile Update-/Scrollbuttons unter 44 × 44 Pixel prüfen und bei Bedarf vergrößern.
5. Historische Savegame-Fixtures für v1.15–v1.18 anlegen und automatisierte Ladeprüfungen ergänzen.
6. Performance- und Cleanup-Punkte (HUD pro Frame, alte CSS-/Funktionsreste, LocalStorage-Fallback) getrennt und ohne Gameplay-Änderungen bewerten.

## Arbeitsregel für ChatGPT / Work / Codex

Vor jeder Änderung zuerst:

1. PROJECT_STATE.md lesen.
2. Git HEAD prüfen.
3. Branch prüfen.
4. GAME_VERSION prüfen.
5. git status prüfen.

Bei Widersprüchen gilt immer der reale Git-/Dateistand.

PROJECT_STATE.md niemals aufgrund alter Chat-Erinnerungen blind aktualisieren.
Nur bestätigte und überprüfte Informationen eintragen.
