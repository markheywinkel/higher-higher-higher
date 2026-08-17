import Phaser from "phaser";
import { DEPTH } from "../config/constants";

const SIZE = 56;
const MARGIN = 20;

/**
 * Kleiner Lautsprecher-Button oben rechts, mutet/entmutet global (Musik + Soundeffekte).
 * Position/Größe werden jeden Frame aus der sichtbaren Kameraansicht neu berechnet
 * (statt scrollFactor(0)) – reines scrollFactor(0) würde vom Kamera-Zoom mitskaliert und
 * verschoben, sobald das Gameplay gezoomt ist (siehe showButtonScreen für dieselbe Falle).
 */
export function createMuteButton(scene: Phaser.Scene): void {
  const bg = scene.add
    .circle(0, 0, SIZE / 2, 0x14141f, 0.75)
    .setStrokeStyle(2, 0x3a3a4a)
    .setDepth(DEPTH.UI + 5);

  const label = scene.add
    .text(0, 0, scene.sound.mute ? "🔇" : "🔊", { fontSize: "26px" })
    .setOrigin(0.5)
    .setDepth(DEPTH.UI + 6);

  const zone = scene.add.zone(0, 0, SIZE, SIZE).setDepth(DEPTH.UI + 6).setInteractive({ useHandCursor: true });

  const reposition = () => {
    const cam = scene.cameras.main;
    const zoom = cam.zoom;
    const marginWorld = MARGIN / zoom;
    const sizeWorld = SIZE / zoom;
    const x = cam.worldView.right - marginWorld - sizeWorld / 2;
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
  zone.on("pointerdown", () => {
    scene.sound.mute = !scene.sound.mute;
    label.setText(scene.sound.mute ? "🔇" : "🔊");
  });
}
