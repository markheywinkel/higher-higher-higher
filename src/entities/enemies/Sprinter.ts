import Phaser from "phaser";
import { ChasingGroundEnemy } from "./ChasingGroundEnemy";
import type { Platform } from "../platforms/Platform";
import type { Player } from "../Player";
import { ENEMY_SPEED } from "../../config/constants";

/** Folgt dem Spieler auf der eigenen Plattform, fällt aber an der Kante herunter. */
export class Sprinter extends ChasingGroundEnemy {
  protected readonly chaseSpeed = ENEMY_SPEED.SPRINTER_CHASE;
  protected readonly canJumpGaps = false;
  protected readonly jumpVelocityX = 0;
  protected readonly jumpVelocityY = 0;

  constructor(scene: Phaser.Scene, platform: Platform, player: Player) {
    super(scene, platform, player, "sprinter");
  }
}
