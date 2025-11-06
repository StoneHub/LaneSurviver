import { GAME_CONFIG } from '../config.js';
import { POWER_UP_DEFS } from '../config/powerups.js';

const POWER_UP_MAP = POWER_UP_DEFS.reduce((map, def) => {
  map[def.id] = def;
  return map;
}, {});

export class Renderer {
  constructor(context, canvasMetrics) {
    this.ctx = context;
    this.metrics = canvasMetrics;
    this.offset = { x: 0, y: 0 };
  }

  setMetrics(metrics) {
    this.metrics = metrics;
  }

  beginFrame(offset = { x: 0, y: 0 }) {
    const { ctx, metrics } = this;
    this.offset = offset;
    ctx.save();
    this.clear();
    ctx.translate(offset.x * metrics.scale, offset.y * metrics.scale);
  }

  endFrame() {
    this.ctx.restore();
    this.offset = { x: 0, y: 0 };
  }

  clear() {
    const { ctx, metrics } = this;
    ctx.fillStyle = '#04060b';
    ctx.fillRect(0, 0, metrics.pixelWidth, metrics.pixelHeight);
  }

  drawLanes() {
    const { ctx, metrics } = this;
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = Math.max(1, metrics.scale);
    const top = metrics.topY;
    const bottom = metrics.bottomY;
    for (let lane = 1; lane < GAME_CONFIG.lanes; lane += 1) {
      const x = metrics.offsetX + metrics.laneX(lane) * metrics.scale;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.stroke();
    }
  }

  drawPlayer(player) {
    const { ctx, metrics } = this;
    if (player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    const width = GAME_CONFIG.player.width * metrics.scale;
    const height = GAME_CONFIG.player.height * metrics.scale;
    const x =
      metrics.offsetX +
      metrics.laneCenter(player.lane, player.laneProgress) * metrics.scale -
      width / 2;
    const y = metrics.topY + player.y * metrics.scale;

    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#58e2ff');
    gradient.addColorStop(1, '#157bff');
    ctx.fillStyle = gradient;
    roundRect(ctx, x, y, width, height, 6 * metrics.scale);
    ctx.fill();

    ctx.globalAlpha = 1;
  }

  drawProjectiles(projectiles) {
    const { ctx, metrics } = this;
    projectiles.forEach((projectile) => {
      if (projectile.isCompanion) {
        // Companion projectiles - cyan color
        ctx.fillStyle = '#22d3ee';
        const width = projectile.width * metrics.scale;
        const height = projectile.height * metrics.scale;
        const x = metrics.offsetX + projectile.x * metrics.scale - width / 2;
        const y = metrics.topY + projectile.y * metrics.scale - height / 2;
        ctx.fillRect(x, y, width, height);
      } else {
        // Player projectiles - yellow
        ctx.fillStyle = '#ffe566';
        const width = GAME_CONFIG.projectile.width * metrics.scale;
        const height = GAME_CONFIG.projectile.height * metrics.scale;
        const offset = projectile.offset ?? 0;
        const x =
          metrics.offsetX +
          metrics.laneCenter(projectile.lane, offset) * metrics.scale -
          width / 2;
        const y = metrics.topY + projectile.y * metrics.scale;
        ctx.fillRect(x, y, width, height);
      }
    });
  }

  drawCompanions(companions) {
    if (!companions?.length) return;
    const { ctx, metrics } = this;
    companions.forEach((companion) => {
      const size = 12 * metrics.scale;
      const x = metrics.offsetX + companion.x * metrics.scale - size / 2;
      const y = metrics.topY + companion.y * metrics.scale - size / 2;

      // Draw companion as a bright cyan square
      ctx.save();
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 8 * metrics.scale;
      roundRect(ctx, x, y, size, size, 3 * metrics.scale);
      ctx.fill();
      ctx.restore();
    });
  }

  drawEnemyProjectiles(enemyProjectiles) {
    if (!enemyProjectiles?.length) return;
    const { ctx, metrics } = this;
    ctx.fillStyle = '#a78bfa';
    enemyProjectiles.forEach((projectile) => {
      const width = projectile.width * metrics.scale;
      const height = projectile.height * metrics.scale;
      const x = metrics.offsetX + projectile.x * metrics.scale - width / 2;
      const y = metrics.topY + projectile.y * metrics.scale;
      ctx.fillRect(x, y, width, height);
    });
  }

  drawEnemies(enemies) {
    const { ctx, metrics } = this;
    enemies.forEach((enemy) => {
      const enemySize = enemy.size || 1;
      const width = GAME_CONFIG.enemy.width * enemySize * metrics.scale;
      const height = GAME_CONFIG.enemy.height * enemySize * metrics.scale;
      const lateralOffset = enemy.lateralOffset || 0;
      const x =
        metrics.offsetX + metrics.laneCenter(enemy.lane, lateralOffset) * metrics.scale - width / 2;
      const y = metrics.topY + enemy.y * metrics.scale;

      // Use type color if available
      const color = enemy.typeData?.color || '#ff4f6d';
      ctx.fillStyle = color;

      roundRect(ctx, x, y, width, height, 8 * enemySize * metrics.scale);
      ctx.fill();

      // Draw health bar for enemies with more than 1 health
      if (enemy.maxHealth > 1) {
        const healthBarWidth = width;
        const healthBarHeight = 3 * metrics.scale;
        const healthBarX = x;
        const healthBarY = y - healthBarHeight - 2 * metrics.scale;
        const healthPercent = enemy.health / enemy.maxHealth;

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        // Health
        ctx.fillStyle = healthPercent > 0.5 ? '#4ade80' : healthPercent > 0.25 ? '#fbbf24' : '#f87171';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * healthPercent, healthBarHeight);
      }
    });
  }

