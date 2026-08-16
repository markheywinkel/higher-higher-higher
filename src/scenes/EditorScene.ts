import Phaser from "phaser";
import { loadSprites, loadBackground } from "../assets";
import { resolvePlatformTexture, type PlatformDef } from "../entities/platforms/Platform";
import type { GroundEnemyDef, GroundEnemyType, FlyingEnemyDef, FlyingEnemyType, LevelData } from "../level/types";
import { DEFAULT_LEVEL } from "../level/levelData";
import { downloadLevel, levelFromJSON, cloneLevel } from "../level/serialize";
import { GAME_WIDTH, DEPTH } from "../config/constants";

type PlatformTool = "platform-solid-stone" | "platform-solid-wood" | "platform-falling" | "platform-moving-h" | "platform-moving-v";
type EnemyTool = "enemy-waddler" | "enemy-sprinter" | "enemy-super-sprinter" | "enemy-flutterer" | "enemy-super-flutterer";
type ToolId = PlatformTool | EnemyTool | "wall" | "player-start" | "goal" | "erase";

const GRID = 10;
const ERASE_RADIUS = 45;
const WORLD_MARGIN = 300;

const ENEMY_ICON: Record<EnemyTool, string> = {
  "enemy-waddler": "watschler-dead",
  "enemy-sprinter": "sprinter-dead",
  "enemy-super-sprinter": "supersprinter-dead",
  "enemy-flutterer": "flutterer-dead",
  "enemy-super-flutterer": "superflutterer-dead",
};

const GROUND_ENEMY_TYPE: Partial<Record<EnemyTool, GroundEnemyType>> = {
  "enemy-waddler": "waddler",
  "enemy-sprinter": "sprinter",
  "enemy-super-sprinter": "super-sprinter",
};

const FLYING_ENEMY_TYPE: Partial<Record<EnemyTool, FlyingEnemyType>> = {
  "enemy-flutterer": "flutterer",
  "enemy-super-flutterer": "super-flutterer",
};

function snap(v: number): number {
  return Math.round(v / GRID) * GRID;
}

export class EditorScene extends Phaser.Scene {
  private level: LevelData = cloneLevel(DEFAULT_LEVEL);
  private tool: ToolId = "platform-solid-stone";
  private size: 1 | 2 | 3 | 4 = 3;

