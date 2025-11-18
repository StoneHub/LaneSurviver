export class HUDController {
  constructor(root) {
    this.root = root;
    this.scoreEl = root.querySelector('[data-score]');
    this.healthEl = root.querySelector('[data-health]');
    this.timerEl = root.querySelector('[data-timer]');
    this.levelEl = root.querySelector('[data-level]');
    this.dpsEl = root.querySelector('[data-dps]');
    this.difficultyEl = root.querySelector('[data-difficulty]');
    this.killsEl = root.querySelector('[data-kills]');
    this.passedEl = root.querySelector('[data-passed]');

    // Combo UI (might be outside root if root is just .hud, but let's assume root is passed correctly or we query document)
    // Actually HUDController root is `[data-hud]`. The combo meter is outside.
    // I should probably pass the combo element or query it from document.
    this.comboContainer = document.getElementById('combo-meter');
    this.comboCountEl = document.querySelector('[data-combo-count]');
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
    if (this.dpsEl) {
      this.dpsEl.textContent = Math.floor(state.dps || 0).toLocaleString();
    }
    if (this.difficultyEl) {
      this.difficultyEl.textContent = `${(state.difficultyLevel || 1).toFixed(1)}x`;
    }
    if (this.killsEl) {
      this.killsEl.textContent = (state.kills || 0).toLocaleString();
    }
    if (this.passedEl) {
      this.passedEl.textContent = `${state.enemiesPassed || 0}/${state.settings?.passThroughLimit || 100}`;
    }

    if (this.comboContainer && this.comboCountEl) {
      const count = state.combo?.count || 0;
      if (count > 1) {
        this.comboContainer.classList.remove('hidden');
        this.comboCountEl.textContent = count;

        // Simple scale effect based on count (capped)
        const scale = 1 + Math.min(0.5, count * 0.05);
        this.comboCountEl.style.transform = `scale(${scale})`;

        if (state.combo.isBoostActive) {
          this.comboCountEl.style.color = '#ef4444'; // Red for boost
          this.comboCountEl.style.textShadow = '0 0 30px rgba(239, 68, 68, 0.8)';
        } else {
          this.comboCountEl.style.color = '#fbbf24';
          this.comboCountEl.style.textShadow = '0 0 20px rgba(251, 191, 36, 0.5)';
        }
      } else {
        this.comboContainer.classList.add('hidden');
      }
    }
  }
}
