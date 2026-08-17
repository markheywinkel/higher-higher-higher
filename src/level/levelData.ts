import type { LevelData } from "./types";

/**
 * Standard-Level. Im Level-Editor (editor.html) erstellt und exportiert –
 * lässt sich dort jederzeit weiter bearbeiten (JSON importieren/exportieren).
 */
export const DEFAULT_LEVEL: LevelData = {
  playerStart: { x: 830, y: 930 },
  goal: { x: 920, y: -570 },

  platforms: [
    { id: "p18", type: "solid", x: 920, y: -570, material: "stone" },
    { id: "p19", x: 820, y: 1010, size: 4, type: "solid", material: "stone" },
    { id: "p20", x: 960, y: 1010, size: 4, type: "solid", material: "stone" },
    { id: "p21", x: 1110, y: 1010, size: 4, type: "solid", material: "stone" },
    { id: "p22", x: 1070, y: 850, size: 4, type: "solid", material: "stone" },
    { id: "p23", x: 1250, y: 850, size: 4, type: "solid", material: "stone" },
    { id: "p24", x: 1150, y: 850, size: 4, type: "solid", material: "stone" },
    { id: "p25", x: 1350, y: 710, size: 4, type: "solid", material: "stone" },
    { id: "p26", x: 1490, y: 710, size: 4, type: "solid", material: "stone" },
    { id: "p27", x: 1170, y: 550, size: 4, type: "solid", material: "stone" },
    { id: "p28", x: 1040, y: 550, size: 4, type: "solid", material: "stone" },
    { id: "p29", x: 930, y: 550, size: 4, type: "solid", material: "stone" },
    { id: "p30", x: 750, y: 550, size: 4, type: "solid", material: "stone" },
    { id: "p31", x: 840, y: 550, size: 4, type: "solid", material: "stone" },
    { id: "p32", x: 740, y: 320, size: 4, type: "solid", material: "wood" },
    { id: "p33", x: 890, y: 320, size: 4, type: "solid", material: "wood" },
    { id: "p34", x: 1020, y: 320, size: 4, type: "solid", material: "wood" },
    { id: "p36", x: 1300, y: 320, size: 4, type: "solid", material: "wood" },
    { id: "p37", x: 1440, y: 320, size: 4, type: "solid", material: "wood" },
    { id: "p38", x: 620, y: 550, size: 4, type: "solid", material: "stone" },
    { id: "p39", x: 1250, y: 160, size: 2, type: "falling" },
    { id: "p40", x: 1390, y: 80, size: 2, type: "falling" },
    { id: "p41", x: 1540, y: -10, size: 4, type: "solid", material: "stone" },
    { id: "p42", x: 1660, y: -10, size: 4, type: "solid", material: "stone" },
    { id: "p43", x: 1310, y: -160, size: 4, type: "solid", material: "stone" },
    { id: "p44", x: 1180, y: -160, size: 4, type: "solid", material: "stone" },
    { id: "p45", x: 1040, y: -160, size: 4, type: "solid", material: "stone" },
    { id: "p46", x: 910, y: -160, size: 4, type: "solid", material: "stone" },
    { id: "p47", x: 760, y: -160, size: 4, type: "solid", material: "stone" },
    { id: "p48", x: 570, y: -320, size: 4, type: "solid", material: "stone" },
    { id: "p49", x: 290, y: -410, size: 4, type: "solid", material: "stone" },
    { id: "p50", x: 600, y: -560, size: 4, type: "falling" },
    { id: "p51", x: 290, y: -530, size: 2, type: "moving-h", range: 120, speed: 70 },
    { id: "p52", x: 290, y: -630, size: 2, type: "moving-h", range: 120, speed: 70 },
  ],

  // Zwei Wandspalten (x=410/x=490) bilden zusammen einen Kamin zum Wandsprung-
  // Klettern von der Plattform-Reihe bei y=550 hoch zur Reihe bei y=320. Eine
  // einzelne Wand reicht dafür nicht: ohne Gegenwand zum Abfangen fällt man nach
  // dem Absprung wieder zurück, statt Höhe zu gewinnen.
  walls: [
    { id: "w0", x: 490, y: 130 },
    { id: "w1", x: 490, y: 240 },
    { id: "w2", x: 490, y: 340 },
    { id: "w3", x: 490, y: 430 },
    { id: "w4", x: 410, y: 130 },
    { id: "w5", x: 410, y: 240 },
    { id: "w6", x: 410, y: 340 },
    { id: "w7", x: 410, y: 430 },
  ],

  groundEnemies: [
    { type: "waddler", x: 680, y: 510 },
    { type: "sprinter", x: 820, y: 280 },
    { type: "super-sprinter", x: 850, y: -210 },
    { type: "waddler", x: 290, y: -450 },
  ],

  flyingEnemies: [
    { type: "flutterer", path: { axis: "x", from: 1160, to: 1160, cross: -360 } },
  ],
};
