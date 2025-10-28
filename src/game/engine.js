import { GAME_CONFIG } from '../config.js';

const PLAYFIELD_HEIGHT = GAME_CONFIG.playfieldHeight;

export class GameEngine {
  constructor({ state, player, spawner, renderer, onTick }) {
    this.state = state;
    this.player = player;
    this.spawner = spawner;
    this.renderer = renderer;
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
    if (this.state.isGameOver) {
      return;
    }

    this.state.elapsed += delta;

    this.player.update(delta);
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
        this.state.damagePlayer(GAME_CONFIG.damage.onLeak);
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
          this.state.projectiles.splice(j, 1);
          this.state.addScore(GAME_CONFIG.difficulty.scorePerEnemy);
          break;
        }
      }
    }
  }

  render() {
    const { renderer, state } = this;
    renderer.clear();
    renderer.drawLanes();
    renderer.drawEnemies(state.enemies);
    renderer.drawProjectiles(state.projectiles);
    renderer.drawPlayer(state.player);
  }
}
