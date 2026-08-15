import Phaser from "phaser";

export type EnemyState = "alive" | "dying";

/** Gemeinsame Basis für alle Gegnertypen: Stomp-Tod und Fall in die Tiefe. */
export abstract class Enemy extends Phaser.Physics.Arcade.Sprite {
  state: EnemyState = "alive";
  readonly flies: boolean;
  private readonly deadTexture: string;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    aliveAnim: string,
    deadTexture: string,
    flies: boolean,
  ) {
    super(scene, x, y, aliveAnim, 0);
    this.flies = flies;
    this.deadTexture = deadTexture;
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(!flies);
    body.setCollideWorldBounds(false);
    this.play(aliveAnim);

    // Hitbox etwas kleiner als der sichtbare Sprite, am Boden ausgerichtet (fliegend: zentriert).
    const bw = this.width * 0.75;
    const bh = this.height * 0.7;
    body.setSize(bw, bh);
    body.setOffset((this.width - bw) / 2, flies ? (this.height - bh) / 2 : this.height - bh);
  }

  /** Wird vom Spieler durch einen Sprung von oben getötet. */
  stomp(): void {
    if (this.state !== "alive") return;
    this.state = "dying";
    this.anims.stop();
    this.setTexture(this.deadTexture);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(this.width, this.height);
    body.setOffset(0, 0);
    body.setAllowGravity(true);
    body.setVelocity(0, -150);
    body.checkCollision.none = true;
  }

  /** Prüft, ob der Gegner unterhalb der Lava-Linie verschwunden ist. */
  isBelow(y: number): boolean {
    return this.y > y;
  }
}
