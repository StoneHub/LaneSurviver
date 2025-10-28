import { GAME_CONFIG } from '../config.js';
import { randBetween } from './utils.js';

export class EnemySpawner {
  constructor(state) {
    this.state = state;
    this.spawnInterval = GAME_CONFIG.enemy.spawnInterval;
  }

  update(delta) {
    this.spawnInterval = Math.max(
      GAME_CONFIG.enemy.minSpawnInterval,
      this.spawnInterval * Math.pow(GAME_CONFIG.difficulty.rampFactor, delta / GAME_CONFIG.difficulty.rampInterval),
    );

    this.state.spawnTimer += delta;
    if (this.state.spawnTimer >= this.spawnInterval) {
      this.state.spawnTimer = 0;
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    const lane = Math.floor(randBetween(0, GAME_CONFIG.lanes));
    const speed = Math.min(
      GAME_CONFIG.enemy.maxSpeed,
      GAME_CONFIG.enemy.baseSpeed * (1 + this.state.elapsed / 60000),
    );
    const velocity = randBetween(speed * 0.9, speed * 1.2);
    this.state.enemies.push({
      lane,
      y: -GAME_CONFIG.enemy.height,
      speed: velocity,
    });
  }
}
