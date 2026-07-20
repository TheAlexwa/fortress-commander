# Fortress Commander – Changelog

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
