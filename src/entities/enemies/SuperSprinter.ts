import Phaser from "phaser";
import { ChasingGroundEnemy } from "./ChasingGroundEnemy";
import type { Platform } from "../platforms/Platform";
import type { Player } from "../Player";
import { ENEMY_SPEED } from "../../config/constants";

/** Wie der Sprinter, springt aber über Lücken zur nächsten Plattform. */
export class SuperSprinter extends ChasingGroundEnemy {
  protected readonly chaseSpeed = ENEMY_SPEED.SUPER_SPRINTER_CHASE;
  protected readonly canJumpGaps = true;
  protected readonly jumpVelocityX = 220;
  protected readonly jumpVelocityY = -430;

  constructor(scene: Phaser.Scene, platform: Platform, player: Player) {
    super(scene, platform, player, "supersprinter-run", "supersprinter-dead");
  }
}
