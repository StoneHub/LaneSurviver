import { GAME_CONFIG } from '../config.js';

export class HUDController {
  constructor(root) {
    this.root = root;
    this.scoreEl = root.querySelector('[data-score]');
    this.healthEl = root.querySelector('[data-health]');
    this.timerEl = root.querySelector('[data-timer]');
    this.levelEl = root.querySelector('[data-level]');
  }

  update(state) {
    if (this.scoreEl) {
      this.scoreEl.textContent = Math.floor(state.score).toLocaleString();
    }
    if (this.healthEl) {
      const health = state.player.health;
      const max = GAME_CONFIG.player.maxHealth;
      this.healthEl.textContent = `${'❤️'.repeat(health)}${'🖤'.repeat(
        Math.max(0, max - health),
      )}`;
    }
    if (this.timerEl) {
      const seconds = Math.floor(state.elapsed / 1000);
      const minutes = Math.floor(seconds / 60);
      const remaining = seconds % 60;
      this.timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${remaining
        .toString()
        .padStart(2, '0')}`;
    }
    if (this.levelEl) {
      this.levelEl.textContent = state.player?.level || 1;
    }
  }
}
