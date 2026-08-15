# Higher, higher, higher

Browser-Jump'n'Run: Von Plattform zu Plattform immer höher über der Lava.

## Entwicklung

```bash
npm install
npm run dev
```

Öffnet unter `http://localhost:5173`.

```bash
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal ansehen
npm run lint       # ESLint
```

## Steuerung

- **A/D** oder **Pfeiltasten links/rechts** – Gehen
- **Shift** (halten) – Rennen (macht den Sprung intensiver)
- **Leertaste** oder **Pfeil hoch** – Springen
- Gegen eine Wand springen und im richtigen Moment erneut die Sprungtaste drücken – **Wandsprung**
- **R** – Neustart nach Game Over / Sieg

## Technik

- [Phaser 3](https://phaser.io/) (Arcade Physics) + TypeScript + Vite
- Alle Grafiken sind aktuell einfache Platzhalter-Rechtecke/Kreise
  (`src/textures.ts`) – sobald echte Sprites vorhanden sind, dort durch
  `this.load.image(...)`/Spritesheets ersetzen.
- Level-Layout (Plattformen, Wände, Gegner) ist datengetrieben in
  `src/level/levelData.ts` definiert – neue Abschnitte lassen sich dort
  ohne Code-Änderungen ergänzen.

## Spielmechanik

- Vier Plattformtypen: solide, herabfallend (kurz nach Betreten),
  horizontal und vertikal beweglich (trägt den Spieler mit).
- Fünf Gegnertypen: Watschler (patrouilliert), Sprinter (folgt auf der
  Plattform, fällt an der Kante), Supersprinter (folgt auch über
  Plattformgrenzen hinweg per Sprung), Flatterer und Superflatterer
  (fliegende Pendants dazu).
- Kein Energiebalken – nur der Sturz in die Lava ist Game Over.
- Gegnerkontakt von oben (Stomp) tötet den Gegner; seitlicher Kontakt
  stößt den Spieler zurück, verursacht aber keinen direkten Tod.

## Nächste Schritte

- Eigene Grafiken/Musik einbinden (siehe `src/textures.ts` für die
  Stellen, die ersetzt werden müssen).
- Level-Balancing: Sprungdistanzen und Schwierigkeitskurve testen und
  anhand der Werte in `src/level/levelData.ts` und
  `src/config/constants.ts` anpassen.
- Sound-Effekte und Hintergrundmusik einbauen.
- Veröffentlichung z. B. über itch.io (HTML5-Upload aus `dist/`).
