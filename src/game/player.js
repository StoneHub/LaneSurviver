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

    // Determine target lanes
    const targetLanes = [lane];
    if (player.crossLaneEnabled && this.isLaneUnderPressure(lane)) {
      const range = player.crossLaneRange || 1;
      for (let offset = 1; offset <= range; offset++) {
        if (lane - offset >= 0) targetLanes.push(lane - offset);
        if (lane + offset < GAME_CONFIG.lanes) targetLanes.push(lane + offset);
      }
    }

    // Fire at each target lane
    targetLanes.forEach((targetLane) => {
      for (let i = 0; i < bulletCount; i += 1) {
        const offsetIndex = i - centerIndex;
        const offset = offsetIndex * spread;

        // Advanced targeting: use best target across all lanes if enabled
        const aimTargetLane = player.advancedTargeting
          ? this.findBestTargetLane(targetLane, muzzleY)
          : targetLane;

        this.state.projectiles.push({
          lane: targetLane,
          offset,
          y: muzzleY,
          speed: player.projectileSpeed,
          pierce: player.pierce ?? 0,
          hits: 0,
          aim: {
            targetLane: aimTargetLane,
            strength: player.autoAimStrength ?? 1,
            crossLane: player.advancedTargeting,
          },
        });
      }
    });

    player.cooldown = player.fireCooldown;
    return { lane, muzzleY };
  }

  isLaneUnderPressure(lane) {
    const pressureThreshold = GAME_CONFIG.playfieldHeight * 0.65; // Bottom 35% of screen
    let enemiesInDangerZone = 0;

    for (const enemy of this.state.enemies) {
      if (enemy.lane === lane && enemy.y >= pressureThreshold) {
        enemiesInDangerZone++;
      }
    }

    return enemiesInDangerZone >= 2;
  }

  findBestTargetLane(currentLane, projectileY) {
    // Find the lane with the closest enemy
    let bestLane = currentLane;
    let minDistance = Infinity;

    for (const enemy of this.state.enemies) {
      const distance = Math.abs(enemy.y - projectileY);
      if (distance < minDistance && enemy.y < projectileY) {
        minDistance = distance;
        bestLane = enemy.lane;
      }
    }

    return bestLane;
  }
}
