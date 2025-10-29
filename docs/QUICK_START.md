# Lane Survivor - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Set Up Project
```bash
# Create project directory
mkdir lane-survivor
cd lane-survivor

# Initialize with Vite (recommended)
npm create vite@latest . -- --template vanilla

# Install dependencies
npm install

# Start dev server
npm run dev
```

(Already cloned this repo? The structure above is pre-configured, so you can skip straight to Step 2.)

### Step 2: Create Basic Structure
```bash
# Create directory structure
mkdir -p src/{core,entities,systems,ui,utils}
mkdir -p styles
```

### Step 3: File Structure
```
lane-survivor/
├── index.html
├── package.json
├── src/
│   ├── main.js              ← Start here
│   ├── config.js            ← Game constants
│   ├── core/
│   │   ├── Game.js          ← Main game loop
│   │   └── Renderer.js      ← Canvas drawing
│   ├── entities/
│   │   ├── Player.js        ← Player class
│   │   ├── Enemy.js         ← Enemy class
│   │   └── Bullet.js        ← Bullet class
│   └── systems/
│       ├── CollisionSystem.js
│       └── SpawnSystem.js
├── styles/
│   └── main.css
```

---

## 🔄 Migrating the Legacy Neon Build

The second commit (`2ed446b`) contains `lane-shooter-enhanced.html`, a neon-styled survivor packed with systems we want to revive. Use it as a specification while working inside the modular architecture:

1. **Extract visual tokens**
   - Copy the color palette, gradients, and border styles into `styles/main.css`.
   - Set `ctx.imageSmoothingEnabled = false` inside `Renderer` to match the pixelated presentation.
   - Add helper classes for `.upgrade-panel`, `.notification`, and `.gameover-panel` based on the legacy markup.

2. **Map UI panels to the new HUD**
   - Legacy `#ui` stats → `HUDController` cards (`data-score`, `data-health`, etc.).
   - Legacy modals (`#upgradeModal`, `#gameOverModal`) → new modal controller modules that manage focus trapping and animations.
   - Legacy notification feed (`#notificationPanel`) → HUD notification queue (consider `ui/notifications.js`).

3. **Split monolithic logic into systems**
   - XP orb spawn & collection → `systems/xp.js`.
   - Upgrade draft + data definitions → `systems/upgrade.js` and `config/upgrades.js`.
   - Enemy waves, boss timers, and difficulty scaling → `systems/spawn.js` + `systems/difficulty.js`.
   - Power-up drops & stat bumps → `game/powerup.js` + `config/powerups.js`.
   - Analytics logging + settings persistence → `analytics/logger.js` and `ui/settings.js`.

4. **Port constants thoughtfully**
   - Move magic numbers (XP thresholds, spawn intervals, invulnerability times) into `config.js` or dedicated config modules.
   - Preserve the `GAME_STATS` structure (kills, damage taken, etc.) so analytics remain comparable between builds.

5. **Verify interactions**
   - Level-up flow should pause the engine, open the modal, apply upgrades, then resume.
   - Game-over modal should pull from consolidated state (`GameState` + analytics).
   - Settings toggles must broadcast changes to the relevant systems (e.g., auto-collect XP).

Document every mapping in commit messages or `docs/milestone-notes.md` to keep parity between the neon legacy experience and the modern responsive shell.

---

### Particle & Force Helpers

- `src/systems/particles.js` exposes `emitBurst(options)` for additive CRT bursts, XP pops, muzzle flashes, etc. Coordinates are in world units (`laneWidth` scale); the renderer handles pixel conversion.
- `src/physics/forces.js` provides `ForceField.addShake({ magnitude, duration })` so gameplay events can trigger camera shake. Magnitude is measured in world units and respects responsive scaling.
- Both systems are registered in `LaneSurvivorApp` and ticked inside `GameEngine`, which already emits bursts on player fire, enemy kills, and leaks—build new emitters by reusing those hooks.

---

## 📝 Example: First Refactored Files

### config.js
```javascript
export const CONFIG = {
  CANVAS: {
    WIDTH: 600,
    HEIGHT: 800
  },
  
  LANES: {
    COUNT: 3,
    get WIDTH() { return CONFIG.CANVAS.WIDTH / CONFIG.LANES.COUNT; }
  },
  
  PLAYER: {
    SIZE: 28,
    Y: 700,
    STARTING_HEALTH: 5,
    INVULNERABILITY_TIME: 2000, // ms
    BASE_DAMAGE: 5,
    BASE_FIRE_RATE: 300 // ms
  },
  
  ENEMY: {
    BASE_SIZE: 16,
    BASE_HEALTH: 10,
    BASE_SPEED: 1.5,
    BASE_SPAWN_RATE: 450 // ms
  },
  
  DIFFICULTY: {
    BASE_MULTIPLIER: 1,
    POWER_SCALING: 0.30,
    MIN_SPAWN_RATE: 150,
    LEVEL_INCREASE: 0.02
  }
};
```

