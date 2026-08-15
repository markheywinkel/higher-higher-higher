import Phaser from "phaser";
import { loadStartScreen } from "../assets";
import { showButtonScreen } from "../ui/buttonScreen";

const START_BUTTON = { xFrac: 0.4995, yFrac: 0.6722, widthFrac: 0.29, heightFrac: 0.145 };

export class StartScene extends Phaser.Scene {
  constructor() {
    super("StartScene");
  }

  preload(): void {
    loadStartScreen(this);
  }

  create(): void {
    showButtonScreen(this, "screen-start", START_BUTTON, () => {
      this.scene.start("GameScene");
    });
  }
}
