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

    if (player.invulnerable && this.state.elapsed > player.invulnerableUntil) {
      player.invulnerable = false;
    }

    if (player.cooldown > 0) {
      player.cooldown -= delta;
    }
  }

  canFire() {
    return !this.state.isGameOver && this.state.player.cooldown <= 0;
  }

  fire() {
    if (!this.canFire()) return null;
    const player = this.state.player;
    const { lane } = player;
    const muzzleY = Math.max(
      0,
      player.y - GAME_CONFIG.projectile.height - 6,
    );

    const bulletCount = Math.max(1, player.bulletCount | 0);
    const spread = player.spread ?? 0;
    const centerIndex = (bulletCount - 1) / 2;

    for (let i = 0; i < bulletCount; i += 1) {
      const offsetIndex = i - centerIndex;
      const offset = offsetIndex * spread;

      this.state.projectiles.push({
        lane,
        offset,
        y: muzzleY,
        speed: player.projectileSpeed,
        pierce: player.pierce ?? 0,
        hits: 0,
        aim: {
          targetLane: lane,
          strength: player.autoAimStrength ?? 1,
        },
      });
    }

    let cooldown = player.fireCooldown;
    if (this.state.combo?.isBoostActive) {
      cooldown *= GAME_CONFIG.combo.fireRateBoost;
    }
    player.cooldown = cooldown;
    return { lane, muzzleY };
  }
}
