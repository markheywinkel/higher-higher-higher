import Phaser from "phaser";
import { PLAYER, ENEMY_STOMP_BOUNCE, ENEMY_STOMP_BOUNCE_LOCK_MS } from "../config/constants";
import { playSfx } from "../audio";

export interface PlayerInput {
  left: boolean;
  right: boolean;
  run: boolean;
  jumpPressed: boolean;
  jumpHeld: boolean;
}

type WallSide = "left" | "right" | null;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private jumpBufferedAt = -Infinity;
  private lastWallTouch: WallSide = null;
  private lastWallTouchAt = -Infinity;
  private wallJumpLockedUntil = 0;
  private knockbackLockedUntil = 0;
  private stompBounceLockedUntil = 0;
  private airborneAnim: "capybara-jump" | "capybara-run-jump" = "capybara-jump";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "capybara-idle", 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    // Alle capybara-Animationen teilen die Zellgröße 80x85 (siehe assets.ts),
    // daher ist ein einmaliger Offset hier sicher und muss nicht pro Frame neu
    // berechnet werden.
    body.setOffset((80 - PLAYER.WIDTH) / 2, 85 - PLAYER.HEIGHT);
    body.setMaxVelocity(PLAYER.RUN_SPEED + 40, 900);
    body.setDragX(PLAYER.DRAG);
    this.play("capybara-idle");
  }

  get isRunning(): boolean {
    return Math.abs((this.body as Phaser.Physics.Arcade.Body).velocity.x) > PLAYER.WALK_SPEED + 10;
  }

  requestJumpBuffer(time: number): void {
    this.jumpBufferedAt = time;
  }

  applyKnockback(fromX: number, time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const dir = this.x < fromX ? -1 : 1;
    body.setVelocityX(dir * PLAYER.KNOCKBACK_X);
    body.setVelocityY(PLAYER.KNOCKBACK_Y);
    this.knockbackLockedUntil = time + PLAYER.KNOCKBACK_LOCK_MS;
  }

  /**
   * Sprung-Bounce nach dem Stomp eines Gegners. Braucht eine eigene kurze Sperre,
   * sonst würde die "kurzer Sprung, wenn Sprungtaste losgelassen"-Dämpfung weiter
   * unten den Bounce sofort abwürgen, obwohl der Spieler gar keinen Sprung ausgelöst hat.
   */
  applyStompBounce(time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setVelocityY(ENEMY_STOMP_BOUNCE);
    this.stompBounceLockedUntil = time + ENEMY_STOMP_BOUNCE_LOCK_MS;
  }

  update(input: PlayerInput, time: number): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    const onGround = body.touching.down;
    const onWallLeft = body.touching.left && !onGround;
    const onWallRight = body.touching.right && !onGround;

    if (onWallLeft) {
      this.lastWallTouch = "left";
      this.lastWallTouchAt = time;
    } else if (onWallRight) {
      this.lastWallTouch = "right";
      this.lastWallTouchAt = time;
    }

    const knockedBack = time < this.knockbackLockedUntil;
    const wallLocked = time < this.wallJumpLockedUntil;

    if (!knockedBack && !wallLocked) {
      const targetSpeed = input.run ? PLAYER.RUN_SPEED : PLAYER.WALK_SPEED;
      const accel = onGround ? PLAYER.ACCELERATION : PLAYER.AIR_ACCELERATION;

      if (input.left && !input.right) {
        body.setAccelerationX(-accel);
        if (body.velocity.x < -targetSpeed) body.setVelocityX(-targetSpeed);
        this.setFlipX(true);
      } else if (input.right && !input.left) {
        body.setAccelerationX(accel);
        if (body.velocity.x > targetSpeed) body.setVelocityX(targetSpeed);
        this.setFlipX(false);
      } else {
        body.setAccelerationX(0);
      }
    } else {
      body.setAccelerationX(0);
    }

    if (input.jumpPressed) {
      this.requestJumpBuffer(time);
    }

    const jumpBuffered = time - this.jumpBufferedAt < PLAYER.JUMP_BUFFER_MS;
    const canWallJump =
      !onGround &&
      this.lastWallTouch !== null &&
      time - this.lastWallTouchAt < PLAYER.WALL_COYOTE_MS;

    if (jumpBuffered && onGround) {
      const running = this.isRunning;
      body.setVelocityY(running ? PLAYER.RUN_JUMP_VELOCITY : PLAYER.JUMP_VELOCITY);
      this.airborneAnim = running ? "capybara-run-jump" : "capybara-jump";
      this.jumpBufferedAt = -Infinity;
      playSfx(this.scene, "sfx-jump");
    } else if (jumpBuffered && canWallJump) {
      const pushDir = this.lastWallTouch === "left" ? 1 : -1;
      body.setVelocityX(pushDir * PLAYER.WALL_JUMP_VELOCITY_X);
      body.setVelocityY(PLAYER.WALL_JUMP_VELOCITY_Y);
      this.wallJumpLockedUntil = time + PLAYER.WALL_JUMP_LOCK_MS;
      this.airborneAnim = "capybara-jump";
      this.jumpBufferedAt = -Infinity;
      this.lastWallTouch = null;
      this.setFlipX(pushDir < 0);
      playSfx(this.scene, "sfx-jump");
    }

    if (!input.jumpHeld && body.velocity.y < 0 && time >= this.stompBounceLockedUntil) {
      body.setVelocityY(body.velocity.y * 0.55);
    }

    this.updateAnimation(input, onGround, time < this.wallJumpLockedUntil);
  }

  private updateAnimation(input: PlayerInput, onGround: boolean, wallLocked: boolean): void {
    this.anims.timeScale = input.run ? 1.4 : 1;

    if (wallLocked) {
      this.play("capybara-wall-jump", true);
      return;
    }
    if (!onGround) {
      this.play(this.airborneAnim, true);
      return;
    }
    const moving = input.left || input.right;
    this.play(moving ? "capybara-walk" : "capybara-idle", true);
  }
}
