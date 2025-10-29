export const POWER_UP_DEFS = [
  {
    id: 'rapid-fire',
    label: '⚡',
    title: 'Rapid Fire',
    description: 'Fire rate greatly increased.',
    color: '#ffe066',
    effects: {
      fireCooldownMultiplier: 0.82,
    },
  },
  {
    id: 'multishot',
    label: '☰',
    title: 'Multi-Shot',
    description: 'Adds another projectile per volley.',
    color: '#7dd3ff',
    effects: {
      bulletCountIncrease: 1,
    },
  },
  {
    id: 'pierce',
    label: '⇉',
    title: 'Pierce Rounds',
    description: 'Shots pierce through one extra enemy.',
    color: '#f472b6',
    effects: {
      pierceIncrease: 1,
    },
  },
  {
    id: 'velocity',
    label: '➤',
    title: 'Velocity Boost',
    description: 'Projectiles travel much faster.',
    color: '#60a5fa',
    effects: {
      projectileSpeedBonus: 140,
    },
  },
  {
    id: 'repair',
    label: '❤',
    title: 'Repair Kit',
    description: 'Restore one point of health.',
    color: '#f87171',
    effects: {
      heal: 1,
    },
  },
];
