// TODO: Add filtering/sorting options for run history
// IDEA: Add visual graphs/charts for score trends
export class RunHistoryPanel {
  constructor(root) {
    this.root = root;
  }

  update(runHistory) {
    const stats = runHistory.getStats();
    const recentRuns = runHistory.getRuns(10);

    this.root.innerHTML = `
      <div class="history-header">
        <h2>Run History</h2>
        ${stats.totalRuns > 0 ? `<button class="clear-history-btn" data-clear-history>Clear</button>` : ''}
      </div>

      ${stats.totalRuns > 0 ? `
        <div class="history-stats">
          <div class="history-stat">
            <div class="history-stat-label">Total Runs</div>
            <div class="history-stat-value">${stats.totalRuns}</div>
          </div>
          <div class="history-stat">
            <div class="history-stat-label">Best Score</div>
            <div class="history-stat-value">${stats.bestScore.toLocaleString()}</div>
          </div>
          <div class="history-stat">
            <div class="history-stat-label">Best Time</div>
            <div class="history-stat-value">${stats.bestTimeFormatted}</div>
          </div>
          <div class="history-stat">
            <div class="history-stat-label">Avg Score</div>
            <div class="history-stat-value">${stats.avgScore.toLocaleString()}</div>
          </div>
        </div>

        <div class="history-list">
          <div class="history-list-header">Recent Runs</div>
          ${recentRuns.map((run, index) => this.renderRun(run, index, stats.bestScore)).join('')}
        </div>
      ` : `
        <div class="history-empty">
          <p>No runs yet. Start playing to build your history!</p>
        </div>
      `}
    `;

    // Add clear history handler
    const clearBtn = this.root.querySelector('[data-clear-history]');
    if (clearBtn && this.onClear) {
      clearBtn.onclick = () => {
        if (confirm('Clear all run history? This cannot be undone.')) {
          this.onClear();
        }
      };
    }
  }

  renderRun(run, index, bestScore) {
    const isBest = run.score === bestScore;
    const causeIcon = this.getCauseIcon(run.cause);

    return `
      <div class="history-run ${isBest ? 'history-run-best' : ''}">
        <div class="history-run-rank">#${index + 1}</div>
        <div class="history-run-details">
          <div class="history-run-score">
            ${run.score.toLocaleString()}
            ${isBest ? '<span class="best-badge">🏆</span>' : ''}
          </div>
          <div class="history-run-meta">
            ${causeIcon} ${run.survivalTimeFormatted} • Lvl ${run.playerLevel}
          </div>
        </div>
        <div class="history-run-time">${this.getRelativeTime(run.timestamp)}</div>
      </div>
    `;
  }

  getCauseIcon(cause) {
    switch (cause) {
      case 'leak':
        return '⬇️';
      case 'collision':
        return '💥';
      case 'projectile':
        return '🔥';
      default:
        return '☠️';
    }
  }

  getRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  }

  setClearHandler(handler) {
    this.onClear = handler;
  }
}
