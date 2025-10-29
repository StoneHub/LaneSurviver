import { GAME_CONFIG } from '../config.js';

export class HUDController {
  constructor(root) {
    this.root = root;
    this.scoreEl = root.querySelector('[data-score]');
    this.healthEl = root.querySelector('[data-health]');
    this.timerEl = root.querySelector('[data-timer]');
    this.statusEl = root.querySelector('[data-status]');
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
    if (this.statusEl) {
      if (!state.isGameOver) {
        this.statusEl.textContent = '';
      } else {
        this.statusEl.textContent = this.formatDeathStatus(state);
      }
    }
  }

  formatDeathStatus(state) {
    const death = state.deathInfo;
    if (!death) {
      return 'Game Over — press R to restart';
    }
    const seconds = Math.floor((death.elapsed ?? state.elapsed ?? 0) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    const timeLabel = `${minutes.toString().padStart(2, '0')}:${remaining
      .toString()
      .padStart(2, '0')}`;
    const lane =
      death.lane === null || death.lane === undefined ? 'unknown lane' : `lane ${death.lane + 1}`;
    const causeLabel = this.describeCause(death);
    return `Game Over — ${causeLabel} on ${lane} at ${timeLabel}. Press R to restart`;
  }

  describeCause(death) {
    switch (death.cause) {
      case 'leak':
        return 'Enemy leaked';
      case 'collision':
        return 'Direct collision';
      default:
        return 'Destroyed';
    }
  }
}
