import Phaser from "phaser";
import { GAME_WIDTH, GAME_HEIGHT, DEPTH } from "../config/constants";
import { playSfx } from "../audio";

/** Button-Position als Anteil (0–1) der Bildschirm-Illustration, unabhängig von der Canvas-Größe. */
export interface FractionalButton {
  xFrac: number;
  yFrac: number;
  widthFrac: number;
  heightFrac: number;
}

/**
 * Zeigt eine vollflächige Illustration (Start-/Game-Over-Bildschirm) mit eingezeichnetem
 * Button an. Aktivierbar per Klick auf den Button, Enter oder R.
 */
export function showButtonScreen(
  scene: Phaser.Scene,
  imageKey: string,
  button: FractionalButton,
  onActivate: () => void,
): void {
  // Objekte mit scrollFactor(0) sitzen zwar fix im Bildschirm, werden aber weiterhin vom
  // Kamera-Zoom skaliert – ohne Reset würde der Vollbild-Screen mitgezoomt und beschnitten.
  scene.cameras.main.setZoom(1);
  scene.cameras.main.stopFollow();

  scene.add
    .image(GAME_WIDTH / 2, GAME_HEIGHT / 2, imageKey)
    .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
    .setScrollFactor(0)
    .setDepth(DEPTH.UI);

  const bx = button.xFrac * GAME_WIDTH;
  const by = button.yFrac * GAME_HEIGHT;
  const bw = button.widthFrac * GAME_WIDTH;
  const bh = button.heightFrac * GAME_HEIGHT;

  const highlight = scene.add
    .rectangle(bx, by, bw, bh, 0xffffff, 0.15)
    .setScrollFactor(0)
    .setDepth(DEPTH.UI + 1)
    .setVisible(false);

  const zone = scene.add
    .zone(bx, by, bw, bh)
    .setScrollFactor(0)
    .setDepth(DEPTH.UI + 1)
    .setInteractive({ useHandCursor: true });

  let activated = false;
  const activate = () => {
    if (activated) return;
    activated = true;
    playSfx(scene, "sfx-button");
    onActivate();
  };

  zone.on("pointerover", () => highlight.setVisible(true));
  zone.on("pointerout", () => highlight.setVisible(false));
  zone.on("pointerdown", activate);

  const keyEnter = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
  const keyR = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.R);

  const onUpdate = () => {
    if (Phaser.Input.Keyboard.JustDown(keyEnter) || Phaser.Input.Keyboard.JustDown(keyR)) {
      activate();
    }
  };
  scene.events.on("update", onUpdate);
  scene.events.once("shutdown", () => scene.events.off("update", onUpdate));
}