### entities/Player.js
```javascript
import { CONFIG } from '../config.js';

export class Player {
  constructor(startLane = 1) {
    this.lane = startLane;
    this.x = this.lane * CONFIG.LANES.WIDTH + CONFIG.LANES.WIDTH / 2;
    this.targetX = this.x;
    this.y = CONFIG.PLAYER.Y;
    this.size = CONFIG.PLAYER.SIZE;
    
    // Health system
    this.health = CONFIG.PLAYER.STARTING_HEALTH;
    this.maxHealth = CONFIG.PLAYER.STARTING_HEALTH;
    this.invulnerable = false;
    this.invulnerableUntil = 0;
    
    // Stats
    this.damage = CONFIG.PLAYER.BASE_DAMAGE;
    this.fireRate = CONFIG.PLAYER.BASE_FIRE_RATE;
    this.bulletCount = 1;
    this.pierce = 0;
    this.attackLanes = 1;
  }
  
  moveTo(lane) {
    if (lane >= 0 && lane < CONFIG.LANES.COUNT) {
      this.lane = lane;
      this.targetX = lane * CONFIG.LANES.WIDTH + CONFIG.LANES.WIDTH / 2;
    }
  }
  
  update(deltaTime) {
    // Smooth movement
    this.x += (this.targetX - this.x) * 0.3;
    
    // Update invulnerability
    if (this.invulnerable && Date.now() > this.invulnerableUntil) {
      this.invulnerable = false;
    }
  }
  
  takeDamage(amount = 1) {
    if (this.invulnerable) return false;
    
    this.health -= amount;
    this.invulnerable = true;
    this.invulnerableUntil = Date.now() + CONFIG.PLAYER.INVULNERABILITY_TIME;
    
    return this.health <= 0; // Returns true if dead
  }
  
  heal(amount = 1) {
    this.health = Math.min(this.health + amount, this.maxHealth);
  }
  
  draw(ctx) {
    const pulse = Math.sin(Date.now() / 200) * 0.1 + 1;
    const size = this.size * pulse;
    
    // Flashing effect when invulnerable
    if (this.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }
    
    // Glow
    ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
    ctx.fillRect(this.x - size, this.y - size, size * 2, size * 2);
    
    // Main body
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(
      this.x - size/2, 
      this.y - size/2, 
      size, 
      size
    );
    
    // Core
    ctx.fillStyle = '#88ff88';
    ctx.fillRect(
      this.x - size/4, 
      this.y - size/4, 
      size/2, 
      size/2
    );
    
    // Border
    ctx.strokeStyle = '#008800';
    ctx.lineWidth = 2;
    ctx.strokeRect(
      this.x - size/2, 
      this.y - size/2, 
      size, 
      size
    );
    
    ctx.globalAlpha = 1;
  }
}
```

### entities/Enemy.js
```javascript
import { CONFIG } from '../config.js';

export class Enemy {
  constructor(lane) {
    this.lane = lane;
    this.x = lane * CONFIG.LANES.WIDTH + CONFIG.LANES.WIDTH / 2;
    this.x += (Math.random() - 0.5) * 40; // Random offset
    this.y = -20 - Math.random() * 100;
    
    this.health = CONFIG.ENEMY.BASE_HEALTH;
    this.maxHealth = CONFIG.ENEMY.BASE_HEALTH;
    this.speed = CONFIG.ENEMY.BASE_SPEED;
    this.size = CONFIG.ENEMY.BASE_SIZE;
    
    this.groupCount = 1;
  }
  
  update(deltaTime) {
    this.y += this.speed;
  }
  
  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }
  
  draw(ctx) {
    let color = '#ff4444';
    if (this.groupCount > 1) {
      if (this.groupCount < 5) color = '#ff6644';
      else if (this.groupCount < 10) color = '#ff8844';
      else if (this.groupCount < 20) color = '#ffaa44';
      else color = '#ffcc44';
    }
    
    const displaySize = this.size * Math.min(1.5, 1 + this.groupCount * 0.02);
    
    ctx.fillStyle = color;
    ctx.fillRect(
      this.x - displaySize/2,
      this.y - displaySize/2,
      displaySize,
      displaySize
    );
    
    ctx.strokeStyle = '#880000';
    ctx.lineWidth = 1;
    ctx.strokeRect(
      this.x - displaySize/2,
      this.y - displaySize/2,
      displaySize,
      displaySize
    );
    
    // Group count
    if (this.groupCount > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px "Courier New"';
      ctx.fillText(`x${this.groupCount}`, this.x - 8, this.y + 3);
    }
  }
}
```

