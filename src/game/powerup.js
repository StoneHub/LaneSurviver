import { GAME_CONFIG } from '../config.js';
import { POWER_UP_DEFS } from '../config/powerups.js';
import { clamp } from './utils.js';

const DEFAULT_CONFIG = {
  dropChance: 0.05,
  dropRamp: 0.01,
  maxActive: 6,
  gravity: 260,
  magnetRadius: 160,
  collectRadius: 42,
};

const POWER_UP_MAP = POWER_UP_DEFS.reduce((map, def) => {
  map[def.id] = def;
  return map;
}, {});

const laneCenter = (lane, offset = 0) =>
  GAME_CONFIG.canvasPadding + (lane + 0.5 + offset) * GAME_CONFIG.laneWidth;

export class PowerUpManager {
  constructor({ state, particles, abilityManager }) {
    this.state = state;
    this.particles = particles;
    this.abilityManager = abilityManager;
  }

  resolveConfig() {
    return { ...DEFAULT_CONFIG, ...(GAME_CONFIG.powerUps ?? {}) };
  }

  maybeDrop({ lane, y }) {
    const config = this.resolveConfig();
    if (this.state.powerUps.length >= config.maxActive) return;

    const burstBonus = this.state.spawnBurstsTriggered * config.dropRamp;
    const chance = Math.min(0.45, config.dropChance + burstBonus);
    if (Math.random() > chance) return;

    const definition = POWER_UP_DEFS[Math.floor(Math.random() * POWER_UP_DEFS.length)];
    const velocityJitter = (Math.random() - 0.5) * 40;

    this.state.powerUps.push({
      id: definition.id,
      x: laneCenter(lane),
      y,
      vy: -120 + velocityJitter,
    });
  }

  update(delta) {
    if (!this.state.powerUps.length) return;

    const dt = delta / 1000;
    const player = this.state.player;
    const config = this.resolveConfig();
    const playerX = laneCenter(player.lane, player.laneProgress ?? 0);
    const playerY = player.y;

    for (let i = this.state.powerUps.length - 1; i >= 0; i -= 1) {
      const powerUp = this.state.powerUps[i];
      powerUp.vy += config.gravity * dt;
      powerUp.y += powerUp.vy * dt;

      const dx = playerX - powerUp.x;
      const dy = playerY - powerUp.y;
      const dist = Math.hypot(dx, dy) || 0.001;

      if (dist < config.magnetRadius) {
        const pull = (1 - dist / config.magnetRadius) * 520;
        powerUp.x += (dx / dist) * pull * dt;
        powerUp.y += (dy / dist) * pull * dt;
      }

      if (dist < config.collectRadius) {
        this.apply(powerUp);
        this.state.powerUps.splice(i, 1);
        continue;
      }

      if (powerUp.y > GAME_CONFIG.playfieldHeight + GAME_CONFIG.canvasPadding * 2) {
        this.state.powerUps.splice(i, 1);
      }
    }
  }

  apply(powerUp) {
    const def = POWER_UP_MAP[powerUp.id];
    if (!def) return;
    const player = this.state.player;

    const { effects } = def;
    if (effects.fireCooldownMultiplier) {
      player.fireCooldown = clamp(
        player.fireCooldown * effects.fireCooldownMultiplier,
        GAME_CONFIG.player.minFireCooldown,
        GAME_CONFIG.player.fireCooldown,
      );
      player.cooldown = Math.min(player.cooldown, player.fireCooldown);
    }

    if (effects.bulletCountIncrease) {
      const maxBullets = 5;
      player.bulletCount = clamp(
        player.bulletCount + effects.bulletCountIncrease,
        1,
        maxBullets,
      );
      player.spread = Math.min(
        GAME_CONFIG.player.maxSpread,
        player.spread + GAME_CONFIG.player.spreadStep,
      );
    }

    if (effects.pierceIncrease) {
      const maxPierce = 4;
      player.pierce = clamp(player.pierce + effects.pierceIncrease, 0, maxPierce);
    }

    if (effects.projectileSpeedBonus) {
      player.projectileSpeed = clamp(
        player.projectileSpeed + effects.projectileSpeedBonus,
        GAME_CONFIG.player.projectileSpeed,
        GAME_CONFIG.player.projectileSpeedMax,
      );
    }

    if (effects.heal) {
      this.state.healPlayer(effects.heal);
    }

    // Handle activatable powerups
    if (effects.activatable && this.abilityManager) {
      this.abilityManager.addAbility(effects.type, {
        charges: effects.charges,
        duration: effects.duration,
      });
    }

    // Spawn text popup from player position
    const playerX = laneCenter(player.lane, player.laneProgress ?? 0);
    const playerY = player.y;
    if (this.state.spawnTextPopup) {
      this.state.spawnTextPopup(
        `+${def.title}`,
        playerX,
        playerY - 30,
        def.color || '#ffffff',
        20
      );
    }

    if (this.particles && def) {
      this.particles.emitBurst({
        x: powerUp.x,
        y: powerUp.y,
        count: 32,
        palette: [def.color ?? '#ffffff', '#ffffff'],
        speed: [240, 360],
        life: [280, 420],
        size: [2.5, 5],
        gravity: -160,
        drag: 0.88,
        blend: 'lighter',
      });
    }
  }
}
