import type { Platform } from "../entities/platforms/Platform";

/**
 * Findet die Plattform, auf der ein bei (x, y) platzierter Gegner stehen soll:
 * die mit dem horizontalen Rand um x, die am nächsten unterhalb/auf Höhe y liegt.
 * Fällt auf die insgesamt nächstgelegene Plattform zurück, falls keine x-Übereinstimmung
 * gefunden wird (z.B. wenn im Editor knapp daneben geklickt wurde).
 */
export function resolveNearestPlatformBelow(
  x: number,
  y: number,
  platforms: Platform[],
): Platform | undefined {
  let best: Platform | undefined;
  let bestScore = Infinity;

  for (const platform of platforms) {
    const withinX = x >= platform.leftEdge && x <= platform.rightEdge;
    if (!withinX) continue;
    const score = Math.abs(platform.y - y);
    if (score < bestScore) {
      bestScore = score;
      best = platform;
    }
  }
  if (best) return best;

  for (const platform of platforms) {
    const dx = platform.x - x;
    const dy = platform.y - y;
    const score = dx * dx + dy * dy;
    if (score < bestScore) {
      bestScore = score;
      best = platform;
    }
  }
  return best;
}
