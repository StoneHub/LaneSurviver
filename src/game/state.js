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
      health: GAME_CONFIG.player.maxHealth,
      cooldown: 0,
      laneProgress: 0,
    };
    this.difficultyLevel = 1;
    this.score = 0;
    this.elapsed = 0;
    this.spawnTimer = 0;
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];
    this.lastSpawn = 0;
    this.isGameOver = false;
  }

  addScore(amount) {
    this.score = Math.max(0, this.score + amount);
  }

  damagePlayer(amount) {
    this.player.health = clamp(
      this.player.health - amount,
      0,
      GAME_CONFIG.player.maxHealth,
    );
    if (this.player.health <= 0) {
      this.isGameOver = true;
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