  private placedGroup!: Phaser.GameObjects.Group;
  private dragStart: { x: number; y: number } | null = null;
  private dragPreview?: Phaser.GameObjects.Graphics;
  private worldTop = -500;
  private worldBottom = 1500;

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super("EditorScene");
  }

  init(data: { level?: LevelData }): void {
    if (data?.level) {
      this.level = data.level;
    }
  }

  preload(): void {
    loadSprites(this);
    loadBackground(this);
  }

  create(): void {
    this.placedGroup = this.add.group();
    this.cursors = this.input.keyboard!.createCursorKeys();

    this.fitZoomToWidth();
    this.rebuildWorldExtent();
    this.drawStaticBackdrop();
    this.redraw();
    this.setupToolbar();
    this.setupPointerHandling();

    this.input.on("wheel", (_p: unknown, _o: unknown, _dx: number, dy: number) => {
      this.cameras.main.scrollY += dy * 0.6;
    });
  }

  private fitZoomToWidth(): void {
    const zoom = Math.min(1, this.scale.width / GAME_WIDTH);
    this.cameras.main.setZoom(zoom);
    this.cameras.main.centerOn(GAME_WIDTH / 2, this.level.playerStart.y);
  }

  update(): void {
    const speed = 12 / this.cameras.main.zoom;
    if (this.cursors.up.isDown) this.cameras.main.scrollY -= speed;
    if (this.cursors.down.isDown) this.cameras.main.scrollY += speed;
    if (this.cursors.left.isDown) this.cameras.main.scrollX -= speed;
    if (this.cursors.right.isDown) this.cameras.main.scrollX += speed;
  }

  private rebuildWorldExtent(): void {
    const allY = [
      ...this.level.platforms.map((p) => p.y),
      this.level.goal.y,
      this.level.playerStart.y,
      ...this.level.walls.map((w) => w.y),
    ];
    this.worldTop = Math.min(...allY) - WORLD_MARGIN;
    this.worldBottom = Math.max(...allY) + WORLD_MARGIN;
    this.cameras.main.setBounds(
      -400,
      this.worldTop,
      GAME_WIDTH + 800,
      this.worldBottom - this.worldTop,
    );
  }

  private drawStaticBackdrop(): void {
    const bg = this.add.image(GAME_WIDTH / 2, this.worldBottom, "background-sky");
    bg.setOrigin(0.5, 1);
    bg.setDisplaySize(GAME_WIDTH, this.worldBottom - this.worldTop);
    bg.setDepth(DEPTH.BACKGROUND);

    const grid = this.add.graphics().setDepth(DEPTH.BACKGROUND + 1);
    grid.lineStyle(1, 0xffffff, 0.08);
    for (let y = Math.floor(this.worldTop / 100) * 100; y < this.worldBottom; y += 100) {
      grid.lineBetween(-400, y, GAME_WIDTH + 400, y);
    }
    for (let x = 0; x <= GAME_WIDTH; x += 100) {
      grid.lineBetween(x, this.worldTop, x, this.worldBottom);
    }
    grid.lineStyle(2, 0xff5555, 0.4);
    grid.lineBetween(0, this.worldTop, 0, this.worldBottom);
    grid.lineBetween(GAME_WIDTH, this.worldTop, GAME_WIDTH, this.worldBottom);
  }

  private redraw(): void {
    this.placedGroup.clear(true, true);

    for (const def of this.level.platforms) {
      const sprite = this.add.sprite(def.x, def.y, resolvePlatformTexture(def));
      if (def.widthOverride) sprite.setDisplaySize(def.widthOverride, sprite.height);
      sprite.setDepth(DEPTH.PLATFORM);
      this.placedGroup.add(sprite);
    }

    for (const def of this.level.walls) {
      const sprite = this.add.sprite(def.x, def.y, "wall").setDepth(DEPTH.PLATFORM);
      this.placedGroup.add(sprite);
    }

    for (const def of this.level.groundEnemies) {
      const key = ENEMY_ICON[`enemy-${def.type}` as EnemyTool];
      const sprite = this.add.sprite(def.x, def.y, key).setDepth(DEPTH.ENEMY);
      this.placedGroup.add(sprite);
    }

    for (const def of this.level.flyingEnemies) {
      const key = def.type === "flutterer" ? "flutterer-dead" : "superflutterer-dead";
      const { axis, from, to, cross } = def.path;
      const p1 = axis === "x" ? { x: from, y: cross } : { x: cross, y: from };
      const p2 = axis === "x" ? { x: to, y: cross } : { x: cross, y: to };
      const line = this.add.graphics().setDepth(DEPTH.ENEMY - 1);
      line.lineStyle(3, 0xffaa33, 0.8);
      line.lineBetween(p1.x, p1.y, p2.x, p2.y);
      this.placedGroup.add(line);
      this.placedGroup.add(this.add.sprite(p1.x, p1.y, key).setDepth(DEPTH.ENEMY));
      this.placedGroup.add(this.add.sprite(p2.x, p2.y, key).setDepth(DEPTH.ENEMY));
    }

    const start = this.add.sprite(this.level.playerStart.x, this.level.playerStart.y, "capybara-idle", 0);
    start.setDepth(DEPTH.PLAYER);
    this.placedGroup.add(start);

    const goal = this.add.image(this.level.goal.x, this.level.goal.y - 45, "ui-higher-sign");
    goal.setDepth(DEPTH.PLATFORM);
    this.placedGroup.add(goal);
  }

  private setupPointerHandling(): void {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      if (this.isFlyingTool(this.tool)) {
        this.dragStart = { x: snap(world.x), y: snap(world.y) };
        this.dragPreview = this.add.graphics().setDepth(DEPTH.UI);
        return;
      }
      this.handleClick(snap(world.x), snap(world.y));
    });

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.dragStart || !this.dragPreview) return;
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.dragPreview.clear();
      this.dragPreview.lineStyle(3, 0xffaa33, 0.9);
      this.dragPreview.lineBetween(this.dragStart.x, this.dragStart.y, world.x, world.y);
    });

    this.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      if (!this.dragStart) return;
      const world = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
      this.commitFlyingPath(this.dragStart, { x: snap(world.x), y: snap(world.y) });
      this.dragStart = null;
      this.dragPreview?.destroy();
      this.dragPreview = undefined;
    });
  }

  private isFlyingTool(tool: ToolId): boolean {
    return tool === "enemy-flutterer" || tool === "enemy-super-flutterer";
  }

  private handleClick(x: number, y: number): void {
    if (this.tool === "erase") {
      this.eraseNear(x, y);
      return;
    }
    if (this.tool === "player-start") {
      this.level.playerStart = { x, y };
    } else if (this.tool === "goal") {
      this.level.goal = { x, y };
    } else if (this.tool === "wall") {
      this.level.walls.push({ id: this.nextId("w", this.level.walls.map((w) => w.id)), x, y });
    } else if (this.tool.startsWith("platform-")) {
      this.level.platforms.push(this.buildPlatformDef(x, y));
    } else if (this.tool.startsWith("enemy-")) {
      const groundType = GROUND_ENEMY_TYPE[this.tool as EnemyTool];
      if (groundType) {
        const def: GroundEnemyDef = { type: groundType, x, y };
        this.level.groundEnemies.push(def);
      }
    }
    this.rebuildWorldExtent();
    this.redraw();
  }

  private commitFlyingPath(start: { x: number; y: number }, end: { x: number; y: number }): void {
    const type = FLYING_ENEMY_TYPE[this.tool as EnemyTool];
    if (!type) return;
    const dx = Math.abs(end.x - start.x);
    const dy = Math.abs(end.y - start.y);
    const def: FlyingEnemyDef =
      dx >= dy
        ? { type, path: { axis: "x", from: Math.min(start.x, end.x), to: Math.max(start.x, end.x), cross: start.y } }
        : { type, path: { axis: "y", from: Math.min(start.y, end.y), to: Math.max(start.y, end.y), cross: start.x } };
    this.level.flyingEnemies.push(def);
    this.rebuildWorldExtent();
    this.redraw();
  }

  private buildPlatformDef(x: number, y: number): PlatformDef {
    const id = this.nextId("p", this.level.platforms.map((p) => p.id));
    const base = { id, x, y, size: this.size };
    switch (this.tool as PlatformTool) {
      case "platform-solid-stone":
        return { ...base, type: "solid", material: "stone" };
      case "platform-solid-wood":
        return { ...base, type: "solid", material: "wood" };
      case "platform-falling":
        return { ...base, type: "falling" };
      case "platform-moving-h":
        return { ...base, type: "moving-h", range: 120, speed: 70 };
      case "platform-moving-v":
        return { ...base, type: "moving-v", range: 100, speed: 60 };
    }
  }

  private nextId(prefix: string, existing: string[]): string {
    let max = -1;
    for (const id of existing) {
      const m = /^\D*(\d+)$/.exec(id);
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return `${prefix}${max + 1}`;
  }

  private eraseNear(x: number, y: number): void {
    type Candidate = { dist: number; remove: () => void };
    const candidates: Candidate[] = [];

    this.level.platforms.forEach((def, i) => {
      const dist = Phaser.Math.Distance.Between(x, y, def.x, def.y);
      candidates.push({ dist, remove: () => this.level.platforms.splice(i, 1) });
    });
    this.level.walls.forEach((def, i) => {
      const dist = Phaser.Math.Distance.Between(x, y, def.x, def.y);
      candidates.push({ dist, remove: () => this.level.walls.splice(i, 1) });
    });
    this.level.groundEnemies.forEach((def, i) => {
      const dist = Phaser.Math.Distance.Between(x, y, def.x, def.y);
      candidates.push({ dist, remove: () => this.level.groundEnemies.splice(i, 1) });
    });
    this.level.flyingEnemies.forEach((def, i) => {
      const { axis, from, to, cross } = def.path;
      const midX = axis === "x" ? (from + to) / 2 : cross;
      const midY = axis === "x" ? cross : (from + to) / 2;
      const dist = Phaser.Math.Distance.Between(x, y, midX, midY);
      candidates.push({ dist, remove: () => this.level.flyingEnemies.splice(i, 1) });
    });

    candidates.sort((a, b) => a.dist - b.dist);
    const nearest = candidates[0];
    if (nearest && nearest.dist <= ERASE_RADIUS) {
      nearest.remove();
      this.rebuildWorldExtent();
      this.redraw();
    }
  }

  private setupToolbar(): void {
    const toolButtons = document.querySelectorAll<HTMLButtonElement>("button.tool[data-tool]");
    toolButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        toolButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.tool = btn.dataset.tool as ToolId;
      });
    });
    toolButtons[0]?.classList.add("active");

    const sizeButtons = document.querySelectorAll<HTMLButtonElement>("#sizeStepper button");
    sizeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        sizeButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.size = Number(btn.dataset.size) as 1 | 2 | 3 | 4;
      });
    });

    document.getElementById("btnNew")!.addEventListener("click", () => {
      if (!confirm("Neues, leeres Level anlegen? Nicht gespeicherte Änderungen gehen verloren.")) return;
      this.level = {
        playerStart: { x: 200, y: 600 },
        goal: { x: 200, y: -400 },
        platforms: [{ id: "p0", type: "solid", x: 200, y: 670, material: "stone", widthOverride: 300 }],
        walls: [],
        groundEnemies: [],
        flyingEnemies: [],
      };
      this.rebuildWorldExtent();
      this.redraw();
    });

    document.getElementById("btnLoadDefault")!.addEventListener("click", () => {
      if (!confirm("Aktuelles Standard-Level laden? Nicht gespeicherte Änderungen gehen verloren.")) return;
      this.level = cloneLevel(DEFAULT_LEVEL);
      this.rebuildWorldExtent();
      this.redraw();
    });

    document.getElementById("btnExport")!.addEventListener("click", () => {
      downloadLevel(this.level, "level.json");
    });

    const fileInput = document.getElementById("fileInput") as HTMLInputElement;
    document.getElementById("btnImport")!.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      file.text().then((text) => {
        try {
          this.level = levelFromJSON(text);
          this.rebuildWorldExtent();
          this.redraw();
        } catch (err) {
          alert("Konnte Level-Datei nicht lesen: " + (err as Error).message);
        }
      });
      fileInput.value = "";
    });

    document.getElementById("btnTest")!.addEventListener("click", () => {
      this.scene.start("GameScene", { level: cloneLevel(this.level), fromEditor: true });
    });
  }
}
