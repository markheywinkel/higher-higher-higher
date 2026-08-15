import Phaser from "phaser";
import { PLAYER } from "../config/constants";

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
  /** Aktuell getragen von einer beweglichen Plattform (für seitliches Mitfahren). */
  ridingPlatformDx = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "player");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER.WIDTH, PLAYER.HEIGHT);
    body.setMaxVelocity(PLAYER.RUN_SPEED + 40, 900);
    body.setDragX(PLAYER.DRAG);
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
      const velocity = this.isRunning ? PLAYER.RUN_JUMP_VELOCITY : PLAYER.JUMP_VELOCITY;
      body.setVelocityY(velocity);
      this.jumpBufferedAt = -Infinity;
    } else if (jumpBuffered && canWallJump) {
      const pushDir = this.lastWallTouch === "left" ? 1 : -1;
      body.setVelocityX(pushDir * PLAYER.WALL_JUMP_VELOCITY_X);
      body.setVelocityY(PLAYER.WALL_JUMP_VELOCITY_Y);
      this.wallJumpLockedUntil = time + PLAYER.WALL_JUMP_LOCK_MS;
      this.jumpBufferedAt = -Infinity;
      this.lastWallTouch = null;
      this.setFlipX(pushDir < 0);
    }

    if (!input.jumpHeld && body.velocity.y < 0) {
      body.setVelocityY(body.velocity.y * 0.55);
    }
  }
}
