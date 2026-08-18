import Phaser from "phaser";
import { StartScene } from "./scenes/StartScene";
import { GameScene } from "./scenes/GameScene";
import { GAME_WIDTH, GAME_HEIGHT } from "./config/constants";

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#1a1a2e",
  pixelArt: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  // Mehrere gleichzeitige Touch-Punkte (z.B. Bewegen + Springen mit zwei Fingern).
  input: {
    activePointers: 3,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [StartScene, GameScene],
});

if (import.meta.env.DEV) {
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
