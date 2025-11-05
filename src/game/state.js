import { GAME_CONFIG } from '../config.js';
import { clamp } from './utils.js';

export class GameState {
  constructor() {
    this.reset();
  }

  reset() {
    this.player = {
      lane: 1,
      targetLane: 1,
      y:
        GAME_CONFIG.playfieldHeight -
        GAME_CONFIG.canvasPadding -
        GAME_CONFIG.player.height,
      invulnerable: false,
      invulnerableUntil: 0,
      health: GAME_CONFIG.player.maxHealth,
      cooldown: 0,
      laneProgress: 0,
      fireCooldown: GAME_CONFIG.player.fireCooldown,
      projectileSpeed: GAME_CONFIG.player.projectileSpeed,
      bulletCount: 1,
      spread: 0.18,
      pierce: 0,
      level: 1,
      xp: 0,
      xpToNext: 10,
      autoAimStrength: GAME_CONFIG.player.autoAimStrength ?? 1.2,
      crossLaneEnabled: false,
      crossLaneRange: 0,
      advancedTargeting: false,
    };
    this.difficultyLevel = 1;
    this.score = 0;
    this.elapsed = 0;
    this.spawnTimer = 0;
    this.enemies = [];
    this.projectiles = [];
    this.xpOrbs = [];
    this.powerUps = [];
    this.lastSpawn = 0;
    this.burstTimer = 0;
    this.burstActiveTime = 0;
    this.spawnBurstsTriggered = 0;
    this.damageLog = [];
    this.lastDamage = null;
    this.deathInfo = null;
    this.isGameOver = false;
  }

  addScore(amount) {
    this.score = Math.max(0, this.score + amount);
  }

  damagePlayer(amount, context = {}) {
    if (this.player.invulnerable) return;

    const previousHealth = this.player.health;
    const elapsed = context.elapsed ?? this.elapsed ?? 0;
    const nextHealth = clamp(
      previousHealth - amount,
      0,
      GAME_CONFIG.player.maxHealth,
    );

    const entry = {
      amount,
      cause: context.cause ?? 'unknown',
      lane: context.lane ?? null,
      elapsed,
      previousHealth,
      nextHealth,
      meta: context.meta ?? {},
    };

    this.player.health = nextHealth;
    this.player.invulnerable = true;
    this.player.invulnerableUntil = elapsed + GAME_CONFIG.player.invulnerabilityDuration;
    this.lastDamage = entry;
    this.damageLog.push(entry);

    if (nextHealth <= 0) {
      this.isGameOver = true;
      this.deathInfo = {
        ...entry,
        score: this.score,
        bursts: this.spawnBurstsTriggered,
      };
    }
  }

  healPlayer(amount) {
    this.player.health = clamp(
      this.player.health + amount,
      0,
      GAME_CONFIG.player.maxHealth,
    );
  }

  forEachEnemy(callback) {
    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      if (callback(this.enemies[i], i) === false) {
        break;
      }
    }
  }

  forEachProjectile(callback) {
    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) {
      if (callback(this.projectiles[i], i) === false) {
        break;
      }
    }
  }
}
