import { randBetween } from '../game/utils.js';

const DEFAULT_MAX_PARTICLES = 600;

const toRange = (value, fallback) => {
  if (Array.isArray(value)) return value;
  return [value ?? fallback[0], value ?? fallback[1]];
};

const lerp = (a, b, t) => a + (b - a) * t;

export class ParticleSystem {
  constructor({ maxParticles = DEFAULT_MAX_PARTICLES } = {}) {
    this.maxParticles = maxParticles;
    this.particles = [];
  }

  update(delta) {
    if (!this.particles.length) return;

    const dt = delta / 1000;
    for (let i = this.particles.length - 1; i >= 0; i -= 1) {
      const particle = this.particles[i];
      particle.life -= delta;
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      const drag = Math.pow(particle.drag, dt * 60);
      particle.vx *= drag;
      particle.vy *= drag;
      particle.vy += particle.gravity * dt;

      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      const lifeRatio = particle.life / particle.maxLife;
      particle.alpha = lifeRatio ** particle.fadePower;
      particle.size = lerp(particle.sizeEnd, particle.sizeStart, lifeRatio);
    }
  }

  emitBurst(options) {
    const {
      x,
      y,
      count = 12,
      palette,
      color = '#ffffff',
      speed = [120, 220],
      angle = null,
      spread = Math.PI * 2,
      life = [240, 420],
      size = [2, 4],
      gravity = 0,
      drag = 0.9,
      blend = 'lighter',
      fadePower = 1.5,
    } = options;

    if (x === undefined || y === undefined) {
      throw new Error('Particle burst requires x and y coordinates.');
    }

    const speedRange = toRange(speed, [120, 220]);
    const lifeRange = toRange(life, [200, 360]);
    const sizeRange = toRange(size, [2, 4]);
    const paletteColors = Array.isArray(palette) && palette.length ? palette : [color];

    for (let i = 0; i < count; i += 1) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }

      const theta =
        angle === null
          ? Math.random() * Math.PI * 2
          : angle - spread / 2 + Math.random() * spread;
      const magnitude = randBetween(speedRange[0], speedRange[1]);
      const lifeMs = randBetween(lifeRange[0], lifeRange[1]);
      const startSize = randBetween(sizeRange[0], sizeRange[1]);
      const endSize = startSize * 0.35;

      this.particles.push({
        x,
        y,
        vx: Math.cos(theta) * magnitude,
        vy: Math.sin(theta) * magnitude,
        gravity,
        drag: Math.min(Math.max(drag, 0.5), 0.99),
        life: lifeMs,
        maxLife: lifeMs,
        sizeStart: startSize,
        sizeEnd: endSize,
        size: startSize,
        color: paletteColors[Math.floor(Math.random() * paletteColors.length)],
        blend: blend === 'additive' ? 'lighter' : blend,
        alpha: 1,
        fadePower,
      });
    }
  }

  getParticles() {
    return this.particles;
  }

  clear() {
    this.particles.length = 0;
  }
}
