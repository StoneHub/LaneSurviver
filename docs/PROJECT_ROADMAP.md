# Lane Survivor - Project Documentation & Roadmap

## 📋 Current State

### What We Have
A fully functional browser-based lane shooter game with:
- ✅ Core gameplay loop (dodge, shoot, collect XP, level up)
- ✅ Upgrade system with 10+ different upgrades
- ✅ Difficulty scaling based on player power
- ✅ Power-up drops from enemies
- ✅ Comprehensive game logging system
- ✅ Settings panel (auto-collect XP, pass-through limits)
- ✅ Visual effects (particles, damage numbers, notifications)
- ✅ Enemy grouping system for performance
- ✅ Homing bullets with auto-aim

### Current Architecture
- **Single HTML file** (~1500 lines)
- Vanilla JavaScript with Canvas API
- No external dependencies
- LocalStorage for game logs
- All code in one monolithic structure

### Known Issues
1. **Instant death from enemy collision is too harsh** - needs health system
2. **Balance still too difficult** - players dying in ~13 seconds
3. **Single file is becoming unwieldy** - hard to maintain
4. **No code organization** - everything in global scope
5. **Limited analytics** - console logs only
6. **No mobile support** - desktop keyboard only

---

## 🎯 Vision: Awesome Web App Game

### Core Goals
1. **Fun first** - Games should last 3-5+ minutes for good runs
2. **Polished experience** - Smooth animations, satisfying feedback
3. **Progressive difficulty** - Gentle learning curve with increasing challenge
4. **Replayability** - Multiple viable build paths and strategies
5. **Accessibility** - Mobile-friendly, clear UI/UX
6. **Data-driven balance** - Use logs to continuously improve

### Target Experience
- Casual yet engaging gameplay
- "One more run" addictiveness
- Satisfying power progression
- Clear visual feedback for all actions
- Responsive controls (keyboard + touch)
- Leaderboard/achievements (optional)

---

## 🏗️ Recommended Project Structure

### Option 1: Modern Vanilla JS (Recommended for MVP)
```
lane-survivor/
├── index.html                 # Entry point
├── README.md                  # Project overview
├── package.json               # Build tools (optional)
│
├── src/
│   ├── main.js               # Game initialization
│   ├── config.js             # Game constants & settings
│   │
│   ├── core/
│   │   ├── Game.js           # Main game loop & state
│   │   ├── Renderer.js       # All canvas drawing
│   │   ├── InputManager.js   # Keyboard & touch input
│   │   └── AudioManager.js   # Sound effects (future)
│   │
│   ├── entities/
│   │   ├── Player.js         # Player class
│   │   ├── Enemy.js          # Enemy class
│   │   ├── Bullet.js         # Bullet class
│   │   ├── XPOrb.js          # XP orb class
│   │   └── PowerUp.js        # Power-up class
│   │
│   ├── systems/
│   │   ├── UpgradeSystem.js  # Level-up upgrades
│   │   ├── DifficultySystem.js # Difficulty scaling
│   │   ├── CollisionSystem.js  # Collision detection
│   │   ├── SpawnSystem.js    # Enemy spawning
│   │   └── ParticleSystem.js # Visual effects
│   │
│   ├── ui/
│   │   ├── UIManager.js      # UI updates
│   │   ├── Modal.js          # Modal dialogs
│   │   ├── HealthBar.js      # Health display
│   │   └── SettingsPanel.js  # Settings UI
│   │
│   ├── analytics/
│   │   ├── GameLogger.js     # Logging system
│   │   ├── StatsTracker.js   # Real-time stats
│   │   └── AnalyticsDashboard.js # View logs (future)
│   │
│   └── utils/
│       ├── math.js           # Math helpers
│       ├── storage.js        # LocalStorage wrapper
│       └── constants.js      # Game constants
│
├── assets/
│   ├── sounds/               # Sound effects (future)
│   └── sprites/              # Sprite sheets (future)
│
├── styles/
│   ├── main.css              # Main styles
│   ├── game.css              # Game canvas styles
│   └── ui.css                # UI component styles
│
└── dist/                     # Built files (if using bundler)
```

