import { GAME_CONFIG } from '../config.js';
import { randBetween } from './utils.js';

export class EnemySpawner {
  constructor(state) {
    this.state = state;
    this.spawnInterval = GAME_CONFIG.enemy.spawnInterval;
    this.burstSpawnTimer = 0;
    this.burstEnemiesRemaining = 0;
  }

  update(delta) {
    this.spawnInterval = Math.max(
      GAME_CONFIG.enemy.minSpawnInterval,
      this.spawnInterval * Math.pow(GAME_CONFIG.difficulty.rampFactor, delta / GAME_CONFIG.difficulty.rampInterval),
    );

    this.state.spawnTimer += delta;
    if (this.state.spawnTimer >= this.spawnInterval) {
      this.state.spawnTimer = 0;
      this.spawnEnemy();
    }

    this.state.burstTimer += delta;
    if (this.state.burstActiveTime > 0) {
      this.state.burstActiveTime = Math.max(0, this.state.burstActiveTime - delta);
    }

    if (this.burstEnemiesRemaining <= 0 && this.state.burstTimer >= GAME_CONFIG.enemy.burstInterval) {
      this.startBurst();
    }

    if (this.burstEnemiesRemaining > 0) {
      this.burstSpawnTimer += delta;
      const burstInterval = this.getBurstSpawnInterval();
      while (this.burstSpawnTimer >= burstInterval && this.burstEnemiesRemaining > 0) {
        this.burstSpawnTimer -= burstInterval;
        this.spawnCohort();
        this.burstEnemiesRemaining -= 1;
      }
    }
  }

  spawnEnemy() {
    if (this.state.enemies.length >= GAME_CONFIG.difficulty.maxEnemies) return;
    const lane = Math.floor(randBetween(0, GAME_CONFIG.lanes));
    const speed = Math.min(
      GAME_CONFIG.enemy.maxSpeed,
      GAME_CONFIG.enemy.baseSpeed * (1 + this.state.elapsed / 60000),
    );
    const sizeVariant = this.selectSizeVariant();
    const type = this.selectEnemyType();
    const velocity = randBetween(speed * 0.9, speed * 1.2) * (type.speedMultiplier || 1);
    const maxHealth = Math.ceil(sizeVariant.scale * type.healthMultiplier);

    this.state.enemies.push({
      lane,
      y: -GAME_CONFIG.enemy.height * sizeVariant.scale,
      speed: velocity,
      size: sizeVariant.scale,
      canMove: sizeVariant.canMove,
      moveSpeed: sizeVariant.moveSpeed,
      lateralOffset: 0,
      lateralDirection: Math.random() > 0.5 ? 1 : -1,
      lateralPhase: Math.random() * Math.PI * 2,
      type: type.id,
      typeData: type,
      health: maxHealth,
      maxHealth: maxHealth,
      shootCooldown: 0,
    });
  }

  startBurst() {
    this.state.burstTimer = 0;
    this.state.burstActiveTime = GAME_CONFIG.enemy.burstDuration;
    this.state.spawnBurstsTriggered += 1;

    const baseCount = GAME_CONFIG.enemy.burstSpawnCount;
    const growth = Math.ceil(this.state.spawnBurstsTriggered * GAME_CONFIG.enemy.burstMultiplier);
    this.burstEnemiesRemaining = baseCount + growth;
    this.burstSpawnTimer = 0;
  }

  getBurstSpawnInterval() {
    const baseline = Math.max(80, this.spawnInterval * 0.35);
    const acceleration = Math.max(0.25, 1 - this.state.spawnBurstsTriggered * 0.08);
    return baseline * acceleration;
  }

  spawnCohort() {
    const lanes = [...Array(GAME_CONFIG.lanes).keys()];
    shuffleInPlace(lanes);
    const perLane = Math.min(3, 1 + Math.floor(this.state.spawnBurstsTriggered / 2));
    const enemyHeight = GAME_CONFIG.enemy.height;
    const verticalSpacing = enemyHeight * 1.2;

    for (let laneIndex = 0; laneIndex < lanes.length; laneIndex += 1) {
      const lane = lanes[laneIndex];
      for (let i = 0; i < perLane; i += 1) {
        if (this.state.enemies.length >= GAME_CONFIG.difficulty.maxEnemies) {
          return;
        }
        const burstSpeedBoost = 1 + this.state.spawnBurstsTriggered * GAME_CONFIG.difficulty.burstRamp;
        const speed = Math.min(
          GAME_CONFIG.enemy.maxSpeed,
          GAME_CONFIG.enemy.baseSpeed * burstSpeedBoost,
        );
        const sizeVariant = this.selectSizeVariant();
        const type = this.selectEnemyType();
        const velocity = randBetween(speed * 0.95, speed * 1.3) * (type.speedMultiplier || 1);
        const maxHealth = Math.ceil(sizeVariant.scale * type.healthMultiplier);

        this.state.enemies.push({
          lane,
          y: -enemyHeight * sizeVariant.scale - i * verticalSpacing,
          speed: velocity,
          size: sizeVariant.scale,
          canMove: sizeVariant.canMove,
          moveSpeed: sizeVariant.moveSpeed,
          lateralOffset: 0,
          lateralDirection: Math.random() > 0.5 ? 1 : -1,
          lateralPhase: Math.random() * Math.PI * 2,
          type: type.id,
          typeData: type,
          health: maxHealth,
          maxHealth: maxHealth,
          shootCooldown: 0,
        });
      }
    }
  }

  selectSizeVariant() {
    const variants = GAME_CONFIG.enemy.sizeVariants;
    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    let random = Math.random() * totalWeight;

    for (const variant of variants) {
      random -= variant.weight;
      if (random <= 0) {
        return variant;
      }
    }

    return variants[0]; // Fallback
  }

  selectEnemyType() {
    const types = GAME_CONFIG.enemy.types;
    const totalWeight = types.reduce((sum, t) => sum + t.weight, 0);
    let random = Math.random() * totalWeight;

    for (const type of types) {
      random -= type.weight;
      if (random <= 0) {
        return type;
      }
    }

    return types[0]; // Fallback
  }
}

function shuffleInPlace(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
