import Phaser from "phaser";

export type PlatformType = "solid" | "falling" | "moving-h" | "moving-v";

export interface PlatformDef {
  id: string;
  type: PlatformType;
  x: number;
  y: number;
  /** Für moving-h/moving-v: Distanz der Bewegung in Pixel (von der Startposition aus). */
  range?: number;
  /** Für moving-h/moving-v: Geschwindigkeit in px/s. */
  speed?: number;
}

export const TEXTURE_BY_TYPE: Record<PlatformType, string> = {
  solid: "platform-solid",
  falling: "platform-falling",
  "moving-h": "platform-moving-h",
  "moving-v": "platform-moving-v",
};

/** Basisklasse für alle Plattformen. */
export class Platform extends Phaser.Physics.Arcade.Sprite {
  readonly def: PlatformDef;

  constructor(scene: Phaser.Scene, def: PlatformDef) {
    super(scene, def.x, def.y, TEXTURE_BY_TYPE[def.type]);
    this.def = def;
    scene.add.existing(this);
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