### Option 2: React/Vue Framework (For Future Scaling)
Good if you want:
- More complex UI (menus, stats dashboard, etc.)
- Component reusability
- State management (Redux/Vuex)
- Easier testing

**Recommendation: Start with Option 1**, migrate to framework later if needed.

---

## 🚀 Development Roadmap

### Phase 1: Refactor & Foundation (Week 1-2)
**Goal: Organize code without changing functionality**

1. **Split into modules**
   - Extract classes: Player, Enemy, Bullet, etc.
   - Separate rendering from game logic
   - Create systems: Collision, Spawn, Difficulty
   - Move UI code to separate files

2. **Add health system**
   - Player has 5 HP by default
   - Invulnerability frames after hit (2 seconds)
   - Visual feedback (flash red, shake screen)
   - Health power-ups drop from enemies
   - Health upgrade option

3. **Improve project setup**
   - Add package.json for tooling
   - Use ES6 modules
   - Add simple build script (optional: Vite/Parcel)
   - Set up local dev server

**Deliverable:** Clean, organized codebase with health system

---

### Phase 2: Balance & Polish (Week 3-4)
**Goal: Make the game feel great**

1. **Gameplay balance**
   - Use collected logs to tune difficulty
   - Adjust spawn rates, enemy HP, player damage
   - Test different upgrade paths
   - Aim for 3-5 minute average runs

2. **Juice & feel**
   - Screen shake on hits
   - Camera zoom effects on level up
   - Better particle effects
   - Smooth transitions
   - Impact frames (brief pause on hit)

3. **Sound effects**
   - Shoot, hit, level up, game over
   - Background music (optional)
   - Use Web Audio API or Howler.js

4. **Visual improvements**
   - Better sprites/graphics
   - Animated backgrounds
   - Enemy variety (different types)
   - Boss enemies every 10 levels

**Deliverable:** Polished, satisfying gameplay loop

---

### Phase 3: Content & Features (Week 5-6)
**Goal: Add depth and replayability**

1. **More content**
   - 5-10 new upgrades
   - 3-5 enemy types
   - 2-3 boss fights
   - New power-ups
   - Special events/waves

2. **Meta progression**
   - Unlock system (new upgrades/characters)
   - Persistent stats across runs
   - Achievement system
   - Daily challenges

3. **Enhanced logging**
   - In-game stats dashboard
   - Run history viewer
   - Build sharing (export/import builds)
   - Heatmaps of death locations

**Deliverable:** Rich content with replay value

---

### Phase 4: Platform & Distribution (Week 7-8)
**Goal: Make it accessible to everyone**

1. **Mobile support**
   - Touch controls (virtual joystick or swipe)
   - Responsive canvas sizing
   - Mobile-optimized UI
   - PWA setup for install

2. **Social features**
   - Online leaderboards (Firebase/Supabase)
   - Share scores to social media
   - Optional: Multiplayer co-op mode

3. **Distribution**
   - Deploy to GitHub Pages / Netlify
   - Submit to itch.io / Newgrounds
   - Create presskit / trailer
   - SEO optimization

**Deliverable:** Published, accessible game

---

## 🛠️ Technical Recommendations

### Build Tool: Vite (Highly Recommended)
```bash
npm create vite@latest lane-survivor -- --template vanilla
```
**Why Vite:**
- Lightning fast dev server
- ES6 modules out of the box
- Hot module replacement
- Simple config
- Great for vanilla JS

### Package Structure
```json
{
  "name": "lane-survivor",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

### Code Style
- **ES6+ features**: Classes, modules, arrow functions
- **No frameworks initially**: Keep it vanilla
- **TypeScript (optional)**: Add later for type safety
- **Linting**: ESLint for code quality

### State Management
```javascript
// Simple state manager
class GameState {
  constructor() {
    this.subscribers = [];
    this.state = {};
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }
  
  subscribe(callback) {
    this.subscribers.push(callback);
  }
  
