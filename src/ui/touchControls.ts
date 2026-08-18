import Phaser from "phaser";
import { DEPTH } from "../config/constants";

type Anchor = "bottom-left" | "bottom-right";

interface ButtonSpec {
  anchor: Anchor;
  /** Abstand vom linken/rechten Rand in Bildschirm-px. */
  offsetX: number;
  /** Abstand vom unteren Rand in Bildschirm-px. */
  offsetY: number;
  radius: number;
  label: string;
}

/**
 * Ein einzelner Touch-Button. Position/Größe werden jeden Frame aus der
 * sichtbaren Kameraansicht neu berechnet (gleiches Prinzip wie der
 * Mute-Button) statt scrollFactor(0), da reines scrollFactor(0) vom
 * Gameplay-Zoom mitskaliert und verschoben würde.
 */
class TouchButton {
  private readonly bg: Phaser.GameObjects.Arc;
  private readonly label: Phaser.GameObjects.Text;
  private readonly zone: Phaser.GameObjects.Zone;
  private down = false;
  private justPressed = false;

  constructor(
    scene: Phaser.Scene,
    private readonly spec: ButtonSpec,
  ) {
    this.bg = scene.add
      .circle(0, 0, spec.radius, 0x14141f, 0.5)
      .setStrokeStyle(2, 0x3a3a4a)
      .setDepth(DEPTH.UI + 5);
    this.label = scene.add
      .text(0, 0, spec.label, { fontSize: `${Math.round(spec.radius * 0.9)}px` })
      .setOrigin(0.5)
      .setDepth(DEPTH.UI + 6);
    this.zone = scene.add
      .zone(0, 0, spec.radius * 2, spec.radius * 2)
      .setDepth(DEPTH.UI + 6)
      .setInteractive();

    this.zone.on("pointerdown", () => {
      this.down = true;
      this.justPressed = true;
      this.bg.setFillStyle(0x3a3a4a, 0.7);
    });
    const release = () => {
      this.down = false;
      this.bg.setFillStyle(0x14141f, 0.5);
    };
    this.zone.on("pointerup", release);
    this.zone.on("pointerout", release);
  }

  get isDown(): boolean {
    return this.down;
  }

  /** Einmalig true im ersten Frame nach dem Antippen, danach wieder false (wie JustDown). */
  consumeJustPressed(): boolean {
    const v = this.justPressed;
    this.justPressed = false;
    return v;
  }

  reposition(cam: Phaser.Cameras.Scene2D.Camera): void {
    const zoom = cam.zoom;
    const view = cam.worldView;
    const s = 1 / zoom;
    const sizeWorld = this.spec.radius * 2 * s;
    const x =
      this.spec.anchor === "bottom-left"
        ? view.left + this.spec.offsetX * s
        : view.right - this.spec.offsetX * s;
    const y = view.bottom - this.spec.offsetY * s;

    this.bg.setPosition(x, y).setScale(s);
    this.label.setPosition(x, y).setScale(s);
    this.zone.setPosition(x, y).setSize(sizeWorld, sizeWorld);
  }
}

/** Bewegungs-/Sprung-Steuerung für Touch-Geräte, nur sichtbar wenn Touch erkannt wird. */
export class TouchControls {
  private readonly left: TouchButton;
  private readonly right: TouchButton;
  private readonly run: TouchButton;
  private readonly jump: TouchButton;

  constructor(scene: Phaser.Scene) {
    this.left = new TouchButton(scene, {
      anchor: "bottom-left",
      offsetX: 70,
      offsetY: 90,
      radius: 52,
      label: "◀",
    });
    this.right = new TouchButton(scene, {
      anchor: "bottom-left",
      offsetX: 180,
      offsetY: 90,
      radius: 52,
      label: "▶",
    });
    this.run = new TouchButton(scene, {
      anchor: "bottom-right",
      offsetX: 190,
      offsetY: 150,
      radius: 44,
      label: "⚡",
    });
    this.jump = new TouchButton(scene, {
      anchor: "bottom-right",
      offsetX: 90,
      offsetY: 90,
      radius: 62,
      label: "⬆",
    });

    const reposition = () => {
      const cam = scene.cameras.main;
      this.left.reposition(cam);
      this.right.reposition(cam);
      this.run.reposition(cam);
      this.jump.reposition(cam);
    };
    reposition();
    scene.events.on("update", reposition);
    scene.events.once("shutdown", () => scene.events.off("update", reposition));
  }

  get isLeftDown(): boolean {
    return this.left.isDown;
  }

  get isRightDown(): boolean {
    return this.right.isDown;
  }

  get isRunDown(): boolean {
    return this.run.isDown;
  }

  get isJumpDown(): boolean {
    return this.jump.isDown;
  }

  consumeJumpJustPressed(): boolean {
    return this.jump.consumeJustPressed();
  }
}

/** Ob dieses Gerät Touch-Eingaben unterstützt (Phaser-Erkennung beim Boot). */
export function isTouchDevice(scene: Phaser.Scene): boolean {
  return scene.sys.game.device.input.touch;
}
