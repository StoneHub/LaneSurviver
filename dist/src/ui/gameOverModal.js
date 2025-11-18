// TODO: Add animation effects for modal entrance
// IDEA: Add stats breakdown (enemies killed, upgrades obtained, etc.)
export class GameOverModal {
  constructor(root) {
    this.root = root;
  }

  show(state) {
    const deathInfo = state.deathInfo || {};
    const seconds = Math.floor((deathInfo.elapsed || state.elapsed || 0) / 1000);
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    const timeLabel = `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;

    const score = Math.floor(state.score || 0);
    const cause = this.describeCause(deathInfo);
    const lane = deathInfo.lane !== null && deathInfo.lane !== undefined
      ? `Lane ${deathInfo.lane + 1}`
      : 'Unknown Lane';

    this.root.innerHTML = `
      <div class="game-over-content">
        <div class="game-over-title">GAME OVER</div>
        <div class="game-over-stats">
          <div class="stat-large">
            <div class="stat-label">Final Score</div>
            <div class="stat-value">${score.toLocaleString()}</div>
          </div>
          <div class="stat-large">
            <div class="stat-label">Survival Time</div>
            <div class="stat-value">${timeLabel}</div>
          </div>
          <div class="stat-row">
            <div class="stat-item">
              <span class="stat-label">Cause of Death</span>
              <span class="stat-value">${cause}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Location</span>
              <span class="stat-value">${lane}</span>
            </div>
          </div>
        </div>
        <button class="restart-button" data-restart>
          <span class="restart-icon">↻</span>
          <span class="restart-text">Press R to Restart</span>
        </button>
      </div>
    `;

    this.root.classList.add('active');

    // Add click handler for restart button
    const restartBtn = this.root.querySelector('[data-restart]');
    if (restartBtn && this.onRestart) {
      restartBtn.onclick = () => this.onRestart();
    }
  }

  hide() {
    this.root.classList.remove('active');
  }

  setRestartHandler(handler) {
    this.onRestart = handler;
  }

  describeCause(death) {
    switch (death.cause) {
      case 'leak':
        return 'Enemy Leaked';
      case 'collision':
        return 'Direct Collision';
      case 'projectile':
        return 'Enemy Fire';
      default:
        return 'Destroyed';
    }
  }
}
