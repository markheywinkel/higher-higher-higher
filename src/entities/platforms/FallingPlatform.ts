import Phaser from "phaser";
import { Platform, type PlatformDef } from "./Platform";
import { FALLING_PLATFORM_DELAY_MS, FALLING_PLATFORM_SHAKE_MS } from "../../config/constants";

/** Plattform, die nach kurzer Zeit unter dem Spieler wegbricht. */
export class FallingPlatform extends Platform {
  private triggered = false;

  constructor(scene: Phaser.Scene, def: PlatformDef) {
    super(scene, def);
    scene.physics.add.existing(this, true);
  }

  trigger(): void {
    if (this.triggered) return;
    this.triggered = true;

    const originalX = this.x;
    this.scene.tweens.add({
      targets: this,
      x: originalX - 3,
      duration: 60,
      yoyo: true,
      repeat: Math.floor(FALLING_PLATFORM_SHAKE_MS / 120),
    });

    this.scene.time.delayedCall(FALLING_PLATFORM_DELAY_MS, () => {
      this.disableBody(true, false);
      this.scene.tweens.add({
        targets: this,
        y: this.y + 260,
        alpha: 0,
        duration: 500,
        ease: "Cubic.easeIn",
        onComplete: () => this.destroy(),
      });
    });
  }
}
