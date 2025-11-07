export const UPGRADES = {
  damage: {
    name: 'Attack',
    desc: (player, l) => {
      const prestige = Math.floor(l / 3);
      const baseIncrease = 3 + prestige * 2;
      return l % 3 === 2
        ? `+${baseIncrease} Damage [PRESTIGE READY]`
        : `+${baseIncrease} Damage`;
    },
    level: 0,
    prestige: 0,
    apply: (player) => {
      const prestige = Math.floor(this.level / 3);
      player.damage += 3 + prestige * 2;
    },
  },
  fireRate: {
    name: 'Fire Rate',
    desc: (player, l) => {
      const prestige = Math.floor(l / 3);
      const multiplier = 0.75 - prestige * 0.05;
      return l % 3 === 2
        ? `+${Math.round((1 - multiplier) * 100)}% Fire Rate [PRESTIGE READY]`
        : `+${Math.round((1 - multiplier) * 100)}% Fire Rate`;
    },
    level: 0,
    prestige: 0,
    apply: (player) => {
      const prestige = Math.floor(this.level / 3);
      player.fireCooldown *= 0.75 - prestige * 0.05;
    },
  },
  bulletCount: {
    name: 'Multishot',
    desc: (player, l) => {
      return l % 3 === 2
        ? `+1 Bullet (${player.bulletCount} -> ${player.bulletCount + 1}) [PRESTIGE READY]`
        : `+1 Bullet (${player.bulletCount} -> ${player.bulletCount + 1})`;
    },
    level: 0,
    prestige: 0,
    apply: (player) => { player.bulletCount++; },
  },
  pierce: {
    name: 'Pierce',
    desc: (player, l) => {
      return l % 3 === 2
        ? `+1 Pierce (${player.pierce} -> ${player.pierce + 1}) [PRESTIGE READY]`
        : `+1 Pierce (${player.pierce} -> ${player.pierce + 1})`;
    },
    level: 0,
    prestige: 0,
    apply: (player) => { player.pierce++; },
  },
  bulletSpeed: {
    name: 'Bullet Speed',
    desc: (player, l) => {
      const prestige = Math.floor(l / 3);
      const multiplier = 1.2 + prestige * 0.1;
      return l % 3 === 2
        ? `+${Math.round((multiplier - 1) * 100)}% Faster [PRESTIGE READY]`
        : `+${Math.round((multiplier - 1) * 100)}% Faster`;
    },
    level: 0,
    prestige: 0,
    apply: (player) => {
      const prestige = Math.floor(this.level / 3);
      player.projectileSpeed *= 1.2 + prestige * 0.1;
    },
  },
  autoAim: {
    name: 'Homing Bullets',
    desc: (player, l) => {
      const prestige = Math.floor(l / 3);
      const multiplier = 1.5 + prestige * 0.2;
      return l % 3 === 2
        ? `+${Math.round((multiplier - 1) * 100)}% Tracking [PRESTIGE READY]`
        : `+${Math.round((multiplier - 1) * 100)}% Tracking`;
    },
    level: 0,
    prestige: 0,
    apply: (player) => {
      const prestige = Math.floor(this.level / 3);
      player.autoAimStrength *= 1.5 + prestige * 0.2;
    },
  },
  companion: {
    name: 'Flanking Support',
    desc: (player) => {
      const count = player.companionCount || 0;
      return count === 0
        ? 'Spawn 2 friendly shooters to flank you'
        : `Add 2 more companions (${count} -> ${count + 2})`;
    },
    level: 0,
    max: 3,
    apply: (player) => {
      player.companionCount = (player.companionCount || 0) + 2;
    },
  },
  companionPower: {
    name: 'Companion Firepower',
    desc: () => 'Companions shoot 50% faster and deal more damage',
    level: 0,
    max: 2,
    canSelect: (player) => (player.companionCount || 0) > 0,
    apply: (player) => {
      player.companionPower = (player.companionPower || 1) + 0.5;
    },
  },
};

export class UpgradeManager {
  constructor(state) {
    this.state = state;
    this.upgrades = UPGRADES;
  }

  getUpgradeOptions() {
    const available = Object.keys(this.upgrades).filter(k => {
      const u = this.upgrades[k];
      const notMaxed = !u.max || u.level < u.max;
      const canSelect = !u.canSelect || u.canSelect(this.state.player);
      return notMaxed && canSelect;
    });

    const selected = [];
    for (let i = 0; i < 3 && available.length > 0; i++) {
      const idx = Math.floor(Math.random() * available.length);
      selected.push(available[idx]);
      available.splice(idx, 1);
    }

    return selected.map(key => ({
      key,
      ...this.upgrades[key],
    }));
  }

  applyUpgrade(key) {
    const upgrade = this.upgrades[key];
    if (upgrade) {
      upgrade.apply.call(upgrade, this.state.player);
      upgrade.level++;

      // Track upgrade in player state for visual representation
      if (this.state.player.upgrades) {
        this.state.player.upgrades[key] = upgrade.level;
      }

      // Check for prestige (every 3 levels)
      if (upgrade.level > 0 && upgrade.level % 3 === 0) {
        upgrade.prestige = (upgrade.prestige || 0) + 1;
        // Spawn special prestige notification
        if (this.state.spawnTextPopup) {
          const player = this.state.player;
          const laneCenter = (lane, offset = 0) =>
            16 + (lane + 0.5 + offset) * 120;
          const playerX = laneCenter(player.lane, player.laneProgress ?? 0);
          this.state.spawnTextPopup(
            '★ PRESTIGE ★',
            playerX,
            player.y - 50,
            '#ffd700',
            24
          );
        }
      }
    }
  }
}
