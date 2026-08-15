import Phaser from "phaser";
import { Flutterer, type FluttererPath } from "./Flutterer";
import type { Player } from "../Player";
import { ENEMY_AGGRO_RADIUS, ENEMY_SPEED } from "../../config/constants";

/** Wie der Flatterer, verfolgt den Spieler aber, wenn er in die Nähe kommt. */
export class SuperFlutterer extends Flutterer {
  private readonly player: Player;
  private chasing = false;
  private wasChasing = false;

  constructor(scene: Phaser.Scene, path: FluttererPath, player: Player) {
    super(scene, path, "super-flutterer");
    this.player = player;
  }

  protected tick(time: number, delta: number): void {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, this.player.x, this.player.y);
    this.chasing = dist < ENEMY_AGGRO_RADIUS;

    if (this.chasing) {
      const body = this.body as Phaser.Physics.Arcade.Body;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
      body.setVelocity(
        Math.cos(angle) * ENEMY_SPEED.FLUTTERER * 1.5,
        Math.sin(angle) * ENEMY_SPEED.FLUTTERER * 1.5,
      );
      this.wasChasing = true;
      return;
    }

    if (this.wasChasing) {
      this.applyVelocity();
      this.wasChasing = false;
    }
    super.tick(time, delta);
  }
}
