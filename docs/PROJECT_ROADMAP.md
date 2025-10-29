# Lane Survivor - Project Documentation & Roadmap

## 📋 Current State

### Modern Responsive Build (`src/`, main branch)
- ✅ Modular ES module architecture with `GameEngine`, `Renderer`, `InputManager`, `HUDController`, and responsive layout helpers.
- ✅ Static hosting friendly – runs from `index.html` with zero build tooling.
- ✅ Mobile-first touch controls surfaced via `data-touch-controls`.
- ⚠️ Minimal gameplay loop (one enemy type, no upgrades, no analytics, no modals).
- ⚠️ Visual identity is utilitarian; neon glow, particle bursts, and CRT borders from the legacy build have not been ported yet.

### Legacy Neon Build (`lane-shooter-enhanced.html`, commit `2ed446b`)
- 💡 Fully featured lane shooter: XP orbs, upgrade draft modal, run summaries, settings panel, analytics logging, and juicy VFX.
- 💡 Distinct CRT-inspired presentation with pixelated canvas, glow, and animated UI cards.
- 💡 Rich upgrade matrix (pierce, multishot, cooldown tweaks, economy boosts) and tuned difficulty curves.
- ⚠️ Ship-ready experience lives inside a single monolithic HTML/JS file with global state and no responsive layout.

### Opportunity Snapshot
- Merge the **responsive modular shell** with the **stylized, content-rich legacy build**.
- Use the legacy file as a specification: which systems, feelings, and UI panels must exist after the merge.
- Level up beyond the legacy build by upgrading visuals, balancing the upgrade deck, and ensuring telemetry works across devices.

---

## 🔥 Restoration Objectives

1. **Visual Identity** – Port the CRT neon styling, particle systems, and screen shake into the modern renderer while keeping retina-responsiveness.
2. **UI Surfaces** – Rebuild the health hearts, stat panels, notifications, upgrade modal, settings drawer, and game-over summary using the `HUDController`.
3. **Gameplay Systems** – Reinstate XP orbs, upgrade drafts, power-ups, enemy cohorts, and difficulty scaling with cleanly separated modules.
4. **Telemetry & Settings** – Restore the logging pipeline, run history, and toggleable modifiers; add TypeScript-ready interfaces for future analytics surfaces.
5. **Polish & Expansion** – Once parity exists, push beyond with fresh upgrades, enemy archetypes, and improved balance curves.

---

## 🚀 Development Roadmap

### Phase 0: Neon Shell Restoration (Week 1)
**Goal: Port the CRT aesthetic + HUD structure into the modular build**

1. **Canvas presentation**
   - Enable pixelated rendering (`ctx.imageSmoothingEnabled = false`)
   - Recreate border, drop shadow, and background gradients from the legacy file
   - Add configurable screen flash + shake helpers to `Renderer`

2. **HUD parity**
   - Recreate health hearts, stat cards, and run status panel inside `HUDController`
   - Style HUD cards using the GitHub-dark palette and neon accents
   - Ensure responsive breakpoints match both desktop and touch layouts

3. **Modal scaffolding**
   - Introduce modal primitives (upgrade + game over) using semantic HTML and CSS animations
   - Wire up keyboard and touch interactions for opening/dismissing modals
4. **Engine integration**
   - Reuse the new `ParticleSystem` (`src/systems/particles.js`) and `ForceField` (`src/physics/forces.js`) to drive CRT haze, bursts, and camera shake
   - Keep effects testable by emitting bursts on player fire and enemy destruction before porting the full legacy library

**Deliverable:** Modern build that *looks* like the enhanced HTML version, with responsive HUD + modal components in place.

---

### Phase 1: Systems Reintegration (Week 2-3)
**Goal: Restore the core survivor loop from commit `2ed446b`**

1. **XP & upgrades**
   - Recreate XP orb drops, collection, and level thresholds
   - Port the upgrade deck (damage, multishot, pierce, economy, cooldowns) into a module-driven system
   - Rebuild the upgrade draft flow (3 choices, rarity weighting, reroll logic)
   - ✅ Power-up framework landed (`PowerUpManager`) with runtime stat modifiers

2. **Enemy & spawn variety**
   - Implement enemy cohorts and wave scripting from the legacy build
   - Add spawn difficulty scaling and elite modifiers
   - Reinstate boss timer hooks (every ~90 seconds)

3. **Game flow**
   - Level-up events pause gameplay, launch the modal, and resume cleanly
   - Game-over modal summarizes stats, upgrades, and unlocks
   - Notifications surface in a queue (damage taken, upgrades acquired, milestones)

**Deliverable:** Feature parity with the neon legacy build, running on the modular architecture.

---

### Phase 2: Feel & Telemetry (Week 4)
**Goal: Make every interaction punchy while capturing actionable data**

1. **Moment-to-moment feel**
   - Particle bursts for hits, kills, XP collection, and upgrades
   - Hit-stop + easing tweaks on big impacts
   - Audio hooks (fire, hit, level up, enemy spawn) using Web Audio API

