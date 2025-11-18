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

    // Draw upgrade visual effects BEFORE the player body
    this.drawUpgradeEffectsBackground(player, x, y, width, height);

    // Draw base player
    const gradient = ctx.createLinearGradient(x, y, x, y + height);
    gradient.addColorStop(0, '#58e2ff');
    gradient.addColorStop(1, '#157bff');
    ctx.fillStyle = gradient;
    roundRect(ctx, x, y, width, height, 6 * metrics.scale);
    ctx.fill();

    // Draw upgrade visual effects ON TOP of the player body
    this.drawUpgradeEffectsForeground(player, x, y, width, height);

    ctx.globalAlpha = 1;
  }

  drawUpgradeEffectsBackground(player, x, y, width, height) {
    if (!player.upgrades) return;
    const { ctx, metrics } = this;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Bullet Speed - Thruster flames at the bottom
    if (player.upgrades.bulletSpeed > 0) {
      const prestige = Math.floor(player.upgrades.bulletSpeed / 3);
      const flameIntensity = 1 + prestige * 0.3;
      const flameHeight = 15 * metrics.scale * flameIntensity;

      ctx.save();
      ctx.globalAlpha = 0.7 + prestige * 0.1;

      // Animated flame effect
      const flicker = Math.sin(Date.now() / 50) * 0.2 + 0.8;

      // Left thruster
      const gradient1 = ctx.createLinearGradient(
        centerX - width * 0.3,
        y + height,
        centerX - width * 0.3,
        y + height + flameHeight
      );
      gradient1.addColorStop(0, '#ff9500');
      gradient1.addColorStop(1, 'rgba(255,149,0,0)');
      ctx.fillStyle = gradient1;
      ctx.fillRect(
        centerX - width * 0.35,
        y + height,
        width * 0.2,
        flameHeight * flicker
      );

      // Right thruster
      const gradient2 = ctx.createLinearGradient(
        centerX + width * 0.3,
        y + height,
        centerX + width * 0.3,
        y + height + flameHeight
      );
      gradient2.addColorStop(0, '#ff9500');
      gradient2.addColorStop(1, 'rgba(255,149,0,0)');
      ctx.fillStyle = gradient2;
      ctx.fillRect(
        centerX + width * 0.15,
        y + height,
        width * 0.2,
        flameHeight * flicker
      );

      ctx.restore();
    }

    // Damage - Red glowing aura/spikes
    if (player.upgrades.damage > 0) {
      const prestige = Math.floor(player.upgrades.damage / 3);
      const glowSize = 4 * metrics.scale * (1 + prestige * 0.4);

      ctx.save();
      ctx.shadowColor = '#ff3333';
      ctx.shadowBlur = glowSize * 3;
      ctx.strokeStyle = `rgba(255, 51, 51, ${0.5 + prestige * 0.1})`;
      ctx.lineWidth = glowSize;
      roundRect(ctx, x, y, width, height, 6 * metrics.scale);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawUpgradeEffectsForeground(player, x, y, width, height) {
    if (!player.upgrades) return;
    const { ctx, metrics } = this;
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    // Pierce - Arrow/drill tip at the top
    if (player.upgrades.pierce > 0) {
      const prestige = Math.floor(player.upgrades.pierce / 3);
      const tipLength = 12 * metrics.scale * (1 + prestige * 0.3);

      ctx.save();
      ctx.fillStyle = `rgba(200, 200, 255, ${0.8 + prestige * 0.2})`;
      ctx.beginPath();
      ctx.moveTo(centerX, y - tipLength);
      ctx.lineTo(centerX - width * 0.25, y);
      ctx.lineTo(centerX + width * 0.25, y);
      ctx.closePath();
      ctx.fill();

      // Add glow for prestige
      if (prestige > 0) {
        ctx.shadowColor = '#c8c8ff';
        ctx.shadowBlur = 8 * metrics.scale;
        ctx.fill();
      }
      ctx.restore();
    }

    // Multishot - Gun barrels on the sides
    if (player.upgrades.bulletCount > 0) {
      const barrelCount = Math.min(player.upgrades.bulletCount, 4);
      const barrelSize = 6 * metrics.scale;
      const barrelSpacing = height / (barrelCount + 1);

      ctx.save();
      ctx.fillStyle = '#444466';

      for (let i = 0; i < barrelCount; i++) {
        const barrelY = y + barrelSpacing * (i + 1);

        // Left barrel
        ctx.fillRect(x - barrelSize, barrelY - barrelSize / 2, barrelSize, barrelSize);

        // Right barrel
        ctx.fillRect(x + width, barrelY - barrelSize / 2, barrelSize, barrelSize);
      }
      ctx.restore();
    }

    // Fire Rate - Electric sparks
    if (player.upgrades.fireRate > 0) {
      const prestige = Math.floor(player.upgrades.fireRate / 3);
      const sparkCount = 2 + prestige;

      ctx.save();
      ctx.strokeStyle = `rgba(255, 255, 100, ${0.6 + prestige * 0.1})`;
      ctx.lineWidth = 2 * metrics.scale;

      // Animated sparks
      const time = Date.now() / 100;
      for (let i = 0; i < sparkCount; i++) {
        const angle = (time + i * (Math.PI * 2 / sparkCount)) % (Math.PI * 2);
        const sparkLength = 8 * metrics.scale;
        const startX = centerX + Math.cos(angle) * (width / 2);
        const startY = centerY + Math.sin(angle) * (height / 2);
        const endX = startX + Math.cos(angle) * sparkLength;
        const endY = startY + Math.sin(angle) * sparkLength;

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Homing - Targeting antenna/radar on top
    if (player.upgrades.autoAim > 0) {
      const prestige = Math.floor(player.upgrades.autoAim / 3);
      const antennaHeight = 15 * metrics.scale * (1 + prestige * 0.2);

      ctx.save();
      ctx.strokeStyle = `rgba(100, 255, 100, ${0.7 + prestige * 0.15})`;
      ctx.lineWidth = 2 * metrics.scale;

      // Antenna mast
      ctx.beginPath();
      ctx.moveTo(centerX, y);
      ctx.lineTo(centerX, y - antennaHeight);
      ctx.stroke();

      // Radar dish (rotating)
      const rotation = (Date.now() / 500) % (Math.PI * 2);
      const dishRadius = 6 * metrics.scale;

      ctx.save();
      ctx.translate(centerX, y - antennaHeight);
      ctx.rotate(rotation);
      ctx.strokeStyle = `rgba(100, 255, 100, ${0.8 + prestige * 0.2})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, dishRadius, dishRadius * 0.3, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Scanning line
      ctx.strokeStyle = `rgba(100, 255, 100, ${0.5})`;
      ctx.lineWidth = 1 * metrics.scale;
      ctx.beginPath();
      ctx.moveTo(centerX, y - antennaHeight);
      const scanX = centerX + Math.cos(rotation) * 30 * metrics.scale;
      const scanY = y - antennaHeight + Math.sin(rotation) * 30 * metrics.scale;
      ctx.lineTo(scanX, scanY);
      ctx.stroke();

      ctx.restore();
    }

    // Companion Power - Enhanced companion appearance (handled in drawCompanions)
    // This upgrade affects companion rendering rather than player rendering
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

  drawCompanions(companions, player) {
    if (!companions?.length) return;
    const { ctx, metrics } = this;
    const companionPowerLevel = player?.upgrades?.companionPower || 0;
    const prestige = Math.floor(companionPowerLevel / 3);

    companions.forEach((companion) => {
      const baseSize = 12 * metrics.scale;
      // Scale up with companion power upgrades
      const size = baseSize * (1 + companionPowerLevel * 0.15);
      const x = metrics.offsetX + companion.x * metrics.scale - size / 2;
      const y = metrics.topY + companion.y * metrics.scale - size / 2;

      // Draw companion as a bright cyan square
      ctx.save();

      // Enhanced glow and color with power upgrades
      const glowIntensity = 8 * metrics.scale * (1 + companionPowerLevel * 0.5);
      ctx.fillStyle = companionPowerLevel > 0 ? '#00ffff' : '#22d3ee';
      ctx.shadowColor = companionPowerLevel > 0 ? '#00ffff' : '#22d3ee';
      ctx.shadowBlur = glowIntensity;

      roundRect(ctx, x, y, size, size, 3 * metrics.scale);
      ctx.fill();

      // Add energy border for powered-up companions
      if (companionPowerLevel > 0) {
        ctx.strokeStyle = `rgba(255, 255, 100, ${0.4 + prestige * 0.2})`;
        ctx.lineWidth = 2 * metrics.scale;
        roundRect(ctx, x, y, size, size, 3 * metrics.scale);
        ctx.stroke();
      }

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

  drawTextPopups(textPopups) {
    if (!textPopups?.length) return;
    const { ctx, metrics } = this;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    textPopups.forEach((popup) => {
      const x = metrics.offsetX + popup.x * metrics.scale;
      const y = metrics.topY + popup.y * metrics.scale;
      const fontSize = popup.size * metrics.scale;

      ctx.globalAlpha = popup.alpha;
      ctx.font = `bold ${fontSize}px monospace`;

      // Outline/shadow for readability
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6 * metrics.scale;
      ctx.lineWidth = 3 * metrics.scale;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(popup.text, x, y);

      // Fill with color
      ctx.shadowBlur = 12 * metrics.scale;
      ctx.shadowColor = popup.color;
      ctx.fillStyle = popup.color;
      ctx.fillText(popup.text, x, y);
    });

    ctx.restore();
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
