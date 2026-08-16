import type { LevelData } from "./types";

export function levelToJSON(level: LevelData): string {
  return JSON.stringify(level, null, 2);
}

export function levelFromJSON(text: string): LevelData {
  const parsed = JSON.parse(text) as Partial<LevelData>;
  if (!parsed.platforms || !parsed.playerStart || !parsed.goal) {
    throw new Error("Ungültiges Level-JSON: platforms/playerStart/goal fehlen.");
  }
  return {
    playerStart: parsed.playerStart,
    goal: parsed.goal,
    platforms: parsed.platforms,
    walls: parsed.walls ?? [],
    groundEnemies: parsed.groundEnemies ?? [],
    flyingEnemies: parsed.flyingEnemies ?? [],
  };
}

export function downloadLevel(level: LevelData, filename = "level.json"): void {
  const blob = new Blob([levelToJSON(level)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function cloneLevel(level: LevelData): LevelData {
  return JSON.parse(JSON.stringify(level)) as LevelData;
}
