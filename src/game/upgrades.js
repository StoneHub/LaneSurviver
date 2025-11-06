export const UPGRADES = {
  damage: {
    name: 'Attack',
    desc: (l) => `+3 Damage (${5 + l * 3} -> ${5 + (l + 1) * 3})`,
    level: 0,
    apply: (player) => { player.damage += 3; },
  },
  fireRate: {
    name: 'Fire Rate',
    desc: () => '+25% Fire Rate (Big Boost!)',
    level: 0,
    apply: (player) => { player.fireCooldown *= 0.75; },
  },
  bulletCount: {
    name: 'Multishot',
    desc: (player) => `+1 Bullet (${player.bulletCount} -> ${player.bulletCount + 1})`,
    level: 0,
    apply: (player) => { player.bulletCount++; },
  },
  pierce: {
    name: 'Pierce',
    desc: (player) => `+1 Pierce (${player.pierce} -> ${player.pierce + 1})`,
    level: 0,
    apply: (player) => { player.pierce++; },
  },
  bulletSpeed: {
    name: 'Bullet Speed',
    desc: () => '+20% Faster',
    level: 0,
    apply: (player) => { player.projectileSpeed *= 1.2; },
  },
  autoAim: {
    name: 'Homing Bullets',
    desc: () => '+50% Better Tracking',
    level: 0,
    apply: (player) => { player.autoAimStrength *= 1.5; },
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
      upgrade.apply(this.state.player);
      upgrade.level++;
    }
  }
}
