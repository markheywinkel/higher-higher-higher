import type { PlatformDef } from "../entities/platforms/Platform";
import type { FluttererPath } from "../entities/enemies/Flutterer";
import { LEVEL_X_OFFSET, LEVEL_Y_OFFSET } from "../config/constants";

export interface WallDef {
  id: string;
  x: number;
  y: number;
}

export type GroundEnemyType = "waddler" | "sprinter" | "super-sprinter";
export type FlyingEnemyType = "flutterer" | "super-flutterer";

export interface GroundEnemyDef {
  type: GroundEnemyType;
  platformId: string;
}

export interface FlyingEnemyDef {
  type: FlyingEnemyType;
  path: FluttererPath;
}

const X = LEVEL_X_OFFSET;
const Y = LEVEL_Y_OFFSET;

export const PLAYER_START = { x: 110 + X, y: 600 + Y };

/**
 * Sanfte Einführung, bevor der erste Gegner kommt:
 *  p0 – lange Startplattform.
 *  p1 – einfacher Sprung auf eine weitere lange Plattform. Kein Gegner.
 *  p2 – Sprung mit Anlauf auf eine kleinere Plattform. Kein Gegner.
 *  p3 – nur per Wandsprung (Kamin w0/w1) erreichbar. Kein Gegner.
 *  p4 – erster Gegner (Watschler), Plattform bewusst wieder größer.
 * Ab dort erst nur Watschler, später kommt vereinzelt der Sprinter dazu
 * (siehe GROUND_ENEMIES). Supersprinter und Flug-Gegner sind aktuell nicht
 * platziert – das Spiel war insgesamt zu schwer.
 */
export const PLATFORMS: PlatformDef[] = [
  { id: "p0", type: "solid", x: 110 + X, y: 670 + Y, material: "stone", widthOverride: 420 },
  { id: "p1", type: "solid", x: 190 + X, y: 600 + Y, material: "wood", widthOverride: 300 },
  { id: "p2", type: "solid", x: 440 + X, y: 530 + Y, material: "stone", widthOverride: 170 },
  { id: "p3", type: "solid", x: 400 + X, y: 370 + Y, material: "wood", widthOverride: 140 },
  { id: "p4", type: "solid", x: 200 + X, y: 290 + Y, material: "stone", widthOverride: 200 },
  { id: "p5", type: "solid", x: 20 + X, y: 210 + Y, material: "wood" },
  { id: "p6", type: "solid", x: 240 + X, y: 130 + Y, material: "stone" },
  { id: "p7", type: "moving-h", x: -10 + X, y: 50 + Y, range: 140, speed: 70 },
  { id: "p8", type: "solid", x: 250 + X, y: -30 + Y, material: "wood" },
  { id: "p9", type: "solid", x: 80 + X, y: -110 + Y, material: "wood" },
  { id: "p10", type: "moving-v", x: 280 + X, y: -180 + Y, range: 90, speed: 55 },
  { id: "p11", type: "solid", x: 70 + X, y: -360 + Y, material: "stone" },
  { id: "p12", type: "moving-h", x: 280 + X, y: -440 + Y, range: 120, speed: 75 },
  { id: "p13", type: "solid", x: 50 + X, y: -520 + Y, material: "wood" },
  { id: "p14", type: "solid", x: 250 + X, y: -600 + Y, material: "stone" },
  { id: "p15", type: "moving-v", x: 20 + X, y: -680 + Y, range: 100, speed: 60 },
  { id: "p16", type: "solid", x: 240 + X, y: -760 + Y, material: "stone" },
  { id: "p17", type: "solid", x: 60 + X, y: -840 + Y, material: "wood" },
  { id: "p18", type: "solid", x: 200 + X, y: -930 + Y, material: "stone" },
];

export const GOAL_PLATFORM_ID = "p18";

/** Zwei Wandsprung-Kamine: einer als Einführung (p2→p3), einer später (p10→p11). */
export const WALLS: WallDef[] = [
  { id: "w0", x: 360 + X, y: 450 + Y },
  { id: "w1", x: 440 + X, y: 450 + Y },
  { id: "w2", x: 150 + X, y: -270 + Y },
  { id: "w3", x: 230 + X, y: -270 + Y },
];

// Supersprinter vorerst draußen (Sprung-Verfolgung ist der schwerste Gegnertyp) –
// das Spiel war insgesamt zu schwer. Erst Watschler, Sprinter kommt erst spät dazu.
export const GROUND_ENEMIES: GroundEnemyDef[] = [
  { type: "waddler", platformId: "p4" },
  { type: "waddler", platformId: "p6" },
  { type: "waddler", platformId: "p8" },
  { type: "waddler", platformId: "p11" },
  { type: "sprinter", platformId: "p13" },
  { type: "sprinter", platformId: "p16" },
  { type: "waddler", platformId: "p17" },
];

// Flug-Gegner (Flatterer/Superflatterer) sind vorerst deaktiviert – das Spiel war
// insgesamt zu schwer. Mechanik/Code bleibt vorhanden, hier nur keine Platzierungen.
export const FLYING_ENEMIES: FlyingEnemyDef[] = [];
