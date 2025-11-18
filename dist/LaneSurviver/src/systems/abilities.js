// TODO: Add visual indicators for active ability cooldowns
// IDEA: Add combo system - activating multiple abilities in sequence gives bonuses
import { GAME_CONFIG } from '../config.js';

const laneCenter = (lane, offset = 0) =>
  GAME_CONFIG.canvasPadding + (lane + 0.5 + offset) * GAME_CONFIG.laneWidth;

export class AbilityManager {
  constructor(state, particles) {
    this.state = state;
    this.particles = particles;
    this.activeAbilities = [];
  }

  addAbility(type, config) {
    const ability = {
      type,
      ...config,
      active: type === 'damage-trail', // Damage trail is passive, others are activated
    };

    this.activeAbilities.push(ability);

    // Start damage trail immediately if it's that type
    if (type === 'damage-trail') {
      this.state.player.trailActive = true;
      this.state.player.trailUntil = this.state.elapsed + config.duration;
    }
  }

  activate(type) {
    const ability = this.activeAbilities.find(a => a.type === type && !a.active);
    if (!ability) return false;

    switch (type) {
      case 'lane-clear':
        this.activateLaneClear();
        break;
      case 'side-blast':
        this.activateSideBlast();
        break;
      default:
        return false;
    }

    // Decrement charges or mark as used
    if (ability.charges !== undefined) {
      ability.charges--;
      if (ability.charges <= 0) {
        const index = this.activeAbilities.indexOf(ability);
        this.activeAbilities.splice(index, 1);
      }
    } else {
      ability.active = true;
    }

    return true;
  }

  activateLaneClear() {
    const player = this.state.player;
    const playerLane = player.lane;

    // Find all enemies in player's lane
    const enemiesKilled = [];
    for (let i = this.state.enemies.length - 1; i >= 0; i--) {
      const enemy = this.state.enemies[i];
      if (enemy.lane === playerLane) {
        enemiesKilled.push(enemy);
        this.state.enemies.splice(i, 1);

        // Award score
        const scoreBonus = (enemy.typeData?.scoreMultiplier || 1) * GAME_CONFIG.difficulty.scorePerEnemy;
        this.state.addScore(scoreBonus);

        // Spawn XP
        const enemyX = laneCenter(enemy.lane, enemy.lateralOffset || 0);
        const enemyY = enemy.y + (enemy.typeData?.height || 32) / 2;
        if (this.state.xpOrbs) {
          this.state.xpOrbs.push({
            x: enemyX,
            y: enemyY,
            vy: -100,
            value: enemy.typeData?.xp || 5,
          });
        }
      }
    }

    // Visual effect - massive explosion down the lane
    const laneX = laneCenter(playerLane);
    for (let y = 0; y < GAME_CONFIG.playfieldHeight; y += 60) {
      this.particles.emitBurst({
        x: laneX,
        y: y + GAME_CONFIG.canvasPadding,
        count: 20,
        palette: ['#fbbf24', '#f59e0b', '#ffffff'],
        speed: [200, 400],
        life: [400, 600],
        size: [4, 8],
        gravity: 0,
        drag: 0.92,
        blend: 'lighter',
      });
    }

    // Text popup
    if (this.state.spawnTextPopup) {
      this.state.spawnTextPopup(
        `LANE CLEARED! +${enemiesKilled.length}`,
        laneX,
        GAME_CONFIG.playfieldHeight / 2,
        '#fbbf24',
        28
      );
    }
  }

