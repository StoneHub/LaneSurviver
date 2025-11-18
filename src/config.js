export const GAME_CONFIG = {
  effects: {
    playerFire: {
      count: 8,
      palette: ['#ffe566', '#fff6a8', '#ffb347'],
      speed: [160, 240],
      angle: -Math.PI / 2,
      spread: Math.PI / 6,
      life: [140, 220],
      size: [1.5, 3.5],
      gravity: 200,
      drag: 0.82,
      blend: 'lighter',
      fadePower: 1.2,
    },
    playerFireShake: { magnitude: 3, duration: 90 },
    enemyDestroyed: {
      count: 14,
      palette: ['#ff4f6d', '#ffd1dc', '#ff7b93'],
      speed: [150, 260],
      life: [220, 360],
      size: [2.2, 4.8],
      gravity: 300,
      drag: 0.88,
      blend: 'lighter',
      fadePower: 1.4,
    },
    enemyDestroyedShake: { magnitude: 6, duration: 180 },
    leak: {
      count: 18,
      palette: ['#f060d0', '#ff96e6', '#ffffff'],
      speed: [120, 240],
      life: [240, 420],
      size: [2.5, 5.5],
      gravity: 360,
      drag: 0.86,
      blend: 'lighter',
      fadePower: 1.6,
    },
    leakShake: { magnitude: 8, duration: 240 },
    criticalHit: {
      count: 12,
      palette: ['#fbbf24', '#f59e0b', '#ffffff'], // Gold/Amber sparks
      speed: [180, 300],
      life: [200, 400],
      size: [2, 4],
      gravity: 200,
      drag: 0.85,
      blend: 'lighter',
    },
    shieldBreak: {
      count: 20,
      palette: ['#bae6fd', '#e0f2fe', '#ffffff'], // Glass shards
      speed: [150, 350],
      life: [400, 600],
      size: [3, 6],
      gravity: 400,
      drag: 0.9,
      blend: 'normal', // Glass isn't necessarily additive
    },
    playerTrail: {
      count: 1,
      palette: ['#ffffff', '#38bdf8'],
      speed: [0, 20],
      life: [150, 250],
      size: [2, 3],
      gravity: 0,
      drag: 0.9,
      blend: 'lighter',
      fadePower: 2,
    },
  },
  combo: {
    window: 2000, // ms to keep combo alive
    threshold: 10, // kills for boost
    fireRateBoost: 0.6, // multiplier (lower is faster)
  },
  lanes: 4,
  laneWidth: 120,
  canvasPadding: 16,
  playfieldHeight: 1000,
  player: {
    width: 32,
    height: 48,
    moveDuration: 150,
    fireCooldown: 220,
    minFireCooldown: 90,
    invulnerabilityDuration: 2000,
    maxHealth: 5,
    projectileSpeed: 760,
    projectileSpeedMax: 1080,
    spreadStep: 0.12,
    maxSpread: 0.32,
    autoAimStrength: 1.6,
  },
  projectile: {
    width: 8,
    height: 24,
    autoAimTurnRate: 5.4,
  },
  enemy: {
    width: 28,
    height: 38,
    baseSpeed: 180,
    maxSpeed: 540,
    spawnInterval: 950,
    minSpawnInterval: 320,
    burstSpawnCount: 6,
    burstMultiplier: 2.1,
    burstInterval: 12000,
    burstDuration: 2200,
    // Enemy size variations
    sizeVariants: [
      { scale: 0.6, weight: 0.3, canMove: true, moveSpeed: 45 },   // Small, nimble
      { scale: 0.8, weight: 0.25, canMove: true, moveSpeed: 30 },  // Medium-small
      { scale: 1.0, weight: 0.25, canMove: false, moveSpeed: 0 },  // Normal, no lateral movement
      { scale: 1.3, weight: 0.15, canMove: false, moveSpeed: 0 },  // Large, no lateral movement
      { scale: 1.6, weight: 0.05, canMove: false, moveSpeed: 0 },  // Extra large, no lateral movement
    ],
    lateralMoveRange: 0.35, // Max lateral movement within lane (fraction of lane width)
    // Enemy types with unique behaviors
    types: [
      {
        id: 'basic',
        name: 'Basic',
        color: '#ff4f6d',
        weight: 0.5,
        healthMultiplier: 1,
        scoreMultiplier: 1,
        canShoot: false,
      },
      {
        id: 'tank',
        name: 'Tank',
        color: '#ff8c42',
        weight: 0.2,
        healthMultiplier: 3,
        scoreMultiplier: 3,
        canShoot: false,
      },
      {
        id: 'shooter',
        name: 'Shooter',
        color: '#8b5cf6',
        weight: 0.15,
        healthMultiplier: 1.5,
        scoreMultiplier: 2,
        canShoot: true,
        shootCooldown: 2000,
        shootChance: 0.3,
      },
      {
        id: 'fast',
        name: 'Fast',
        color: '#22d3ee',
        weight: 0.15,
        healthMultiplier: 0.7,
        scoreMultiplier: 1.5,
        speedMultiplier: 1.4,
        canShoot: false,
      },
    ],
  },
  difficulty: {
    rampInterval: 10000,
    rampFactor: 0.92,
    scorePerSecond: 5,
    scorePerEnemy: 25,
    burstRamp: 0.1,
    maxEnemies: 64,
  },
  damage: {
    onHit: 1,
    onLeak: 1,
  },
  powerUps: {
    dropChance: 0.08,
    dropRamp: 0.015,
    maxActive: 8,
    gravity: 280,
    magnetRadius: 180,
    collectRadius: 44,
  },
};

export const UI_CONFIG = {
  mobileBreakpoint: 920,
};
