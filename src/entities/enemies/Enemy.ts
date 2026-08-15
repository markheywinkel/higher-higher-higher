import Phaser from "phaser";

export type EnemyState = "alive" | "dying";

/** Gemeinsame Basis für alle Gegnertypen: Stomp-Tod und Fall in die Tiefe. */
export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  state: EnemyState = "alive";
  readonly flies: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, flies: boolean) {
    super(scene, x, y, texture);
    this.flies = flies;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(!flies);
    body.setCollideWorldBounds(false);
  }

  /** Wird vom Spieler durch einen Sprung von oben getötet. */
  stomp(): void {
    if (this.state !== "alive") return;
    this.state = "dying";
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setVelocity(0, -150);
    body.checkCollision.none = true;
    this.setTint(0x666666);
  }

  /** Prüft, ob der Gegner unterhalb der Lava-Linie verschwunden ist. */
  isBelow(y: number): boolean {
    return this.y > y;
  }
}
