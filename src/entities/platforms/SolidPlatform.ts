import Phaser from "phaser";
import { Platform, type PlatformDef } from "./Platform";

export class SolidPlatform extends Platform {
  constructor(scene: Phaser.Scene, def: PlatformDef) {
    super(scene, def);
    scene.physics.add.existing(this, true);
    if (def.widthOverride) {
      this.refreshBody();
    }
  }
}
