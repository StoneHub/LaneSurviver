import { GAME_CONFIG } from '../config.js';

export class XPManager {
  constructor(state) {
    this.state = state;
  }

  spawnXP(x, y) {
    this.state.xpOrbs.push({ x, y, size: 8, vy: 0 });
  }

  update(delta) {
    for (let i = this.state.xpOrbs.length - 1; i >= 0; i--) {
      const orb = this.state.xpOrbs[i];
      orb.vy += 0.15;
      orb.y += orb.vy;

      const playerX = this.state.player.lane * GAME_CONFIG.laneWidth + GAME_CONFIG.laneWidth / 2;
      const dx = playerX - orb.x;
      const dy = this.state.player.y - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 150) {
        orb.x += (dx / dist) * 8;
        orb.y += (dy / dist) * 8;
      }

      if (dist < 40) {
        this.state.player.xp++;
        this.state.xpOrbs.splice(i, 1);

        if (this.state.player.xp >= this.state.player.xpToNext) {
          if (this.levelUp()) {
            return true;
          }
        }
        continue;
      }

      if (orb.y > GAME_CONFIG.playfieldHeight + 50) {
        this.state.xpOrbs.splice(i, 1);
      }
    }
  }

  levelUp() {
    this.state.player.xp -= this.state.player.xpToNext;
    this.state.player.level++;
    this.state.player.xpToNext = Math.floor(this.state.player.xpToNext * 1.5);
    return true;
  }
}
