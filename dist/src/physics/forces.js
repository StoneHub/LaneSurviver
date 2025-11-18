const DEFAULT_SHAKE_DURATION = 180; // ms
const DEFAULT_SHAKE_MAGNITUDE = 6; // world units

export class ForceField {
  constructor() {
    this.shake = {
      timeRemaining: 0,
      totalDuration: DEFAULT_SHAKE_DURATION,
      magnitude: DEFAULT_SHAKE_MAGNITUDE,
    };
    this.offset = { x: 0, y: 0 };
  }

  /**
   * Applies a camera shake impulse.
   * @param {object} options
   * @param {number} [options.magnitude] - Maximum displacement in world units.
   * @param {number} [options.duration] - Duration in ms for the shake to settle.
   */
  addShake({ magnitude = DEFAULT_SHAKE_MAGNITUDE, duration = DEFAULT_SHAKE_DURATION } = {}) {
    this.shake.magnitude = Math.max(this.shake.magnitude, magnitude);
    this.shake.totalDuration = Math.max(this.shake.totalDuration, duration);
    this.shake.timeRemaining = Math.max(this.shake.timeRemaining, duration);
  }

  update(delta) {
    if (this.shake.timeRemaining <= 0) {
      this.offset.x = 0;
      this.offset.y = 0;
      return;
    }

    this.shake.timeRemaining = Math.max(0, this.shake.timeRemaining - delta);
    const progress = this.shake.timeRemaining / this.shake.totalDuration;
    const damping = progress * progress;
    const magnitude = this.shake.magnitude * damping;

    // Pseudo-random jitter with diminishing amplitude.
    this.offset.x = (Math.random() * 2 - 1) * magnitude;
    this.offset.y = (Math.random() * 2 - 1) * magnitude;
  }

  getOffset() {
    return this.offset;
  }

  reset() {
    this.shake.timeRemaining = 0;
    this.offset.x = 0;
    this.offset.y = 0;
  }
}
