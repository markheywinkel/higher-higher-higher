import Phaser from "phaser";
import { DEPTH } from "../config/constants";

const SIZE = 56;
const MARGIN = 20;
/** Abstand zum Mute-Button, der ebenfalls oben rechts sitzt. */
const GAP_FROM_MUTE = SIZE + 12;

/**
 * Kleiner Pause-Button oben rechts (neben dem Mute-Button) – nötig, da es auf
 * Touch-Geräten keine Enter-Taste zum Pausieren gibt. Gleiches Positionierungs-
 * prinzip wie der Mute-Button (jeden Frame aus der Kameraansicht berechnet,
 * statt scrollFactor(0), das vom Gameplay-Zoom mitskaliert würde).
 */
export function createPauseButton(scene: Phaser.Scene, onTap: () => void): void {
  const bg = scene.add
    .circle(0, 0, SIZE / 2, 0x14141f, 0.75)
    .setStrokeStyle(2, 0x3a3a4a)
    .setDepth(DEPTH.UI + 5);

  const label = scene.add.text(0, 0, "⏸", { fontSize: "24px" }).setOrigin(0.5).setDepth(DEPTH.UI + 6);

  const zone = scene.add.zone(0, 0, SIZE, SIZE).setDepth(DEPTH.UI + 6).setInteractive({ useHandCursor: true });

  const reposition = () => {
    const cam = scene.cameras.main;
    const zoom = cam.zoom;
    const marginWorld = MARGIN / zoom;
    const gapWorld = GAP_FROM_MUTE / zoom;
    const sizeWorld = SIZE / zoom;
    const x = cam.worldView.right - marginWorld - gapWorld - sizeWorld / 2;
    const y = cam.worldView.top + marginWorld + sizeWorld / 2;
    bg.setPosition(x, y).setScale(1 / zoom);
    label.setPosition(x, y).setScale(1 / zoom);
    zone.setPosition(x, y).setSize(sizeWorld, sizeWorld);
  };
  reposition();
  scene.events.on("update", reposition);
  scene.events.once("shutdown", () => scene.events.off("update", reposition));

  zone.on("pointerover", () => bg.setFillStyle(0x2a2a3a, 0.85));
  zone.on("pointerout", () => bg.setFillStyle(0x14141f, 0.75));
  zone.on("pointerdown", onTap);
}
