import { GAME_CONFIG } from '../config.js';
import { clamp } from './utils.js';

export class Player {
  constructor(state) {
    this.state = state;
  }

  move(direction) {
    if (this.state.isGameOver) return;
    const next = clamp(
      this.state.player.targetLane + direction,
      0,
      GAME_CONFIG.lanes - 1,
    );
    this.state.player.targetLane = next;
  }

  update(delta) {
    const player = this.state.player;
    if (player.lane !== player.targetLane) {
      const direction = Math.sign(player.targetLane - player.lane);
      player.laneProgress += (delta / GAME_CONFIG.player.moveDuration) * direction;
      if (Math.abs(player.laneProgress) >= 1) {
        player.lane += direction;
        player.laneProgress = 0;
      }
    } else {
      player.laneProgress = 0;
    }

    if (player.cooldown > 0) {
      player.cooldown -= delta;
    }
  }

  canFire() {
    return !this.state.isGameOver && this.state.player.cooldown <= 0;
  }

  fire() {
    if (!this.canFire()) return false;
    const { lane } = this.state.player;
    const muzzleY = Math.max(
      0,
      this.state.player.y - GAME_CONFIG.projectile.height - 6,
    );
    this.state.projectiles.push({
      lane,
      y: muzzleY,
      speed: GAME_CONFIG.player.projectileSpeed,
    });
    this.state.player.cooldown = GAME_CONFIG.player.fireCooldown;
    return true;
  }
}
