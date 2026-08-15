import Phaser from "phaser";
import { loadSprites, loadGameOverScreen, loadWinScreen, loadBackground, createAnimations } from "../assets";
import { showButtonScreen } from "../ui/buttonScreen";
import { Player, type PlayerInput } from "../entities/Player";
import { SolidPlatform } from "../entities/platforms/SolidPlatform";
import { FallingPlatform } from "../entities/platforms/FallingPlatform";
import { MovingPlatform } from "../entities/platforms/MovingPlatform";
import type { Platform } from "../entities/platforms/Platform";
import { Waddler } from "../entities/enemies/Waddler";
import { Sprinter } from "../entities/enemies/Sprinter";
import { SuperSprinter } from "../entities/enemies/SuperSprinter";
import { Flutterer } from "../entities/enemies/Flutterer";
import { SuperFlutterer } from "../entities/enemies/SuperFlutterer";
import type { ChasingGroundEnemy } from "../entities/enemies/ChasingGroundEnemy";
import type { Enemy } from "../entities/enemies/Enemy";
import {
  PLATFORMS,
  WALLS,
  GROUND_ENEMIES,
  FLYING_ENEMIES,
  PLAYER_START,
  GOAL_PLATFORM_ID,
} from "../level/levelData";
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY_Y, LAVA_Y, DEPTH } from "../config/constants";

const WORLD_TOP = -760;
const WORLD_BOTTOM = GAME_HEIGHT + 200;
const GAMEOVER_BUTTON = { xFrac: 0.508, yFrac: 0.71, widthFrac: 0.353, heightFrac: 0.165 };
const WIN_BUTTON = { xFrac: 0.495, yFrac: 0.9166, widthFrac: 0.326, heightFrac: 0.1435 };
const CAMERA_ZOOM = 2.25;

