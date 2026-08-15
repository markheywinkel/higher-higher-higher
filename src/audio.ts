import Phaser from "phaser";

const MUSIC_VOLUME = 0.35;
const SFX_VOLUME = 0.7;

/**
 * Startet die Hintergrundmusik (Loop), falls sie nicht schon läuft. Der Sound Manager
 * ist Game-global (scene.sound === scene.game.sound), daher überlebt die Musik
 * Szenenwechsel/Neustarts, solange wir sie nicht doppelt starten.
 */
export function ensureMusicPlaying(scene: Phaser.Scene): void {
  const existing = scene.sound.get("music");
  if (existing?.isPlaying) return;
  const music = existing ?? scene.sound.add("music", { loop: true, volume: MUSIC_VOLUME });
  music.play();
}

export function playSfx(scene: Phaser.Scene, key: "sfx-button" | "sfx-jump" | "sfx-stomp"): void {
  scene.sound.play(key, { volume: SFX_VOLUME });
}
