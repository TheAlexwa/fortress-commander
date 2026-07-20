# Fortress Commander – Changelog

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
