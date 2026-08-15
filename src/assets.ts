import Phaser from "phaser";

const SPRITE_BASE = "sprites";

interface AnimSheetConfig {
  key: string;
  file: string;
  frameWidth: number;
  frameHeight: number;
  frameRate: number;
  repeat: number;
}

/**
 * Spritesheets mit mehreren Frames – Key dient zugleich als Animationsname.
 * Die fünf capybara-*-Sheets teilen sich bewusst eine einheitliche Zellgröße
 * (80x85, fußbündig gepackt): Arcade Physics berechnet die Body-Position bei
 * jedem Schritt aus der AKTUELLEN Frame-Größe neu, unterschiedliche Frame-
 * Größen pro Animation würden bei jedem Animationswechsel die Hitbox um ein
 * paar Pixel verschieben – das reicht, um eine ruhende Kollision zu kippen.
 */
const ANIM_SHEETS: AnimSheetConfig[] = [
  { key: "capybara-idle", file: "capybara_idle.png", frameWidth: 80, frameHeight: 85, frameRate: 4, repeat: -1 },
  { key: "capybara-walk", file: "capybara_walk.png", frameWidth: 80, frameHeight: 85, frameRate: 12, repeat: -1 },
  { key: "capybara-jump", file: "capybara_jump.png", frameWidth: 80, frameHeight: 85, frameRate: 10, repeat: 0 },
  { key: "capybara-run-jump", file: "capybara_run_jump.png", frameWidth: 80, frameHeight: 85, frameRate: 14, repeat: 0 },
  { key: "capybara-wall-jump", file: "capybara_wall_jump.png", frameWidth: 80, frameHeight: 85, frameRate: 10, repeat: 0 },
  { key: "watschler-walk", file: "watschler_walk.png", frameWidth: 88, frameHeight: 55, frameRate: 6, repeat: -1 },
  { key: "sprinter-walk", file: "sprinter_walk.png", frameWidth: 88, frameHeight: 53, frameRate: 10, repeat: -1 },
  { key: "supersprinter-run", file: "supersprinter_run.png", frameWidth: 68, frameHeight: 80, frameRate: 12, repeat: -1 },
  { key: "flutterer-fly", file: "flutterer_fly.png", frameWidth: 80, frameHeight: 45, frameRate: 8, repeat: -1 },
  { key: "superflutterer-fly", file: "superflutterer_fly.png", frameWidth: 77, frameHeight: 56, frameRate: 8, repeat: -1 },
];

/** Einzelbilder (keine Animation). */
const STATIC_IMAGES: Record<string, string> = {
  "watschler-dead": "watschler_dead.png",
  "sprinter-dead": "sprinter_dead.png",
  "supersprinter-dead": "supersprinter_dead.png",
  "flutterer-dead": "flutterer_dead.png",
  "superflutterer-dead": "superflutterer_dead.png",
  wall: "wall.png",
  lava: "lava.png",
  "effect-jump-dust": "effect_jump_dust.png",
  "effect-hit-stars": "effect_hit_stars.png",
  "effect-impact-cloud": "effect_impact_cloud.png",
  "ui-higher-sign": "ui_higher_sign.png",
  "ui-gameover-sign": "ui_gameover_sign.png",
};

const PLATFORM_SIZE = 2;
for (const material of ["stone", "wood"]) {
  for (let size = 1; size <= 4; size++) {
    STATIC_IMAGES[`platform-solid-${material}-${size}`] = `platform_solid_${material}_${size}.png`;
  }
}
for (const kind of ["falling", "moving-h", "moving-v"]) {
  const fileKind = kind.replace("-", "_");
  for (let size = 1; size <= 4; size++) {
    STATIC_IMAGES[`platform-${kind}-${size}`] = `platform_${fileKind}_${size}.png`;
  }
}

export { PLATFORM_SIZE };

export function loadSprites(scene: Phaser.Scene): void {
  for (const sheet of ANIM_SHEETS) {
    scene.load.spritesheet(sheet.key, `${SPRITE_BASE}/${sheet.file}`, {
      frameWidth: sheet.frameWidth,
      frameHeight: sheet.frameHeight,
    });
  }
  for (const [key, file] of Object.entries(STATIC_IMAGES)) {
    scene.load.image(key, `${SPRITE_BASE}/${file}`);
  }
}

export function loadStartScreen(scene: Phaser.Scene): void {
  scene.load.image("screen-start", "screens/start.png");
}

export function loadGameOverScreen(scene: Phaser.Scene): void {
  scene.load.image("screen-gameover", "screens/gameover.png");
}

export function createAnimations(scene: Phaser.Scene): void {
  for (const sheet of ANIM_SHEETS) {
    if (scene.anims.exists(sheet.key)) continue;
    scene.anims.create({
      key: sheet.key,
      frames: scene.anims.generateFrameNumbers(sheet.key, {}),
      frameRate: sheet.frameRate,
      repeat: sheet.repeat,
    });
  }
}
