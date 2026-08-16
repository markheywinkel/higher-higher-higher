import type { PlatformDef, PlatformType, PlatformMaterial } from "../entities/platforms/Platform";
import type { FluttererPath } from "../entities/enemies/Flutterer";

export type { PlatformDef, PlatformType, PlatformMaterial, FluttererPath };

export interface WallDef {
  id: string;
  x: number;
  y: number;
}

export type GroundEnemyType = "waddler" | "sprinter" | "super-sprinter";
export type FlyingEnemyType = "flutterer" | "super-flutterer";

/**
 * Boden-Gegner hängen an keiner Plattform-ID mehr, sondern werden zur Laufzeit
 * der nächstgelegenen Plattform darunter zugeordnet (siehe resolveGroundEnemyPlatform).
 * Das macht das Format editorfreundlich: einfach irgendwo über einer Plattform platzieren.
 */
export interface GroundEnemyDef {
  type: GroundEnemyType;
  x: number;
  y: number;
}

export interface FlyingEnemyDef {
  type: FlyingEnemyType;
  path: FluttererPath;
}

export interface LevelData {
  playerStart: { x: number; y: number };
  /** Sieg, sobald der Spieler über diese Höhe hinaus klettert. */
  goal: { x: number; y: number };
  platforms: PlatformDef[];
  walls: WallDef[];
  groundEnemies: GroundEnemyDef[];
  flyingEnemies: FlyingEnemyDef[];
}
