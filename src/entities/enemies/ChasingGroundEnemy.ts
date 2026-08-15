import Phaser from "phaser";
import { Waddler } from "./Waddler";
import type { Platform } from "../platforms/Platform";
import type { Player } from "../Player";

/**
 * Basis für Sprinter/Supersprinter: patrouilliert wie der Watschler, folgt
 * dem Spieler aber, sobald der auf derselben Plattform steht – auch über
 * den Plattformrand hinaus. Der Supersprinter (canJumpGaps) springt dabei
 * sogar zur nächsten Plattform, statt einfach herunterzufallen.
 */
export abstract class ChasingGroundEnemy extends Waddler {
  protected chasing = false;
  protected wasGrounded = true;
  protected readonly player: Player;
  protected abstract readonly chaseSpeed: number;
  protected abstract readonly canJumpGaps: boolean;
  protected abstract readonly jumpVelocityX: number;
  protected abstract readonly jumpVelocityY: number;

  constructor(scene: Phaser.Scene, platform: Platform, player: Player, texture: string) {
    super(scene, platform, texture);
    this.player = player;
  }

  protected tick(time: number, delta: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const grounded = body.touching.down;

    if (this.chasing && this.wasGrounded && !grounded && this.canJumpGaps) {
      const dir = body.velocity.x >= 0 ? 1 : -1;
      body.setVelocityX(dir * this.jumpVelocityX);
      body.setVelocityY(this.jumpVelocityY);
    }
    this.wasGrounded = grounded;

    if (this.chasing && grounded) {
      const dir = this.player.x < this.x ? -1 : 1;
      body.setVelocityX(dir * this.chaseSpeed);
      this.setFlipX(dir === -1);
    } else if (grounded) {
      this.patrol();
    }
    void time;
    void delta;
  }

  setChasing(chasing: boolean): void {
    this.chasing = chasing;
  }
}
