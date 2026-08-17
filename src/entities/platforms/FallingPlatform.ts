import Phaser from "phaser";
import { Platform, type PlatformDef } from "./Platform";
import {
  FALLING_PLATFORM_DELAY_MS,
  FALLING_PLATFORM_SHAKE_MS,
  FALLING_PLATFORM_RESPAWN_MS,
  FALLING_PLATFORM_BLINK_MS,
  FALLING_PLATFORM_BLINK_REPEATS,
} from "../../config/constants";

/** Plattform, die nach kurzer Zeit unter dem Spieler wegbricht und nach einer Pause zurückkehrt. */
export class FallingPlatform extends Platform {
  private triggered = false;
  private readonly homeX: number;
  private readonly homeY: number;

  constructor(scene: Phaser.Scene, def: PlatformDef) {
    super(scene, def);
    scene.physics.add.existing(this, true);
    this.homeX = this.x;
    this.homeY = this.y;
  }

  trigger(): void {
    if (this.triggered) return;
    this.triggered = true;

    this.scene.tweens.add({
      targets: this,
      x: this.homeX - 3,
      duration: 60,
      yoyo: true,
      repeat: Math.floor(FALLING_PLATFORM_SHAKE_MS / 120),
    });

    this.scene.time.delayedCall(FALLING_PLATFORM_DELAY_MS, () => {
      this.disableBody(false, false);
      this.scene.tweens.add({
        targets: this,
        y: this.homeY + 260,
        alpha: 0,
        duration: 500,
        ease: "Cubic.easeIn",
        onComplete: () => this.scheduleRespawn(),
      });
    });
  }

  private scheduleRespawn(): void {
    this.setPosition(this.homeX, this.homeY);
    this.scene.time.delayedCall(FALLING_PLATFORM_RESPAWN_MS, () => this.blinkBackIn());
  }

  private blinkBackIn(): void {
    this.scene.tweens.add({
      targets: this,
      alpha: { from: 0, to: 1 },
      duration: FALLING_PLATFORM_BLINK_MS,
      yoyo: true,
      repeat: FALLING_PLATFORM_BLINK_REPEATS,
      onComplete: () => {
        this.setAlpha(1);
        this.enableBody(true, this.homeX, this.homeY, true, true);
        this.triggered = false;
      },
    });
  }
}