type RunState = "playing" | "gameover" | "win";

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  private staticPlatforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private groundEnemies!: Phaser.Physics.Arcade.Group;
  private flyingEnemies!: Phaser.Physics.Arcade.Group;
  private chasingEnemies: ChasingGroundEnemy[] = [];
  private platformsById = new Map<string, Platform>();

  private playerCurrentPlatformId: string | null = null;
  private runState: RunState = "playing";

  constructor() {
    super("GameScene");
  }

  preload(): void {
    loadSprites(this);
    loadGameOverScreen(this);
    loadWinScreen(this);
    loadBackground(this);
  }

  create(): void {
    createAnimations(this);
    this.runState = "playing";
    this.playerCurrentPlatformId = null;

    this.physics.world.setBounds(0, WORLD_TOP, GAME_WIDTH, WORLD_BOTTOM - WORLD_TOP);
    this.physics.world.gravity.y = GRAVITY_Y;

    this.buildBackground();
    this.buildLava();
    this.buildPlatforms();
    this.buildWalls();
    this.buildGoalMarker();

    this.player = new Player(this, PLAYER_START.x, PLAYER_START.y);
    this.player.setDepth(DEPTH.PLAYER);

    this.buildEnemies();
    this.setupColliders();
    this.setupCamera();
    this.setupInput();
  }

  private buildBackground(): void {
    // Vertikaler Himmel-Verlauf (Sonnenuntergang unten -> Sternenhimmel oben), damit die
    // Kletterspur nicht in einer leeren dunklen Fläche schwebt.
    const bg = this.add.image(GAME_WIDTH / 2, LAVA_Y, "background-sky");
    bg.setOrigin(0.5, 1);
    bg.setDisplaySize(GAME_WIDTH + 40, LAVA_Y - WORLD_TOP);
    bg.setDepth(DEPTH.BACKGROUND);
  }

  private buildLava(): void {
    // Füllung unter der Lava-Grafik, damit beim Herunterscrollen kein Leerraum
    // unter der Lava sichtbar wird (sie soll wirkt wie ein bodenloser Lavasee).
    const fill = this.add.rectangle(
      GAME_WIDTH / 2,
      LAVA_Y + 40,
      GAME_WIDTH + 40,
      WORLD_BOTTOM - LAVA_Y + 40,
      0xb23a0e,
    );
    fill.setOrigin(0.5, 0);
    fill.setDepth(DEPTH.LAVA);

    // TileSprite statt gestrecktem Image, damit das Lava-Muster bei der Breite
    // von 1920px nicht verzerrt wird.
    const lavaTexture = this.textures.get("lava").getSourceImage() as HTMLImageElement;
    const lava = this.add.tileSprite(
      GAME_WIDTH / 2,
      LAVA_Y,
      GAME_WIDTH + 40,
      lavaTexture.height,
      "lava",
    );
    lava.setOrigin(0.5, 0);
    lava.setDepth(DEPTH.LAVA + 1);
  }

  private buildPlatforms(): void {
    this.staticPlatforms = this.physics.add.staticGroup();
    // Explizite Defaults, da Group.add() sonst eigene Physik-Defaults (u.a. Gravitation) auf
    // bereits konfigurierte Bodies zurücksetzt.
    this.movingPlatforms = this.physics.add.group({ allowGravity: false, immovable: true });

    for (const def of PLATFORMS) {
      let platform: Platform;
      if (def.type === "solid") {
        platform = new SolidPlatform(this, def);
        this.staticPlatforms.add(platform);
      } else if (def.type === "falling") {
        platform = new FallingPlatform(this, def);
        this.staticPlatforms.add(platform);
      } else {
        const movingPlatform = new MovingPlatform(this, def);
        this.movingPlatforms.add(movingPlatform);
        movingPlatform.applyPhysicsTuning();
        platform = movingPlatform;
      }
      platform.setDepth(DEPTH.PLATFORM);
      this.platformsById.set(def.id, platform);
    }
  }

  private buildWalls(): void {
    this.walls = this.physics.add.staticGroup();
    for (const def of WALLS) {
      const wall = this.add.sprite(def.x, def.y, "wall");
      this.physics.add.existing(wall, true);
      wall.setDepth(DEPTH.PLATFORM);
      this.walls.add(wall);
    }
  }

  private buildGoalMarker(): void {
    const goal = this.platformsById.get(GOAL_PLATFORM_ID);
    if (!goal) return;
    const flag = this.add.image(goal.x, goal.y - 45, "ui-higher-sign");
    flag.setDepth(DEPTH.PLATFORM);
  }

  private buildEnemies(): void {
    this.groundEnemies = this.physics.add.group();
    this.flyingEnemies = this.physics.add.group();

    for (const def of GROUND_ENEMIES) {
      const platform = this.platformsById.get(def.platformId);
      if (!platform) continue;

      let enemy: Enemy;
      if (def.type === "waddler") {
        enemy = new Waddler(this, platform);
      } else if (def.type === "sprinter") {
        const sprinter = new Sprinter(this, platform, this.player);
        this.chasingEnemies.push(sprinter);
        enemy = sprinter;
      } else {
        const superSprinter = new SuperSprinter(this, platform, this.player);
        this.chasingEnemies.push(superSprinter);
        enemy = superSprinter;
      }
      enemy.setDepth(DEPTH.ENEMY);
      this.groundEnemies.add(enemy);
    }

    for (const def of FLYING_ENEMIES) {
      const enemy =
        def.type === "flutterer"
          ? new Flutterer(this, def.path)
          : new SuperFlutterer(this, def.path, this.player);
      enemy.setDepth(DEPTH.ENEMY);
      this.flyingEnemies.add(enemy);
    }
  }

  private setupColliders(): void {
    this.physics.add.collider(
      this.player,
      this.staticPlatforms,
      (playerObj, platformObj) => this.onPlayerLandsOnPlatform(playerObj as Player, platformObj as Platform),
    );
    this.physics.add.collider(
      this.player,
      this.movingPlatforms,
      (playerObj, platformObj) =>
        this.onPlayerLandsOnMovingPlatform(playerObj as Player, platformObj as MovingPlatform),
    );
    this.physics.add.collider(this.player, this.walls);

    this.physics.add.collider(this.groundEnemies, this.staticPlatforms);
    this.physics.add.collider(this.groundEnemies, this.movingPlatforms);
    this.physics.add.collider(this.groundEnemies, this.walls);

    this.physics.add.overlap(
      this.player,
      this.groundEnemies,
      (playerObj, enemyObj) => this.onPlayerEnemyContact(playerObj as Player, enemyObj as Enemy),
    );
    this.physics.add.overlap(
      this.player,
      this.flyingEnemies,
      (playerObj, enemyObj) => this.onPlayerEnemyContact(playerObj as Player, enemyObj as Enemy),
    );
  }

  private onPlayerLandsOnPlatform(player: Player, platform: Platform): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    if (!body.touching.down) return;
    this.playerCurrentPlatformId = platform.def.id;
    if (platform instanceof FallingPlatform) {
      platform.trigger();
    }
  }

  private onPlayerLandsOnMovingPlatform(player: Player, platform: MovingPlatform): void {
    const body = player.body as Phaser.Physics.Arcade.Body;
    if (!body.touching.down) return;
    this.playerCurrentPlatformId = platform.def.id;
    const { dx } = platform.frameDelta(this.game.loop.delta);
    player.x += dx;
  }

  private onPlayerEnemyContact(player: Player, enemy: Enemy): void {
    if (this.runState !== "playing" || enemy.state !== "alive") return;
    const body = player.body as Phaser.Physics.Arcade.Body;
    const stompedFromAbove = body.velocity.y > 0 && player.y < enemy.y - enemy.displayHeight * 0.15;

    if (stompedFromAbove) {
      enemy.stomp();
      body.setVelocityY(-320);
      this.spawnEffect(enemy.x, enemy.y, "effect-hit-stars");
    } else {
      player.applyKnockback(enemy.x, this.time.now);
    }
  }

  private spawnEffect(x: number, y: number, key: string): void {
    const fx = this.add.image(x, y, key).setDepth(DEPTH.UI);
    this.tweens.add({
      targets: fx,
      alpha: 0,
      scale: 1.3,
      duration: 350,
      onComplete: () => fx.destroy(),
    });
  }

  private setupCamera(): void {
    const cam = this.cameras.main;
    cam.setBounds(0, WORLD_TOP, GAME_WIDTH, WORLD_BOTTOM - WORLD_TOP);
    cam.setZoom(CAMERA_ZOOM);
    cam.startFollow(this.player, true, 0.1, 0.12);
    cam.setDeadzone(40, 90);
  }

  private setupInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keyA = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyD = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.keyShift = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keySpace = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(time: number, delta: number): void {
    if (this.runState === "playing") {
      this.updatePlaying(time);
    }
    void delta;
  }

  private updatePlaying(time: number): void {
    const input: PlayerInput = {
      left: this.cursors.left.isDown || this.keyA.isDown,
      right: this.cursors.right.isDown || this.keyD.isDown,
      run: this.keyShift.isDown,
      jumpPressed:
        Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        Phaser.Input.Keyboard.JustDown(this.keySpace),
      jumpHeld: this.cursors.up.isDown || this.keySpace.isDown,
    };

    this.player.update(input, time);
    this.updateChasers();
    this.cleanupFallenEnemies();

    if (this.player.y > LAVA_Y) {
      this.triggerGameOver();
      return;
    }

    const goalPlatform = this.platformsById.get(GOAL_PLATFORM_ID);
    if (goalPlatform && this.player.y < goalPlatform.y - 10) {
      this.triggerWin();
    }
  }

  private updateChasers(): void {
    for (const enemy of this.chasingEnemies) {
      if (!enemy.active) continue;
      enemy.setChasing(enemy.homePlatformId === this.playerCurrentPlatformId);
    }
  }

  private cleanupFallenEnemies(): void {
    const sweep = (group: Phaser.Physics.Arcade.Group) => {
      for (const child of [...group.getChildren()]) {
        const enemy = child as Enemy;
        if (enemy.y > LAVA_Y + 150) enemy.destroy();
      }
    };
    sweep(this.groundEnemies);
    sweep(this.flyingEnemies);
  }

  private triggerGameOver(): void {
    this.runState = "gameover";
    this.physics.pause();
    showButtonScreen(this, "screen-gameover", GAMEOVER_BUTTON, () => this.scene.restart());
  }

  private triggerWin(): void {
    this.runState = "win";
    this.physics.pause();
    showButtonScreen(this, "screen-win", WIN_BUTTON, () => this.scene.restart());
  }
}