  notify() {
    this.subscribers.forEach(cb => cb(this.state));
  }
}
```

### Performance Tips
1. **Object pooling** for bullets/particles
2. **Spatial partitioning** for collision detection
3. **RequestAnimationFrame** with delta time
4. **Offscreen canvas** for static elements
5. **Web Workers** for heavy calculations (if needed)

---

## 📊 Balance Philosophy

### Data-Driven Approach
Use the logging system to track:
- **Average survival time** per build
- **Most common death causes**
- **Upgrade popularity** (pick rate)
- **Upgrade effectiveness** (win rate when picked)
- **Difficulty spikes** (death time clusters)

### Balance Goals
- **First death: 1-2 minutes** (learning phase)
- **Average run: 3-5 minutes** (skilled play)
- **Best runs: 8-10+ minutes** (optimal builds)
- **All upgrades viable** (no must-picks)
- **Multiple strategies** (tank, glass cannon, balanced)

### Difficulty Curve
```
Difficulty = BaseValue * (1 + Time/60)^0.8 * PlayerPower^0.3

Where:
- Time = seconds survived
- PlayerPower = f(upgrades, level, etc.)
- Exponents keep scaling gentle
```

---

## 🎨 Art Direction (Future)

### Style Options
1. **Pixel Art** (easiest, retro feel)
2. **Geometric/Neon** (modern, flashy)
3. **Hand-drawn** (unique, charming)

### Color Palette (Current)
- Background: Dark blues/purples (#0a0a1a)
- Player: Green (#00ff00)
- Enemies: Reds (#ff4444)
- XP: Cyan (#00ffff)
- UI: GitHub-inspired grays

---

## 🎮 UX Improvements Needed

### Immediate (Critical)
1. ✅ Health system with visual indicator
2. ✅ Clearer upgrade descriptions
3. ✅ Better death feedback
4. Tutorial/instructions overlay
5. Pause menu

### Short-term (Important)
1. Key rebinding
2. Volume controls
3. Graphics quality settings
4. Colorblind mode
5. Zoom options

### Long-term (Nice to have)
1. Replays/ghost runs
2. Training mode
3. Custom game modifiers
4. Mod support

---

## 📱 Mobile Support Strategy

### Input Methods
```javascript
// Touch controls
class TouchInput {
  constructor(canvas) {
    this.touchStartX = 0;
    
    canvas.addEventListener('touchstart', (e) => {
      this.touchStartX = e.touches[0].clientX;
    });
    
    canvas.addEventListener('touchmove', (e) => {
      const deltaX = e.touches[0].clientX - this.touchStartX;
      if (Math.abs(deltaX) > 50) {
        // Swipe left/right
        player.lane += deltaX > 0 ? 1 : -1;
        this.touchStartX = e.touches[0].clientX;
      }
    });
  }
}
```

### Responsive Canvas
```javascript
function resizeCanvas() {
  const container = canvas.parentElement;
  const aspectRatio = 600 / 800;
  
  if (window.innerWidth / window.innerHeight < aspectRatio) {
    canvas.width = window.innerWidth * 0.95;
    canvas.height = canvas.width / aspectRatio;
  } else {
    canvas.height = window.innerHeight * 0.8;
    canvas.width = canvas.height * aspectRatio;
  }
}
```

---

## 🔧 Immediate Next Steps

### What to Do Right Now

1. **Set up project structure**
   ```bash
   mkdir lane-survivor
   cd lane-survivor
   npm create vite@latest . -- --template vanilla
   npm install
   ```

2. **Create core classes**
   - Start with `Game.js`, `Player.js`, `Enemy.js`
   - Move rendering to `Renderer.js`
   - Extract constants to `config.js`

3. **Add health system**
   - Modify player to have HP
   - Add invulnerability frames
   - Create health UI component
   - Add health power-ups

4. **Test and balance**
   - Play 20+ runs
   - Log all data
   - Analyze death patterns
   - Adjust difficulty accordingly

5. **Document everything**
   - Add JSDoc comments
   - Create API documentation
   - Write contribution guide
   - Update README with setup

---

## 💡 Ideas for Future Features

### Gameplay
- [ ] Character selection (different starting stats)
- [ ] Weapon variety (shotgun, laser, etc.)
- [ ] Special abilities (dash, time slow, bomb)
- [ ] Combo system (kill streaks)
- [ ] Environmental hazards
- [ ] Boss encounters every 10 levels

### Meta
- [ ] Permanent upgrades between runs
- [ ] Skill tree
- [ ] Daily challenges with modifiers
- [ ] Endless mode vs. staged mode
- [ ] Seeded runs for competition

### Social
- [ ] Online leaderboards
- [ ] Replay sharing
- [ ] Build sharing/importing
- [ ] In-game chat
- [ ] Co-op mode (2-4 players)

### Polish
- [ ] Story/lore snippets
- [ ] Multiple difficulty levels
- [ ] Accessibility options (colorblind, etc.)
- [ ] Localization (multiple languages)
- [ ] Custom skins/themes

---

## 📈 Success Metrics

### MVP (Minimum Viable Product)
- Average session: 5+ minutes
- Player retention: 3+ runs per visit
- Death variety: No single cause >50%
- Upgrade diversity: All upgrades picked regularly

### Growth
- DAU (Daily Active Users): 100+ after 1 month
- Conversion: 20% return next day
- Viral coefficient: 0.3+ (shares per player)
- App store rating: 4.0+ stars

---

## 🤝 Contributing Guide (Future)

When opening to contributors:
1. Issue templates for bugs/features
2. PR template with checklist
3. Code style guide
4. Testing requirements
5. Review process

---

## 📚 Resources & Inspiration

### Similar Games
- **Vampire Survivors** (inspiration for survivor genre)
- **Magic Survival** (mobile survivor game)
- **20 Minutes Till Dawn** (dual-stick survivor)

### Learning Resources
- [HTML5 Game Development](https://developer.mozilla.org/en-US/docs/Games)
- [Canvas Tutorial](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial)
- [Game Programming Patterns](https://gameprogrammingpatterns.com/)

### Tools
- **Aseprite** - Pixel art editor
- **Audacity** - Sound editing
- **BFXR** - Sound effect generator
- **Tiled** - Map editor (if needed)

---

## 🎯 TL;DR - Quick Start Plan

1. **This Week:**
   - Set up Vite project structure
   - Split code into modules (Game, Player, Enemy, etc.)
   - Add health system (5 HP, invulnerability frames)
   - Test balance with health system

2. **Next Week:**
   - Add sound effects
   - Polish visual effects
   - Create 5 more upgrades
   - Add enemy variety

3. **Following Week:**
   - Add mobile support
   - Create analytics dashboard
   - Implement meta progression
   - Prepare for launch

4. **Launch:**
   - Deploy to GitHub Pages
   - Submit to itch.io
   - Share on Reddit/Twitter
   - Gather feedback and iterate

---

## 📝 Notes & Considerations

### Why This Approach?
- **Incremental**: Build on what works
- **Testable**: Each phase has clear deliverables
- **Flexible**: Can adjust based on feedback
- **Pragmatic**: No over-engineering

### Risk Mitigation
- Keep current version as backup
- Version control everything (Git)
- Test on multiple browsers
- Get feedback early and often

### When to Stop
Know when the game is "done":
- Core loop is fun and polished
- Balance feels right
- No critical bugs
- Players are engaged

Don't chase perfection - ship and iterate!

---

## 🚦 Current Priority: Health System

Based on your playtest (13 second survival with instant death), the **immediate priority** is:

### Health System Implementation
```javascript
// Add to game state
health: 5,
maxHealth: 5,
invulnerable: false,
invulnerableUntil: 0,

// Collision with enemy
if (!game.invulnerable) {
  game.health--;
  game.invulnerable = true;
  game.invulnerableUntil = Date.now() + 2000; // 2 sec immunity
  
  // Visual feedback
  screenShake();
  player.flash = 30; // Flash frames
  
  if (game.health <= 0) {
    gameOver('Health depleted');
  }
}
```

This single change will dramatically improve the experience!

---

**Ready to start?** Let me know and I can help you set up the project structure and implement the health system first!
