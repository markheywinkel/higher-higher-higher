import type { PlatformDef } from "../entities/platforms/Platform";
import type { FluttererPath } from "../entities/enemies/Flutterer";

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

export const PLAYER_START = { x: 110, y: 640 };

export const PLATFORMS: PlatformDef[] = [
  { id: "p0", type: "solid", x: 110, y: 670 },
  { id: "p1", type: "solid", x: 300, y: 590 },
  { id: "p2", type: "falling", x: 120, y: 510 },
  { id: "p3", type: "solid", x: 340, y: 430 },
  { id: "p4", type: "moving-h", x: 90, y: 350, range: 140, speed: 70 },
  { id: "p5", type: "solid", x: 350, y: 270 },
  { id: "p6", type: "falling", x: 180, y: 190 },
  { id: "p7", type: "moving-v", x: 380, y: 120, range: 90, speed: 55 },
  { id: "p8", type: "solid", x: 170, y: -60 },
  { id: "p9", type: "moving-h", x: 380, y: -140, range: 120, speed: 75 },
  { id: "p10", type: "solid", x: 150, y: -220 },
  { id: "p11", type: "falling", x: 350, y: -300 },
  { id: "p12", type: "moving-v", x: 120, y: -380, range: 100, speed: 60 },
  { id: "p13", type: "solid", x: 340, y: -460 },
  { id: "p14", type: "solid", x: 160, y: -540 },
  { id: "p15", type: "solid", x: 240, y: -700 },
];

export const GOAL_PLATFORM_ID = "p15";

/** Enges Wandsprung-Kamin kurz vor p8 – Aufstieg nur per Double-/Wandsprung möglich. */
export const WALLS: WallDef[] = [
  { id: "w0", x: 130, y: 20 },
  { id: "w1", x: 210, y: 20 },
];

export const GROUND_ENEMIES: GroundEnemyDef[] = [
  { type: "waddler", platformId: "p1" },
  { type: "sprinter", platformId: "p3" },
  { type: "super-sprinter", platformId: "p8" },
  { type: "waddler", platformId: "p10" },
  { type: "sprinter", platformId: "p13" },
];

export const FLYING_ENEMIES: FlyingEnemyDef[] = [
  {
    type: "flutterer",
    path: { axis: "x", from: 150, to: 300, cross: 310 },
  },
  {
    type: "flutterer",
    path: { axis: "y", from: -20, to: 60, cross: 170 },
  },
  {
    type: "super-flutterer",
    path: { axis: "x", from: 160, to: 330, cross: -420 },
  },
  {
    type: "super-flutterer",
    path: { axis: "x", from: 170, to: 330, cross: -660 },
  },
];