  drawXPOrbs(xpOrbs) {
    if (!xpOrbs?.length) return;
    const { ctx, metrics } = this;

    xpOrbs.forEach((orb) => {
      const size = orb.size * metrics.scale;
      const x = metrics.offsetX + orb.x * metrics.scale - size / 2;
      const y = metrics.topY + orb.y * metrics.scale - size / 2;

      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = '#00ffff';
      ctx.shadowColor = '#00ffff';
      ctx.shadowBlur = 12 * metrics.scale;
      ctx.fillRect(x, y, size, size);
      ctx.restore();
    });
  }

  drawPowerUps(powerUps) {
    if (!powerUps?.length) return;
    const { ctx, metrics } = this;

    powerUps.forEach((powerUp) => {
      const def = POWER_UP_MAP[powerUp.id];
      const size = 18 * metrics.scale;
      const x = metrics.offsetX + powerUp.x * metrics.scale - size / 2;
      const y = metrics.topY + powerUp.y * metrics.scale - size / 2;

      ctx.save();
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = def?.color ?? '#ffffff';
      ctx.shadowColor = def?.color ?? '#ffffff';
      ctx.shadowBlur = 12 * metrics.scale;
      ctx.fillRect(x, y, size, size);
      ctx.restore();

      ctx.save();
      ctx.fillStyle = '#04060b';
      ctx.font = `${12 * metrics.scale}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def?.label ?? '?', x + size / 2, y + size / 2);
      ctx.restore();
    });
  }

  drawParticles(particles) {
    if (!particles.length) return;
    const { ctx, metrics } = this;
    const additive = [];
    const normal = [];
    particles.forEach((particle) => {
      if (particle.blend === 'lighter') additive.push(particle);
      else normal.push(particle);
    });

    const drawSet = (list, blendMode) => {
      if (!list.length) return;
      ctx.save();
      ctx.globalCompositeOperation = blendMode;
      list.forEach((particle) => {
        const size = particle.size * metrics.scale;
        const x = metrics.offsetX + particle.x * metrics.scale - size / 2;
        const y = metrics.topY + particle.y * metrics.scale - size / 2;
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(x, y, size, size);
      });
      ctx.restore();
    };

    drawSet(normal, 'source-over');
    drawSet(additive, 'lighter');
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