  activateSideBlast() {
    const player = this.state.player;
    const playerLane = player.lane;
    const leftLane = playerLane - 1;
    const rightLane = playerLane + 1;

    const killsInLane = (lane) => {
      let count = 0;
      for (let i = this.state.enemies.length - 1; i >= 0; i--) {
        const enemy = this.state.enemies[i];
        if (enemy.lane === lane) {
          this.state.enemies.splice(i, 1);
          count++;

          // Award score
          const scoreBonus = (enemy.typeData?.scoreMultiplier || 1) * GAME_CONFIG.difficulty.scorePerEnemy * 0.5; // Half score for side blast
          this.state.addScore(scoreBonus);

          // Spawn XP
          const enemyX = laneCenter(enemy.lane, enemy.lateralOffset || 0);
          const enemyY = enemy.y + (enemy.typeData?.height || 32) / 2;
          if (this.state.xpOrbs) {
            this.state.xpOrbs.push({
              x: enemyX,
              y: enemyY,
              vy: -100,
              value: (enemy.typeData?.xp || 5) * 0.5, // Half XP for side blast
            });
          }
        }
      }
      return count;
    };

    let totalKills = 0;
    [leftLane, rightLane].forEach(lane => {
      if (lane >= 0 && lane < GAME_CONFIG.lanes) {
        const kills = killsInLane(lane);
        totalKills += kills;

        // Visual effect
        const laneX = laneCenter(lane);
        this.particles.emitBurst({
          x: laneX,
          y: player.y,
          count: 40,
          palette: ['#8b5cf6', '#a78bfa', '#ffffff'],
          speed: [300, 500],
          life: [300, 500],
          size: [3, 6],
          gravity: -200,
          drag: 0.88,
          blend: 'lighter',
        });
      }
    });

    // Text popup
    if (this.state.spawnTextPopup && totalKills > 0) {
      const playerX = laneCenter(player.lane, player.laneProgress ?? 0);
      this.state.spawnTextPopup(
        `SIDE BLAST! +${totalKills}`,
        playerX,
        player.y - 40,
        '#8b5cf6',
        24
      );
    }
  }

  update(delta) {
    // Update trail blazer effect
    if (this.state.player.trailActive) {
      if (this.state.elapsed > this.state.player.trailUntil) {
        this.state.player.trailActive = false;
        delete this.state.player.trailUntil;

        // Remove trail ability from active list
        const index = this.activeAbilities.findIndex(a => a.type === 'damage-trail');
        if (index >= 0) {
          this.activeAbilities.splice(index, 1);
        }
      } else {
        // Check if player is moving and damage enemies in their path
        if (this.state.player.laneProgress !== 0) {
          this.applyTrailDamage();
        }
      }
    }
  }

  applyTrailDamage() {
    const player = this.state.player;
    const currentLane = player.lane;
    const targetLane = player.targetLane;

    // Damage enemies in both current and target lane while transitioning
    [currentLane, targetLane].forEach(lane => {
      for (let i = this.state.enemies.length - 1; i >= 0; i--) {
        const enemy = this.state.enemies[i];
        if (enemy.lane === lane) {
          const enemyY = enemy.y + (enemy.typeData?.height || 32) / 2;

          // Check if enemy is near player's Y position
          if (Math.abs(enemyY - player.y) < 60) {
            // Damage enemy
            const damage = 0.5; // Trail does less damage than direct hits
            enemy.health = (enemy.health || 1) - damage;

            // Spawn trail particle effect
            const enemyX = laneCenter(enemy.lane, enemy.lateralOffset || 0);
            this.particles.emitBurst({
              x: enemyX,
              y: enemyY,
              count: 5,
              palette: ['#f97316', '#fb923c'],
              speed: [80, 150],
              life: [200, 300],
              size: [2, 4],
              gravity: 0,
              drag: 0.9,
              blend: 'lighter',
            });

            // Check if enemy is destroyed
            if (enemy.health <= 0) {
              this.state.enemies.splice(i, 1);
              const scoreBonus = (enemy.typeData?.scoreMultiplier || 1) * GAME_CONFIG.difficulty.scorePerEnemy * 0.3;
              this.state.addScore(scoreBonus);

              // Spawn XP
              if (this.state.xpOrbs) {
                this.state.xpOrbs.push({
                  x: enemyX,
                  y: enemyY,
                  vy: -80,
                  value: (enemy.typeData?.xp || 5) * 0.3,
                });
              }
            }
          }
        }
      }
    });
  }

  getActiveAbilities() {
    return this.activeAbilities.map(a => ({
      type: a.type,
      charges: a.charges,
      duration: a.duration,
      timeRemaining: a.type === 'damage-trail' && this.state.player.trailUntil
        ? this.state.player.trailUntil - this.state.elapsed
        : null,
    }));
  }

  hasAbility(type) {
    return this.activeAbilities.some(a => a.type === type);
  }
}
