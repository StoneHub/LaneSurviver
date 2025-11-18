import { GAME_CONFIG } from '../config.js';

const PLAYFIELD_HEIGHT = GAME_CONFIG.playfieldHeight;
const laneCenter = (lane, offset = 0) =>
  GAME_CONFIG.canvasPadding +
  (lane + 0.5 + offset) * GAME_CONFIG.laneWidth;

export class GameEngine {
  constructor({
    state,
    player,
    spawner,
    renderer,
    particles,
    forces,
    powerUps,
    xpManager,
    upgradeManager,
    upgradeModal,
    abilityManager,
    autoFire = false,
    onFire = null,
    onTick,
    onGameOver = null,
  }) {
    this.state = state;
    this.player = player;
    this.spawner = spawner;
    this.renderer = renderer;
    this.particles = particles;
    this.forces = forces;
    this.powerUps = powerUps;
    this.xpManager = xpManager;
    this.upgradeManager = upgradeManager;
    this.upgradeModal = upgradeModal;
    this.abilityManager = abilityManager;
    this.autoFire = autoFire;
    this.onFire = onFire;
    this.onTick = onTick;
    this.onGameOver = onGameOver;
    this.isRunning = false;
    this.lastTime = 0;
    this.requestId = null;
    this.gameOverTriggered = false;
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }

  loop(timestamp) {
    if (!this.isRunning) return;
    const delta = Math.min(32, timestamp - this.lastTime);
    this.lastTime = timestamp;

    this.update(delta);
    this.render();

    if (this.onTick) {
      this.onTick(this.state);
    }

    this.requestId = requestAnimationFrame((next) => this.loop(next));
  }

  showUpgradeModal() {
    this.stop();
    const options = this.upgradeManager.getUpgradeOptions();
    this.upgradeModal.setPlayerState(this.state.player);
    this.upgradeModal.show(options);
  }

  applyUpgrade(key) {
    this.upgradeManager.applyUpgrade(key);
    this.start();
  }

  update(delta) {
    if (this.particles) {
      this.particles.update(delta);
    }
    if (this.forces) {
      this.forces.update(delta);
    }
    if (this.powerUps) {
      this.powerUps.update(delta);
    }
    if (this.abilityManager) {
      this.abilityManager.update(delta);
    }
    if (this.xpManager) {
      if (this.xpManager.update(delta)) {
        this.showUpgradeModal();
      }
    }

    if (this.state.isGameOver) {
      // Trigger game over callback once
      if (!this.gameOverTriggered && this.onGameOver) {
        this.gameOverTriggered = true;
        this.onGameOver(this.state);
      }
      return;
    }

    this.state.elapsed += delta;

    this.player.update(delta);
    if (this.autoFire && this.player.canFire()) {
      if (typeof this.onFire === 'function') {
        this.onFire();
      } else {
        this.player.fire();
      }
    }
    this.spawner.update(delta);
    this.updateCompanions(delta);
    this.updateProjectiles(delta);
    this.updateEnemies(delta);
    this.updateEnemyProjectiles(delta);
    this.updateTextPopups(delta);

    this.updateTextPopups(delta);

    // Calculate DPS (damage over last 1 second)
    const now = this.state.elapsed;
    const oneSecondAgo = now - 1000;
    // Filter out old entries
    this.state.damageDealt = this.state.damageDealt.filter(d => d.time > oneSecondAgo);
    // Sum damage
    this.state.dps = this.state.damageDealt.reduce((sum, d) => sum + d.amount, 0);

    this.state.addScore((GAME_CONFIG.difficulty.scorePerSecond * delta) / 1000);

    // Combo Logic
    if (this.state.combo.count > 0) {
      this.state.combo.timer -= delta;
      if (this.state.combo.timer <= 0) {
        this.state.combo.count = 0;
        this.state.combo.isBoostActive = false;
      }
    }

    // Player Trail
    if (this.particles && (this.player.targetLane !== this.player.lane || this.state.combo.isBoostActive)) {
      // Emit trail more frequently if moving or boosted
      if (Math.random() < 0.3) {
        const playerX = laneCenter(this.player.lane, this.player.laneProgress);
        this.particles.emitBurst({
          x: playerX,
          y: this.player.y + 20,
          ...GAME_CONFIG.effects.playerTrail,
        });
      }
    }
  }

