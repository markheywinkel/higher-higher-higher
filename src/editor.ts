import Phaser from "phaser";
import { EditorScene } from "./scenes/EditorScene";
import { GameScene } from "./scenes/GameScene";

const toolbar = document.getElementById("toolbar")!;

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "editor-canvas",
  width: window.innerWidth,
  height: window.innerHeight - toolbar.offsetHeight,
  backgroundColor: "#1a1a2e",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [EditorScene, GameScene],
});

if (import.meta.env.DEV) {
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
