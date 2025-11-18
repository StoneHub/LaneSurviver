// TODO: Add export/import functionality for run history
// IDEA: Add statistics like average score, best time, kill counts
// IDEA: Add achievements/milestones based on run history

const STORAGE_KEY = 'laneSurvivor_runHistory';
const MAX_RUNS = 50; // Keep last 50 runs

export class RunHistory {
  constructor() {
    this.runs = this.loadRuns();
  }

  loadRuns() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.warn('Failed to load run history:', e);
      return [];
    }
  }

  saveRun(state) {
    const run = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      score: Math.floor(state.score || 0),
      survivalTime: state.elapsed || 0,
      survivalTimeFormatted: this.formatTime(state.elapsed || 0),
      cause: state.deathInfo?.cause || 'unknown',
      lane: state.deathInfo?.lane,
      difficulty: state.difficultyLevel || 1,
      // Player stats at death
      playerLevel: state.player?.level || 1,
      upgradeCount: Object.values(state.player?.upgrades || {}).reduce((a, b) => a + b, 0),
    };

    this.runs.unshift(run);

    // Keep only last MAX_RUNS runs
    if (this.runs.length > MAX_RUNS) {
      this.runs = this.runs.slice(0, MAX_RUNS);
    }

    this.saveToStorage();
    return run;
  }

  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.runs));
    } catch (e) {
      console.warn('Failed to save run history:', e);
    }
  }

  getRuns(limit = 10) {
    return this.runs.slice(0, limit);
  }

  getStats() {
    if (this.runs.length === 0) {
      return {
        totalRuns: 0,
        bestScore: 0,
        bestTime: 0,
        avgScore: 0,
        avgTime: 0,
      };
    }

    const scores = this.runs.map(r => r.score);
    const times = this.runs.map(r => r.survivalTime);

    return {
      totalRuns: this.runs.length,
      bestScore: Math.max(...scores),
      bestTime: Math.max(...times),
      bestTimeFormatted: this.formatTime(Math.max(...times)),
      avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      avgTime: Math.round(times.reduce((a, b) => a + b, 0) / times.length),
      avgTimeFormatted: this.formatTime(Math.round(times.reduce((a, b) => a + b, 0) / times.length)),
    };
  }

  getRank(score) {
    if (this.runs.length === 0) return 1;

    const sorted = [...this.runs].sort((a, b) => b.score - a.score);
    const rank = sorted.findIndex(r => r.score <= score) + 1;

    return rank === 0 ? sorted.length + 1 : rank;
  }

  formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  }

  clear() {
    this.runs = [];
    this.saveToStorage();
  }
}