  updateTextPopups(delta) {
    const seconds = delta / 1000;
    for (let i = this.state.textPopups.length - 1; i >= 0; i -= 1) {
      const popup = this.state.textPopups[i];
      popup.life += delta;
      popup.x += popup.vx * seconds;
      popup.y += popup.vy * seconds;
      popup.vy += 200 * seconds; // Gravity
      popup.alpha = 1 - (popup.life / popup.maxLife);

      if (popup.life >= popup.maxLife) {
        this.state.textPopups.splice(i, 1);
      }
    }
  }

  updateCompanions(delta) {
    const seconds = delta / 1000;
    const player = this.state.player;
    const companionCount = player.companionCount || 0;
    const companionPower = player.companionPower || 1;

    // Sync companion count
    while (this.state.companions.length < companionCount) {
      this.state.companions.push({
        angle: (this.state.companions.length / companionCount) * Math.PI * 2,
        cooldown: Math.random() * 500,
      });
    }
    while (this.state.companions.length > companionCount) {
      this.state.companions.pop();
    }

    // Update companions
    const playerX = laneCenter(player.lane, player.laneProgress ?? 0);
    const playerY = player.y;
    const orbitRadius = 60;
    const rotationSpeed = 1.2;

    this.state.companions.forEach((companion) => {
      companion.angle += rotationSpeed * seconds;
      companion.x = playerX + Math.cos(companion.angle) * orbitRadius;
      companion.y = playerY + Math.sin(companion.angle) * orbitRadius;
      companion.cooldown -= delta;

      // Companion shooting
      if (companion.cooldown <= 0) {
        const target = this.findNearestEnemyAny(companion.x, companion.y);
        if (target) {
          const enemyX = laneCenter(target.lane, target.lateralOffset || 0);
          const dx = enemyX - companion.x;
          const dy = target.y - companion.y;
          const angle = Math.atan2(dy, dx);

          this.state.projectiles.push({
            lane: target.lane,
            offset: 0,
            x: companion.x,
            y: companion.y,
            vx: Math.cos(angle) * 600,
            vy: Math.sin(angle) * 600,
            speed: 0, // Using vx/vy instead
            width: 6,
            height: 16,
            pierce: 0,
            hits: 0,
            isCompanion: true,
            aim: null,
          });

          companion.cooldown = 400 / companionPower;
        }
      }
    });
  }

  updateProjectiles(delta) {
    const seconds = delta / 1000;
    const projectileHeight = GAME_CONFIG.projectile.height;
    for (let i = this.state.projectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.state.projectiles[i];

      if (projectile.isCompanion) {
        // Companion projectiles use vx/vy
        projectile.x += (projectile.vx || 0) * seconds;
        projectile.y += (projectile.vy || 0) * seconds;
        if (projectile.y < -GAME_CONFIG.canvasPadding || projectile.y > GAME_CONFIG.playfieldHeight) {
          this.state.projectiles.splice(i, 1);
        }
      } else {
        // Player projectiles
        this.applyAutoAim(projectile, seconds);
        projectile.y -= projectile.speed * seconds;
        if (projectile.y + projectileHeight < -GAME_CONFIG.canvasPadding) {
          this.state.projectiles.splice(i, 1);
        }
      }
    }
  }

