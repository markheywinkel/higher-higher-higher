import Phaser from "phaser";
import { GAME_WIDTH } from "./config/constants";

/**
 * Erzeugt einfache Platzhalter-Texturen (farbige Rechtecke/Kreise), damit das
 * Spiel ohne fertige Grafiken lauffähig ist. Sobald echte Sprites/Sheets
 * vorhanden sind, hier durch this.load.image/spritesheet ersetzen.
 */
export function generatePlaceholderTextures(scene: Phaser.Scene): void {
  const g = scene.add.graphics();

  const rect = (
    key: string,
    width: number,
    height: number,
    color: number,
    strokeColor?: number,
  ) => {
    g.clear();
    g.fillStyle(color, 1);
    g.fillRect(0, 0, width, height);
    if (strokeColor !== undefined) {
      g.lineStyle(2, strokeColor, 1);
      g.strokeRect(1, 1, width - 2, height - 2);
    }
    g.generateTexture(key, width, height);
  };

  const circle = (key: string, diameter: number, color: number, strokeColor: number) => {
    g.clear();
    const r = diameter / 2;
    g.fillStyle(color, 1);
    g.fillCircle(r, r, r);
    g.lineStyle(2, strokeColor, 1);
    g.strokeCircle(r, r, r - 1);
    g.generateTexture(key, diameter, diameter);
  };

  rect("player", 22, 30, 0x4fc3f7, 0x0d47a1);
  rect("platform-solid", 96, 20, 0x8d6e63, 0x4e342e);
  rect("platform-falling", 96, 20, 0xffb74d, 0xe65100);
  rect("platform-moving-h", 96, 20, 0x81c784, 0x1b5e20);
  rect("platform-moving-v", 96, 20, 0xba68c8, 0x4a148c);
  rect("wall", 20, 140, 0x795548, 0x3e2723);
  rect("lava", GAME_WIDTH, 32, 0xff3d00, 0xbf360c);
  rect("goal", 96, 20, 0xffd700, 0x8d6e00);

  circle("waddler", 22, 0x9ccc65, 0x33691e);
  circle("sprinter", 22, 0xffd54f, 0xf57f17);
  circle("super-sprinter", 24, 0xff7043, 0xbf360c);
  circle("flutterer", 20, 0xf06292, 0x880e4f);
  circle("super-flutterer", 22, 0xab47bc, 0x4a148c);

  g.destroy();
}
