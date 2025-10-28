import { GAME_CONFIG } from '../config.js';

export class Renderer {
  constructor(context, canvasMetrics) {
    this.ctx = context;
    this.metrics = canvasMetrics;
  }

  setMetrics(metrics) {
    this.metrics = metrics;
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
  }

  drawProjectiles(projectiles) {
    const { ctx, metrics } = this;
    ctx.fillStyle = '#ffe566';
    projectiles.forEach((projectile) => {
      const width = GAME_CONFIG.projectile.width * metrics.scale;
      const height = GAME_CONFIG.projectile.height * metrics.scale;
      const x =
        metrics.offsetX + metrics.laneCenter(projectile.lane) * metrics.scale - width / 2;
      const y = metrics.topY + projectile.y * metrics.scale;
      ctx.fillRect(x, y, width, height);
    });
  }

  drawEnemies(enemies) {
    const { ctx, metrics } = this;
    ctx.fillStyle = '#ff4f6d';
    enemies.forEach((enemy) => {
      const width = GAME_CONFIG.enemy.width * metrics.scale;
      const height = GAME_CONFIG.enemy.height * metrics.scale;
      const x =
        metrics.offsetX + metrics.laneCenter(enemy.lane) * metrics.scale - width / 2;
      const y = metrics.topY + enemy.y * metrics.scale;
      roundRect(ctx, x, y, width, height, 8 * metrics.scale);
      ctx.fill();
    });
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