  updateEnemies(delta) {
    const seconds = delta / 1000;
    const projectileHeight = GAME_CONFIG.projectile.height;
    const enemyHeight = GAME_CONFIG.enemy.height;

    for (let i = this.state.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = this.state.enemies[i];
      enemy.y += enemy.speed * seconds;

      // Lateral movement for small enemies
      if (enemy.canMove && enemy.moveSpeed > 0) {
        enemy.lateralPhase += seconds * 1.5;
        const maxOffset = GAME_CONFIG.enemy.lateralMoveRange;
        const targetOffset = Math.sin(enemy.lateralPhase) * maxOffset * enemy.lateralDirection;
        // Smooth approach to target
        enemy.lateralOffset += (targetOffset - enemy.lateralOffset) * seconds * 3;
      }

      // Enemy shooting
      if (enemy.typeData?.canShoot) {
        enemy.shootCooldown -= delta;
        if (enemy.shootCooldown <= 0 && Math.random() < (enemy.typeData.shootChance || 0.3)) {
          this.enemyShoot(enemy);
          enemy.shootCooldown = enemy.typeData.shootCooldown || 2000;
        }
      }

      const playerX = laneCenter(this.state.player.lane, this.state.player.laneProgress);
      const enemyX = laneCenter(enemy.lane, enemy.lateralOffset || 0);
      const enemySize = enemy.size || 1;
      const enemyWidth = GAME_CONFIG.enemy.width * enemySize;
      const enemyActualHeight = GAME_CONFIG.enemy.height * enemySize;

      if (Math.abs(enemy.y - this.state.player.y) < (GAME_CONFIG.player.height + enemyActualHeight) / 2 &&
        Math.abs(enemyX - playerX) < (GAME_CONFIG.player.width + enemyWidth) / 2) {
        this.state.damagePlayer(GAME_CONFIG.damage.onHit, {
          cause: 'collision',
          lane: enemy.lane,
          elapsed: this.state.elapsed,
        });
        this.spawnShieldBreakEffect(playerX, playerY);
        this.state.enemies.splice(i, 1);
        continue;
      }

      if (enemy.y >= PLAYFIELD_HEIGHT - enemyActualHeight) {
        this.state.enemies.splice(i, 1);
        this.spawnLeakEffect(enemy.lane, enemy.y, enemy.lateralOffset || 0);
        this.state.damagePlayer(GAME_CONFIG.damage.onLeak, {
          cause: 'leak',
          lane: enemy.lane,
          elapsed: this.state.elapsed,
          meta: {
            enemySpeed: enemy.speed,
            burstActive: this.state.burstActiveTime > 0,
          },
        });
        this.spawnShieldBreakEffect(laneCenter(enemy.lane), PLAYFIELD_HEIGHT);
        this.state.enemiesPassed++; // Track passed enemies
        continue;
      }

      for (let j = this.state.projectiles.length - 1; j >= 0; j -= 1) {
        const projectile = this.state.projectiles[j];

        // Calculate actual positions for collision detection
        const projectileX = projectile.isCompanion
          ? projectile.x
          : laneCenter(projectile.lane, projectile.offset || 0);
        const projectileWidth = projectile.width || GAME_CONFIG.projectile.width;
        const projectileActualHeight = projectile.height || projectileHeight;

        // Check both vertical and horizontal overlap
        const enemyTop = enemy.y;
        const enemyBottom = enemy.y + enemyActualHeight;
        const projectileTop = projectile.y;
        const projectileBottom = projectile.y + projectileActualHeight;

        const verticalOverlap = enemyBottom >= projectileTop && projectileBottom >= enemyTop;
        const horizontalOverlap = Math.abs(enemyX - projectileX) < (enemyWidth + projectileWidth) / 2;

        if (verticalOverlap && horizontalOverlap) {
          // TODO: Consider storing damage per projectile for companion shots
          // Damage enemy
          let damage = projectile.damage || this.state.player.damage || 1;

          // Crit Logic
          const isCrit = Math.random() < 0.1; // 10% base crit chance
          if (isCrit) {
            damage *= 2;
            this.particles.emitBurst({
              x: enemyX,
              y: enemy.y + enemyActualHeight / 2,
              ...GAME_CONFIG.effects.criticalHit
            });
          }

          enemy.health = (enemy.health || 1) - damage;

          // Check if enemy is destroyed
          if (enemy.health <= 0) {
            this.state.enemies.splice(i, 1);
            this.state.kills++; // Track kill

            // Combo Logic
            this.state.combo.count++;
            this.state.combo.timer = GAME_CONFIG.combo.window;
            this.state.combo.maxCombo = Math.max(this.state.combo.maxCombo, this.state.combo.count);
            if (this.state.combo.count >= GAME_CONFIG.combo.threshold) {
              this.state.combo.isBoostActive = true;
            }

            const scoreBonus = (enemy.typeData?.scoreMultiplier || 1) * GAME_CONFIG.difficulty.scorePerEnemy;
            this.state.addScore(scoreBonus);
            this.spawnEnemyDestroyedEffect(enemy.lane, enemy.y + enemyActualHeight / 2, enemy.lateralOffset || 0);
            if (this.xpManager) {
              this.xpManager.spawnXP(enemyX, enemy.y + enemyActualHeight / 2);
            }
            if (this.powerUps) {
              this.powerUps.maybeDrop({ lane: enemy.lane, y: enemy.y + enemyActualHeight / 2, x: enemyX });
            }
          } else {
            // Hit but not destroyed - show hit effect
            this.spawnHitEffect(enemyX, enemy.y + enemyActualHeight / 2);
          }

          // Show damage number
          this.state.spawnTextPopup(
            Math.floor(damage).toString() + (isCrit ? '!' : ''),
            enemyX,
            enemy.y,
            isCrit ? '#fbbf24' : '#ffffff',
            isCrit ? 24 : (16 + Math.min(10, damage * 2))
          );

          // Track damage for DPS
          this.state.damageDealt.push({ time: this.state.elapsed, amount: damage });

          const nextHitCount = (projectile.hits ?? 0) + 1;
          const pierce = projectile.pierce ?? 0;
          if (nextHitCount > pierce) {
            this.state.projectiles.splice(j, 1);
          } else {
            projectile.hits = nextHitCount;
          }
          break;
        }
      }
    }
  }

