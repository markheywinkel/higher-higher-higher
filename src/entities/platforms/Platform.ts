import Phaser from "phaser";
import { PLATFORM_SIZE } from "../../assets";

export type PlatformType = "solid" | "falling" | "moving-h" | "moving-v";
export type PlatformMaterial = "stone" | "wood";

export interface PlatformDef {
  id: string;
  type: PlatformType;
  x: number;
  y: number;
  /** Nur für type "solid": Steinoptik oder Holzoptik. Default: stone. */
  material?: PlatformMaterial;
  /** Für moving-h/moving-v: Distanz der Bewegung in Pixel (von der Startposition aus). */
  range?: number;
  /** Für moving-h/moving-v: Geschwindigkeit in px/s. */
  speed?: number;
  /** Erzwingt eine abweichende Breite (Textur wird gestreckt) – z.B. für die lange Startplattform. */
  widthOverride?: number;
  /** Größenvariante 1 (klein) – 4 (sehr groß). Default: globales PLATFORM_SIZE. */
  size?: 1 | 2 | 3 | 4;
}

export function resolvePlatformTexture(def: PlatformDef): string {
  const size = def.size ?? PLATFORM_SIZE;
  if (def.type === "solid") {
    return `platform-solid-${def.material ?? "stone"}-${size}`;
  }
  return `platform-${def.type}-${size}`;
}

/** Basisklasse für alle Plattformen. */
export class Platform extends Phaser.Physics.Arcade.Sprite {
  readonly def: PlatformDef;

  constructor(scene: Phaser.Scene, def: PlatformDef) {
    super(scene, def.x, def.y, resolvePlatformTexture(def));
    this.def = def;
    scene.add.existing(this);
    if (def.widthOverride) {
      this.setDisplaySize(def.widthOverride, this.height);
    }
  }

  get leftEdge(): number {
    return this.x - this.displayWidth / 2;
  }

  get rightEdge(): number {
    return this.x + this.displayWidth / 2;
  }

  get topEdge(): number {
    return this.y - this.displayHeight / 2;
  }
}