2. **Analytics revival**
   - Port the run logger (LocalStorage + downloadable JSON)
   - Add session timeline charting hooks for future dashboards
   - Track upgrade pick rates, survival duration, damage taken, XP per minute

3. **Settings panel**
   - Recreate toggle surface (auto-collect, damage numbers, colorblind mode stub)
   - Ensure settings persist and integrate with `GameEngine` on boot

**Deliverable:** Juicy gameplay with instrumentation ready for balance passes.

---

### Phase 3: Content & Progression (Week 5-6)
**Goal: Surpass the legacy build with fresh content and meta hooks**

1. **Upgrade expansion**
   - Add 5-8 new upgrades (synergies, defensive options, movement tech)
   - Create rare/legendary tier logic with unique visuals
   - Balance upgrade economy using telemetry

2. **Enemy ecosystem**
   - Ship at least 3 enemy archetypes (rushers, ranged, shields)
   - Introduce mini-boss behaviors and telegraphed attacks
   - Add lane hazards or environmental modifiers

3. **Meta progression**
   - Persistent run tracker and achievements
   - Unlockable mutators or loadouts
   - Daily challenge seed system (stretch)

**Deliverable:** Replayable build with multiple viable strategies and long-term goals.

---

### Phase 4: Platform & Distribution (Week 7-8)
**Goal: Launch a polished build across desktop + mobile surfaces**

1. **Mobile excellence**
   - Tune touch controls, hit targets, and vibration feedback
   - Validate performance on Pi 2B, Android slabs, foldables, and iPad
   - Add install prompts (PWA manifest + service worker if desired)

2. **Social + sharing**
   - Export/share run summaries (image or JSON)
   - Leaderboard proof-of-concept (local first, remote if time allows)
   - Trailer capture and marketing copy

3. **Distribution**
   - Deploy to GitHub Pages / Netlify from the static bundle
   - Submit to itch.io / Newgrounds with legacy build notes
   - Maintain release notes and update cadence

**Deliverable:** Published, accessible, and market-ready neon survivor.

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

1. **Diff & catalog legacy systems**
   - Annotate `lane-shooter-enhanced.html` (commit `2ed446b`) to list UI panels, systems, and helper functions.
   - Identify which modules in `src/` will own each feature (e.g., upgrade drafting → new `systems/upgrade.js`).
   - Capture the color palette, easing values, and constants for reuse in `config.js`.

2. **Port the neon presentation**
   - Update `Renderer` to disable image smoothing, add glow helpers, and expose screen shake API.
   - Mirror the legacy CSS (borders, drop shadows, cards) inside `styles/main.css` while keeping responsive rules.
   - Replace placeholder HUD markup in `index.html` to support stat icons and modal containers.

3. **Rebuild modal + notification framework**
   - Create modal controller modules for upgrades and game-over flows.
   - Implement notification queue with fade-in/out transitions and tie into existing HUD update loop.
   - Ensure keyboard/touch navigation matches the legacy feel (arrow keys, enter, tap).

4. **Reintroduce XP + upgrade loop**
   - Implement XP orb entities, leveling thresholds, and power curve in `GameState`.
   - Port upgrade data definitions from the legacy file and expose them via a draft service.
   - Wire level-up flow to pause engine ticks, present choices, and apply stat modifications.

5. **Restore telemetry + settings**
   - Bring back run logger, ensuring it plays nicely with modular state (consider `analytics/logger.js`).
   - Recreate settings drawer with persistence (auto-collect, damage numbers, colorblind mode stub).
   - Add regression tests or manual checklists to validate logging across desktop + mobile sessions.

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
   - Port the neon CRT styling into the modular renderer.
   - Recreate HUD stat cards, health hearts, and modal containers.
   - Validate layout on desktop, tablet, and foldable breakpoints.

2. **Next Week:**
   - Restore XP orb economy and level thresholds.
   - Implement upgrade draft modal with at least 10 upgrade definitions.
   - Bring back notifications and pause flow during draft selection.

3. **Following Week:**
   - Reintroduce particle systems, hit-stop, and audio cues.
   - Hook up run logger + settings drawer for telemetry.
   - Use captured data to rebalance spawn curves and upgrade weights.

4. **Launch Prep:**
   - Add new upgrades/enemy archetypes to surpass the legacy build.
   - Capture trailer/marketing assets and publish the static bundle.
   - Gather playtest feedback and adapt the roadmap for post-launch updates.

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

## 🚦 Current Priority: Neon Shell & Upgrade Scaffold

The restoration journey hinges on two immediate wins:

- **Visual grounding:** Port the neon canvas treatments, HUD elements, and modal shell so future gameplay work has the correct presentation baseline.
- **Upgrade-ready architecture:** Sketch the upgrade data model, modal flow, and state hooks now; other systems (XP, enemies, telemetry) will plug into it.
- **Documentation trail:** Capture decisions and mappings back to `lane-shooter-enhanced.html` so contributors can follow the same blueprint.

Nailing these sets the stage for the rest of the roadmap and keeps the modern build aligned with the cool graphics and gameplay we’re reviving.

---

**Ready to dig in?** Reach out when you want pairing support on porting the neon renderer or drafting the upgrade system.