  render() {
    const { renderer, state, particles, forces } = this;
    const viewOffset = forces ? forces.getOffset() : { x: 0, y: 0 };
    renderer.beginFrame(viewOffset);
    renderer.drawLanes();
    renderer.drawEnemies(state.enemies);
    if (renderer.drawPowerUps) {
      renderer.drawPowerUps(state.powerUps);
    }
    if (renderer.drawXPOrbs) {
      renderer.drawXPOrbs(state.xpOrbs);
    }
    renderer.drawProjectiles(state.projectiles);
    if (renderer.drawEnemyProjectiles) {
      renderer.drawEnemyProjectiles(state.enemyProjectiles);
    }
    if (renderer.drawCompanions) {
      renderer.drawCompanions(state.companions, state.player);
    }
    renderer.drawPlayer(state.player);
    if (particles) {
      renderer.drawParticles(particles.getParticles());
    }
    if (renderer.drawTextPopups) {
      renderer.drawTextPopups(state.textPopups);
    }
    renderer.endFrame();
  }

  spawnEnemyDestroyedEffect(lane, impactY, lateralOffset = 0) {
    if (!this.particles) return;
    this.particles.emitBurst({
      x: laneCenter(lane, lateralOffset),
      y: Math.max(0, impactY),
      ...GAME_CONFIG.effects.enemyDestroyed,
    });
    if (this.forces) {
      this.forces.addShake(GAME_CONFIG.effects.enemyDestroyedShake);
    }
  }

  spawnLeakEffect(lane, impactY, lateralOffset = 0) {
    if (!this.particles) return;
    this.particles.emitBurst({
      x: laneCenter(lane, lateralOffset),
      y: Math.min(PLAYFIELD_HEIGHT, Math.max(0, impactY)),
      ...GAME_CONFIG.effects.leak,
    });
    if (this.forces) {
      this.forces.addShake(GAME_CONFIG.effects.leakShake);
    }
  }

  spawnShieldBreakEffect(x, y) {
    if (!this.particles) return;
    this.particles.emitBurst({
      x,
      y,
      ...GAME_CONFIG.effects.shieldBreak,
    });
    // Intense shake
    if (this.forces) {
      this.forces.addShake({ magnitude: 12, duration: 300 });
    }
  }

  spawnHitEffect(x, y) {
    if (!this.particles) return;
    this.particles.emitBurst({
      x,
      y,
      count: 8,
      palette: ['#ffffff', '#ffff00'],
      speed: [80, 140],
      life: [100, 180],
      size: [1.5, 3],
      gravity: 100,
      drag: 0.85,
      blend: 'lighter',
    });
  }