### core/Game.js
```javascript
import { CONFIG } from '../config.js';
import { Player } from '../entities/Player.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.isGameOver = false;
    
    // Timing
    this.lastTime = 0;
    this.startTime = Date.now();
    
    // Entities
    this.player = new Player(1);
    this.enemies = [];
    this.bullets = [];
    this.xpOrbs = [];
    this.particles = [];
    
    // Stats
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 10;
    this.kills = 0;
    this.enemiesPassed = 0;
    
    // Systems
    this.lastFire = 0;
    this.lastSpawn = 0;
  }
  
  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  gameLoop = (currentTime) => {
    if (!this.isRunning) return;
    
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    if (!this.isPaused && !this.isGameOver) {
      this.update(deltaTime);
    }
    
    this.render();
    
    requestAnimationFrame(this.gameLoop);
  }
  
  update(deltaTime) {
    // Update player
    this.player.update(deltaTime);
    
    // Update enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      this.enemies[i].update(deltaTime);
      
      // Check if passed through
      if (this.enemies[i].y > this.canvas.height + 20) {
        this.enemies.splice(i, 1);
        this.enemiesPassed++;
      }
    }
    
    // Check collisions
    this.checkCollisions();
    
    // Spawn enemies
    this.spawnEnemies();
    
    // Auto-fire
    this.autoFire();
  }
  
  render() {
    // Clear canvas
    this.ctx.fillStyle = '#0a0a1a';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw lanes
    this.drawLanes();
    
    // Draw entities
    this.enemies.forEach(e => e.draw(this.ctx));
    this.bullets.forEach(b => b.draw(this.ctx));
    this.player.draw(this.ctx);
  }
  
  drawLanes() {
    this.ctx.strokeStyle = '#1a1a2a';
    this.ctx.lineWidth = 1;
    for (let i = 1; i < CONFIG.LANES.COUNT; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * CONFIG.LANES.WIDTH, 0);
      this.ctx.lineTo(i * CONFIG.LANES.WIDTH, this.canvas.height);
      this.ctx.stroke();
    }
  }
  
  checkCollisions() {
    // Check enemy-player collisions
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < this.player.size + enemy.size) {
        const isDead = this.player.takeDamage(1);
        this.enemies.splice(i, 1);
        
        if (isDead) {
          this.gameOver('Health depleted');
        }
        break;
      }
    }
  }
  
  spawnEnemies() {
    // Implement spawning logic
  }
  
  autoFire() {
    // Implement auto-fire logic
  }
  
  gameOver(reason) {
    this.isGameOver = true;
    console.log('Game Over:', reason);
    // Trigger game over modal
  }
}
```

### main.js
```javascript
import { Game } from './core/Game.js';

// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas');
  const game = new Game(canvas);
  
  // Set up input
  window.addEventListener('keydown', (e) => {
    if (game.isPaused || game.isGameOver) return;
    
    if (e.key === 'ArrowLeft') {
      game.player.moveTo(game.player.lane - 1);
    } else if (e.key === 'ArrowRight') {
      game.player.moveTo(game.player.lane + 1);
    }
  });
  
  // Start game
  game.start();
});
```

### index.html
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lane Survivor</title>
  <link rel="stylesheet" href="./styles/main.css">
</head>
<body>
  <div id="gameContainer">
    <canvas id="gameCanvas" width="600" height="800"></canvas>
    <div id="ui">
      <!-- UI elements -->
    </div>
  </div>
  
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

---

## 🔥 Priority: Add Health System First

After setting up the project structure, your **first code change** should be adding the health system to the Player class (already shown above).

Key changes:
1. ✅ Player has `health` and `maxHealth` properties
2. ✅ `takeDamage()` method with invulnerability frames
3. ✅ Visual feedback (flashing) when invulnerable
4. ✅ Game over when health reaches 0

---

## 📦 Alternative: Stay Single File

If you want to keep it simple for now but add health system:

1. Just modify your current HTML file
2. Add health system (5 changes needed):
   - Add health properties to `game` object
   - Modify collision detection to use `takeDamage()`
   - Add invulnerability timer
   - Update UI to show health hearts
   - Add health power-ups

Want me to create the single-file version with health system instead?

---

## 🎯 Your Choice

**Option A: Full Refactor**
- Set up Vite project
- Split into modules
- Add health system
- Requires ~2-4 hours

**Option B: Quick Fix**
- Keep single HTML file
- Just add health system
- Requires ~30 minutes

**Option C: Hybrid**
- Create project structure
- Copy current code into modules
- Gradually refactor over time
- Requires ~1-2 hours initial

Which approach do you prefer?
