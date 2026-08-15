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
 * Plattform 1 (p0) ist die lange Startplattform.
 * Plattformen 1–5 (p0–p4): keine Gegner.
 * Plattformen 6–9 (p5–p8): nur Watschler.
 * Ab Plattform 10 (p9): weitere Gegnertypen kommen nach und nach dazu.
 */
export const PLATFORMS: PlatformDef[] = [
  { id: "p0", type: "solid", x: 110 + X, y: 670 + Y, material: "stone", widthOverride: 420 },
  { id: "p1", type: "solid", x: 300 + X, y: 590 + Y, material: "wood" },
  { id: "p2", type: "falling", x: 120 + X, y: 510 + Y },
  { id: "p3", type: "solid", x: 340 + X, y: 430 + Y, material: "stone" },
  { id: "p4", type: "moving-h", x: 90 + X, y: 350 + Y, range: 140, speed: 70 },
  { id: "p5", type: "solid", x: 350 + X, y: 270 + Y, material: "wood" },
  { id: "p6", type: "falling", x: 180 + X, y: 190 + Y },
  { id: "p7", type: "moving-v", x: 380 + X, y: 120 + Y, range: 90, speed: 55 },
  { id: "p8", type: "solid", x: 170 + X, y: -60 + Y, material: "stone" },
  { id: "p9", type: "moving-h", x: 380 + X, y: -140 + Y, range: 120, speed: 75 },
  { id: "p10", type: "solid", x: 150 + X, y: -220 + Y, material: "wood" },
  { id: "p11", type: "falling", x: 350 + X, y: -300 + Y },
  { id: "p12", type: "moving-v", x: 120 + X, y: -380 + Y, range: 100, speed: 60 },
  { id: "p13", type: "solid", x: 340 + X, y: -460 + Y, material: "stone" },
  { id: "p14", type: "solid", x: 160 + X, y: -540 + Y, material: "wood" },
  { id: "p15", type: "solid", x: 240 + X, y: -700 + Y, material: "stone" },
];

export const GOAL_PLATFORM_ID = "p15";

/** Enges Wandsprung-Kamin zwischen p7 und p8 – Aufstieg nur per Wandsprung möglich. */
export const WALLS: WallDef[] = [
  { id: "w0", x: 130 + X, y: 20 + Y },
  { id: "w1", x: 210 + X, y: 20 + Y },
];

export const GROUND_ENEMIES: GroundEnemyDef[] = [
  { type: "waddler", platformId: "p5" },
  { type: "waddler", platformId: "p6" },
  { type: "waddler", platformId: "p7" },
  { type: "waddler", platformId: "p8" },
  { type: "sprinter", platformId: "p9" },
  { type: "waddler", platformId: "p10" },
  { type: "super-sprinter", platformId: "p12" },
  { type: "sprinter", platformId: "p13" },
];

export const FLYING_ENEMIES: FlyingEnemyDef[] = [
  // Zwischen p9 und p10 – erster Flatterer, taucht erst nach den reinen Watschler-Plattformen auf.
  { type: "flutterer", path: { axis: "x", from: 920, to: 1050, cross: 180 } },
  // Zwischen p11 und p12.
  { type: "flutterer", path: { axis: "x", from: 900, to: 1010, cross: 20 } },
  // Zwischen p13 und p14 – anspruchsvollerer Superflatterer.
  { type: "super-flutterer", path: { axis: "x", from: 920, to: 1010, cross: -140 } },
  // Kurz vor dem Ziel (p14/p15).
  { type: "super-flutterer", path: { axis: "x", from: 900, to: 1000, cross: -260 } },
];
