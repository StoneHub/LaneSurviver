import { GAME_CONFIG } from '../config.js';

const PLAYFIELD_HEIGHT = GAME_CONFIG.playfieldHeight;
const laneCenter = (lane, offset = 0) =>
  GAME_CONFIG.canvasPadding +
  (lane + 0.5 + offset) * GAME_CONFIG.laneWidth;

export class GameEngine {
  constructor({
    state,
    player,
    spawner,
    renderer,
    particles,
    forces,
    powerUps,
    autoFire = false,
    onFire = null,
    onTick,
  }) {
    this.state = state;
    this.player = player;
    this.spawner = spawner;
    this.renderer = renderer;
    this.particles = particles;
    this.forces = forces;
    this.powerUps = powerUps;
    this.autoFire = autoFire;
    this.onFire = onFire;
    this.onTick = onTick;
    this.isRunning = false;
    this.lastTime = 0;
    this.requestId = null;
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }

  loop(timestamp) {
    if (!this.isRunning) return;
    const delta = Math.min(32, timestamp - this.lastTime);
    this.lastTime = timestamp;

    this.update(delta);
    this.render();

    if (this.onTick) {
      this.onTick(this.state);
    }

    this.requestId = requestAnimationFrame((next) => this.loop(next));
  }

  update(delta) {
    if (this.particles) {
      this.particles.update(delta);
    }
    if (this.forces) {
      this.forces.update(delta);
    }
    if (this.powerUps) {
      this.powerUps.update(delta);
    }

    if (this.state.isGameOver) {
      return;
    }

    this.state.elapsed += delta;

    this.player.update(delta);
    if (this.autoFire && this.player.canFire()) {
      if (typeof this.onFire === 'function') {
        this.onFire();
      } else {
        this.player.fire();
      }
    }
    this.spawner.update(delta);
    this.updateProjectiles(delta);
    this.updateEnemies(delta);

    this.state.addScore((GAME_CONFIG.difficulty.scorePerSecond * delta) / 1000);
  }

  updateProjectiles(delta) {
    const seconds = delta / 1000;
    const projectileHeight = GAME_CONFIG.projectile.height;
    for (let i = this.state.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.state.projectiles[i];
      this.applyAutoAim(projectile, seconds);
      projectile.y -= projectile.speed * seconds;
      if (projectile.y + projectileHeight < -GAME_CONFIG.canvasPadding) {
        this.state.projectiles.splice(i, 1);
      }
    }
  }

  updateEnemies(delta) {
    const seconds = delta / 1000;
    const projectileHeight = GAME_CONFIG.projectile.height;
    const enemyHeight = GAME_CONFIG.enemy.height;

    for (let i = this.state.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = this.state.enemies[i];
      enemy.y += enemy.speed * seconds;

      if (enemy.y >= PLAYFIELD_HEIGHT - enemyHeight) {
        this.state.enemies.splice(i, 1);
        this.spawnLeakEffect(enemy.lane, enemy.y);
        this.state.damagePlayer(GAME_CONFIG.damage.onLeak, {
          cause: 'leak',
          lane: enemy.lane,
          elapsed: this.state.elapsed,
          meta: {
            enemySpeed: enemy.speed,
            burstActive: this.state.burstActiveTime > 0,
          },
        });
        continue;
      }

      for (let j = this.state.projectiles.length - 1; j >= 0; j -= 1) {
        const projectile = this.state.projectiles[j];
        if (projectile.lane !== enemy.lane) continue;
        const enemyTop = enemy.y;
        const enemyBottom = enemy.y + enemyHeight;
        const projectileTop = projectile.y;
        const projectileBottom = projectile.y + projectileHeight;
        const overlap = enemyBottom >= projectileTop && projectileBottom >= enemyTop;
        if (overlap) {
          this.state.enemies.splice(i, 1);
          this.state.addScore(GAME_CONFIG.difficulty.scorePerEnemy);
          this.spawnEnemyDestroyedEffect(enemy.lane, enemy.y + enemyHeight / 2);
          if (this.powerUps) {
            this.powerUps.maybeDrop({ lane: enemy.lane, y: enemy.y + enemyHeight / 2 });
          }
          const nextHitCount = (projectile.hits ?? 0) + 1;
          const pierce = projectile.pierce ?? 0;
          if (nextHitCount > pierce) {
            this.state.projectiles.splice(j, 1);
          } else {
            projectile.hits = nextHitCount;
          }
          break;
        }
      }
    }
  }

  render() {
    const { renderer, state, particles, forces } = this;
    const viewOffset = forces ? forces.getOffset() : { x: 0, y: 0 };
    renderer.beginFrame(viewOffset);
    renderer.drawLanes();
    renderer.drawEnemies(state.enemies);
    if (renderer.drawPowerUps) {
      renderer.drawPowerUps(state.powerUps);
    }
    renderer.drawProjectiles(state.projectiles);
    renderer.drawPlayer(state.player);
    if (particles) {
      renderer.drawParticles(particles.getParticles());
    }
    renderer.endFrame();
  }

  spawnEnemyDestroyedEffect(lane, impactY) {
    if (!this.particles) return;
    this.particles.emitBurst({
      x: laneCenter(lane),
      y: Math.max(0, impactY),
      count: 14,
      palette: ['#ff4f6d', '#ffd1dc', '#ff7b93'],
      speed: [150, 260],
      life: [220, 360],
      size: [2.2, 4.8],
      gravity: 300,
      drag: 0.88,
      blend: 'lighter',
      fadePower: 1.4,
    });
    if (this.forces) {
      this.forces.addShake({ magnitude: 6, duration: 180 });
    }
  }

  spawnLeakEffect(lane, impactY) {
    if (!this.particles) return;
    this.particles.emitBurst({
      x: laneCenter(lane),
      y: Math.min(PLAYFIELD_HEIGHT, Math.max(0, impactY)),
      count: 18,
      palette: ['#f060d0', '#ff96e6', '#ffffff'],
      speed: [120, 240],
      life: [240, 420],
      size: [2.5, 5.5],
      gravity: 360,
      drag: 0.86,
      blend: 'lighter',
      fadePower: 1.6,
    });
    if (this.forces) {
      this.forces.addShake({ magnitude: 8, duration: 240 });
    }
  }

  applyAutoAim(projectile, seconds) {
    if (!projectile.aim) return;
    const turnRate = GAME_CONFIG.projectile.autoAimTurnRate;
    const strength = projectile.aim.strength ?? 1;
    const currentOffset = projectile.offset ?? 0;
    const targetOffset = this.findNearestEnemyOffset(projectile.lane, projectile.y);
    const deltaOffset = targetOffset - currentOffset;
    const maxAdjust = turnRate * strength * seconds;
    const clampedAdjust = Math.max(Math.min(deltaOffset, maxAdjust), -maxAdjust);
    projectile.offset = currentOffset + clampedAdjust;
  }

  findNearestEnemyOffset(lane, projectileY) {
    let closestOffset = 0;
    let nearestDistance = Infinity;
    for (let i = 0; i < this.state.enemies.length; i += 1) {
      const enemy = this.state.enemies[i];
      if (enemy.lane !== lane) continue;
      const distance = Math.abs(enemy.y - projectileY);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        closestOffset = 0;
      }
    }
    return closestOffset;
  }
}
