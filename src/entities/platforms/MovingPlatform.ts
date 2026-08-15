import Phaser from "phaser";
import { Platform, type PlatformDef } from "./Platform";

const DEFAULT_RANGE = 120;
const DEFAULT_SPEED = 60;

/** Plattform, die horizontal oder vertikal zwischen zwei Punkten hin- und herfährt. */
export class MovingPlatform extends Platform {
  private readonly axis: "x" | "y";
  private readonly startPos: number;
  private readonly range: number;
  private readonly speed: number;

  constructor(scene: Phaser.Scene, def: PlatformDef) {
    super(scene, def);
    scene.physics.add.existing(this, false);

    this.axis = def.type === "moving-h" ? "x" : "y";
    this.startPos = this.axis === "x" ? this.x : this.y;
    this.range = def.range ?? DEFAULT_RANGE;
    this.speed = def.speed ?? DEFAULT_SPEED;

    this.applyPhysicsTuning();
  }

  /**
   * Erzwingt die Body-Einstellungen erneut. Nötig, weil `Group.add()` einem
   * bereits konfigurierten Body seine eigenen Defaults (u.a. Gravitation)
   * aufdrücken kann – siehe Aufruf in GameScene nach dem Hinzufügen zur Gruppe.
   */
  applyPhysicsTuning(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    if (this.axis === "x") {
      body.setVelocityX(this.speed);
    } else {
      body.setVelocityY(this.speed);
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    const body = this.body as Phaser.Physics.Arcade.Body;
    const pos = this.axis === "x" ? this.x : this.y;
    const traveled = pos - this.startPos;

    const currentVelocity = this.axis === "x" ? body.velocity.x : body.velocity.y;

    if (traveled >= this.range && currentVelocity > 0) {
      if (this.axis === "x") body.setVelocityX(-this.speed);
      else body.setVelocityY(-this.speed);
    } else if (traveled <= 0 && currentVelocity < 0) {
      if (this.axis === "x") body.setVelocityX(this.speed);
      else body.setVelocityY(this.speed);
    }
  }

  /** Bewegung seit letztem Frame, damit der Spieler beim Mitfahren synchron bleibt. */
  frameDelta(deltaMs: number): { dx: number; dy: number } {
    const body = this.body as Phaser.Physics.Arcade.Body;
    return {
      dx: (body.velocity.x * deltaMs) / 1000,
      dy: (body.velocity.y * deltaMs) / 1000,
    };
  }
}
