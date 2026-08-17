export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

/** Horizontaler Versatz der Levelgeometrie, damit die Kletterspur im breiteren Canvas zentriert bleibt. */
export const LEVEL_X_OFFSET = 720;
/** Vertikaler Versatz, damit der Abstand Startplattform/Lava zur neuen Canvas-Höhe passt. */
export const LEVEL_Y_OFFSET = 360;

export const GRAVITY_Y = 1000;

export const PLAYER = {
  WALK_SPEED: 150,
  RUN_SPEED: 260,
  ACCELERATION: 1400,
  AIR_ACCELERATION: 900,
  DRAG: 1200,
  // Sprungkraft um 15% erhöht (Basiswerte waren -430 / -560).
  JUMP_VELOCITY: -494.5,
  RUN_JUMP_VELOCITY: -644,
  WALL_JUMP_VELOCITY_X: 320,
  WALL_JUMP_VELOCITY_Y: -440,
  WALL_JUMP_LOCK_MS: 160,
  WALL_COYOTE_MS: 170,
  JUMP_BUFFER_MS: 170,
  KNOCKBACK_X: 220,
  KNOCKBACK_Y: -260,
  KNOCKBACK_LOCK_MS: 220,
  WIDTH: 40,
  HEIGHT: 54,
} as const;

export const ENEMY_SPEED = {
  WADDLER: PLAYER.WALK_SPEED * 0.5,
  SPRINTER_CHASE: PLAYER.WALK_SPEED * 0.6,
  SUPER_SPRINTER_CHASE: PLAYER.WALK_SPEED * 0.6,
  FLUTTERER: PLAYER.WALK_SPEED * 0.5,
} as const;

export const ENEMY_AGGRO_RADIUS = 160;
export const ENEMY_STOMP_BOUNCE = -320;

export const FALLING_PLATFORM_DELAY_MS = 500;
export const FALLING_PLATFORM_SHAKE_MS = 350;

export const LAVA_Y = GAME_HEIGHT - 24;

export const DEPTH = {
  BACKGROUND: 0,
  LAVA: 1,
  PLATFORM: 2,
  ENEMY: 3,
  PLAYER: 4,
  UI: 10,
} as const;