  enemyShoot(enemy) {
    const enemySize = enemy.size || 1;
    const enemyHeight = GAME_CONFIG.enemy.height * enemySize;
    const enemyX = laneCenter(enemy.lane, enemy.lateralOffset || 0);
    const muzzleY = enemy.y + enemyHeight;

    this.state.enemyProjectiles.push({
      lane: enemy.lane,
      x: enemyX,
      y: muzzleY,
      speed: 400,
      width: 6,
      height: 18,
    });

    // Small particle effect
    if (this.particles) {
      this.particles.emitBurst({
        x: enemyX,
        y: muzzleY,
        count: 4,
        palette: ['#8b5cf6', '#a78bfa'],
        speed: [60, 120],
        life: [80, 140],
        size: [1, 2.5],
        gravity: -50,
        drag: 0.9,
        blend: 'lighter',
      });
    }
  }

  updateEnemyProjectiles(delta) {
    const seconds = delta / 1000;
    const player = this.state.player;
    const playerX = laneCenter(player.lane, player.laneProgress ?? 0);
    const playerY = player.y;
    const playerWidth = GAME_CONFIG.player.width;
    const playerHeight = GAME_CONFIG.player.height;

    for (let i = this.state.enemyProjectiles.length - 1; i >= 0; i -= 1) {
      const projectile = this.state.enemyProjectiles[i];
      projectile.y += projectile.speed * seconds;

      // Remove if off-screen
      if (projectile.y > PLAYFIELD_HEIGHT + GAME_CONFIG.canvasPadding) {
        this.state.enemyProjectiles.splice(i, 1);
        continue;
      }

      // Check collision with player
      const projectileTop = projectile.y;
      const projectileBottom = projectile.y + projectile.height;
      const playerTop = playerY - playerHeight / 2;
      const playerBottom = playerY + playerHeight / 2;

      const verticalOverlap = projectileBottom >= playerTop && projectileTop <= playerBottom;
      const horizontalOverlap = Math.abs(projectile.x - playerX) < (playerWidth + projectile.width) / 2;

      if (verticalOverlap && horizontalOverlap) {
        this.state.damagePlayer(GAME_CONFIG.damage.onHit, {
          cause: 'enemy-projectile',
          lane: player.lane,
          elapsed: this.state.elapsed,
        });
        this.spawnShieldBreakEffect(playerX, playerY);
        this.state.enemyProjectiles.splice(i, 1);
      }
    }
  }

  applyAutoAim(projectile, seconds) {
    if (!projectile.aim) return;
    const turnRate = GAME_CONFIG.projectile.autoAimTurnRate;
    const strength = projectile.aim.strength ?? 1;
    const currentOffset = projectile.offset ?? 0;

    const target = this.findNearestEnemyInLane(projectile.lane, projectile.y);
    if (!target) return;

    const targetOffset = target.lateralOffset || 0;
    const deltaOffset = targetOffset - currentOffset;
    const maxAdjust = turnRate * strength * seconds;
    projectile.offset = currentOffset + Math.max(Math.min(deltaOffset, maxAdjust), -maxAdjust);
  }

  findNearestEnemyInLane(lane, projectileY) {
    let closestEnemy = null;
    let nearestDistance = Infinity;
    for (let i = 0; i < this.state.enemies.length; i += 1) {
      const enemy = this.state.enemies[i];
      if (enemy.lane !== lane) continue;
      const distance = Math.abs(enemy.y - projectileY);
      if (distance < nearestDistance && enemy.y < projectileY) {
        nearestDistance = distance;
        closestEnemy = enemy;
      }
    }
    return closestEnemy;
  }

  findNearestEnemyAny(x, y) {
    let closestEnemy = null;
    let nearestDistance = Infinity;
    for (let i = 0; i < this.state.enemies.length; i += 1) {
      const enemy = this.state.enemies[i];
      const enemyX = laneCenter(enemy.lane, enemy.lateralOffset || 0);
      const dx = enemyX - x;
      const dy = enemy.y - y;
      const distance = Math.hypot(dx, dy);
      if (distance < nearestDistance && distance < 400) {
        nearestDistance = distance;
        closestEnemy = enemy;
      }
    }
    return closestEnemy;
  }
}
