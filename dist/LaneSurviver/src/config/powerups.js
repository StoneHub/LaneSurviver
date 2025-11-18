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
  // TODO: Add rarity system for these special powerups
  // IDEA: Make special powerups glow or pulse to indicate they're rare
  {
    id: 'lane-nuke',
    label: '💥',
    title: 'Lane Clearer',
    description: 'Press Q to clear all enemies in your current lane!',
    color: '#fbbf24',
    rarity: 'rare',
    effects: {
      activatable: true,
      type: 'lane-clear',
      charges: 1,
    },
  },
  {
    id: 'trail-blazer',
    label: '🔥',
    title: 'Trail Blazer',
    description: 'Leave a damaging trail when moving between lanes!',
    color: '#f97316',
    rarity: 'rare',
    effects: {
      activatable: true,
      type: 'damage-trail',
      duration: 8000, // 8 seconds
    },
  },
  {
    id: 'side-blast',
    label: '⚡',
    title: 'Side Blast',
    description: 'Press E to blast adjacent lanes!',
    color: '#8b5cf6',
    rarity: 'rare',
    effects: {
      activatable: true,
      type: 'side-blast',
      charges: 2,
    },
  },
];

// TODO: Add activation key bindings display in HUD
