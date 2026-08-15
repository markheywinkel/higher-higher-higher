import Phaser from "phaser";
import { Enemy } from "./Enemy";
import { ENEMY_SPEED, LAVA_Y } from "../../config/constants";

export interface FluttererPath {
  axis: "x" | "y";
  from: number;
  to: number;
  /** Feste Koordinate auf der jeweils anderen Achse. */
  cross: number;
}

/** Flatterer: fliegt stur zwischen zwei Punkten in der Luft hin und her. */
export class Flutterer extends Enemy {
  protected readonly path: FluttererPath;
  protected direction: 1 | -1 = 1;
  protected readonly speed: number = ENEMY_SPEED.FLUTTERER;

  constructor(scene: Phaser.Scene, path: FluttererPath, texture = "flutterer") {
    const startX = path.axis === "x" ? path.from : path.cross;
    const startY = path.axis === "y" ? path.from : path.cross;
    super(scene, startX, startY, texture, true);
    this.path = path;
    this.applyVelocity();
  }

  protected applyVelocity(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (this.path.axis === "x") {
      body.setVelocityX(this.direction * this.speed);
      body.setVelocityY(0);
    } else {
      body.setVelocityY(this.direction * this.speed);
      body.setVelocityX(0);
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (this.state === "dying") {
      if (this.y > LAVA_Y + 40) this.destroy();
      return;
    }

    this.tick(time, delta);
  }

  /** Hook für Unterklassen (Superflatterer) statt preUpdate zu überschreiben. */
  protected tick(_time: number, _delta: number): void {
    const pos = this.path.axis === "x" ? this.x : this.y;
    const min = Math.min(this.path.from, this.path.to);
    const max = Math.max(this.path.from, this.path.to);

    if (pos <= min && this.direction === -1) {
      this.direction = 1;
      this.applyVelocity();
    } else if (pos >= max && this.direction === 1) {
      this.direction = -1;
      this.applyVelocity();
    }
  }
}
