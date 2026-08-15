import Phaser from "phaser";
import { Enemy } from "./Enemy";
import type { Platform } from "../platforms/Platform";
import { ENEMY_SPEED } from "../../config/constants";

/** Watschler: läuft stur von einem Plattformrand zum anderen. */
export class Waddler extends Enemy {
  protected readonly platform: Platform;
  protected direction: 1 | -1 = 1;
  protected readonly speed: number = ENEMY_SPEED.WADDLER;
  protected readonly margin = 4;

  constructor(
    scene: Phaser.Scene,
    platform: Platform,
    aliveAnim = "watschler-walk",
    deadTexture = "watschler-dead",
  ) {
    // Deutlicher Abstand über der Plattform: Arcade Physics löst eine Kollision, bei der der
    // Body direkt beim Spawn schon tief in einem statischen Body steckt, nicht zuverlässig auf.
    super(scene, platform.leftEdge + 30, platform.topEdge - 50, aliveAnim, deadTexture, false);
    this.platform = platform;
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(this.direction * this.speed);
  }

  get homePlatformId(): string {
    return this.platform.def.id;
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.state !== "alive") return;
    this.tick(time, delta);
  }

  /** Hook für Unterklassen (Sprinter/Supersprinter) statt preUpdate zu überschreiben. */
  protected tick(_time: number, _delta: number): void {
    this.patrol();
  }

  protected patrol(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.x <= this.platform.leftEdge + this.margin && this.direction === -1) {
      this.direction = 1;
    } else if (this.x >= this.platform.rightEdge - this.margin && this.direction === 1) {
      this.direction = -1;
    }
    body.setVelocityX(this.direction * this.speed);
    this.setFlipX(this.direction === -1);
  }
}
