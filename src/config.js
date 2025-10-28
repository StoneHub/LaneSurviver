export const GAME_CONFIG = {
  lanes: 4,
  laneWidth: 120,
  canvasPadding: 16,
  playfieldHeight: 1000,
  player: {
    width: 32,
    height: 48,
    moveDuration: 150,
    fireCooldown: 220,
    maxHealth: 5,
    projectileSpeed: 760,
  },
  projectile: {
    width: 8,
    height: 24,
  },
  enemy: {
    width: 36,
    height: 48,
    baseSpeed: 180,
    maxSpeed: 540,
    spawnInterval: 950,
    minSpawnInterval: 320,
  },
  difficulty: {
    rampInterval: 10000,
    rampFactor: 0.92,
    scorePerSecond: 5,
    scorePerEnemy: 25,
  },
  damage: {
    onHit: 1,
    onLeak: 1,
  },
};

export const UI_CONFIG = {
  mobileBreakpoint: 920,
};
