# Lane Survivor

A neon-soaked lane-dodging survival shooter tuned for static hosting on low-power hardware like the Raspberry Pi 2B. The current codebase uses modern ES modules and a single `<canvas>` render path, while our design backlog aims to revive the stylish upgrade-driven experience from the early “lane-shooter-enhanced” build.

## ✨ Highlights

- **Zero-build static app** – copy the repository to any web server and you’re up.
- **Responsive HUD & controls** that pivot between desktop keyboards and touch overlays.
- **Performance-first loop** tuned for 60 FPS on Raspberry Pi 2B hardware.
- **Juice-ready particle & camera shake scaffolding** baked into the modular engine for fast visual iteration.
- **Hands-free combat** with auto-fire volleys and lane-aware auto-aim tuned for tighter enemy hitboxes.
- **Live power-up drops and burst waves** that push escalating, multi-lane enemy hordes.
- **Restoration roadmap** aligned with the v0.2 “web artifact” commit: CRT glow, upgrade modals, analytics, and reactive UI panels.

## 🔁 Original Vision Recap (Commit `2ed446b`)

- **Ultra neon presentation** – pixelated canvas with thick borders, glow trails, particle bursts, and CRT-inspired palettes.
- **Diegetic HUD & modals** – health hearts, stat panels, upgrade draft modal, and animated game-over screen.
- **Depth systems already proven** – XP orbs, multi-lane bullet spreads, enemy cohorts, passive/active upgrades, analytics logging, settings toggles.
- **Session storytelling** – notifications, run summaries, and progress tracking baked into the UI.

We are using those files as the creative north star while modernizing the architecture and responsive layout.

## 🚀 Quick Start

```bash
# Serve locally
python3 -m http.server 8000
# → open http://localhost:8000 in your browser
```

To sync onto a Raspberry Pi 2B on your network:

```bash
rsync -avz ./ user@raspberrypi.local:~/lane-survivor/
```

Then point an Android phone or tablet at `http://raspberrypi.local:8000` (replace host/port as needed).

## 🕹️ Controls

- **Desktop:** Arrow / A·D to move, Space / Enter to fire, R to restart.
- **Touch:** Use the on-screen buttons or tap space on a connected keyboard.

## 🛠️ Restoration Roadmap Touchpoints

- Phase 0: Port neon canvas treatments and HUD panels from `lane-shooter-enhanced.html` into the module renderer.
- Phase 1: Reintroduce upgrade drafting, notifications, and end-of-run summaries using the new HUD controller.
- Phase 2: Restore the analytics + settings surfaces, then iterate on fresh upgrade ideas to push beyond the original build.
- Phase 3: Ship a combined responsive + neon build, log new playtest data, and iterate on balance.

Details for each phase live in the docs listed below.

## 📚 Documentation Map

- [`docs/PROJECT_ROADMAP.md`](docs/PROJECT_ROADMAP.md) – macro roadmap with restoration milestones.
- [`docs/QUICK_START.md`](docs/QUICK_START.md) – module structure plus migration notes from the single-file build.
- [`docs/HEALTH_SYSTEM_GUIDE.md`](docs/HEALTH_SYSTEM_GUIDE.md) – copy/paste guide to reinstating the health + i-frame system.
- [`docs/milestone-notes.md`](docs/milestone-notes.md) – playtest log template and sprint checklists.

## 🎯 Current Milestone – Playtest Sprint

1. Deploy the static build to Pi 2B or GitHub Pages and verify the adaptive layout on slabs and foldables.
2. Recreate the neon HUD shell, upgrade modal, and notifications; validate on desktop + touch.
3. Record at least ten survival runs (score, time, perceived lag) inside `docs/milestone-notes.md`.

Share findings in `docs/milestone-notes.md` before the next check-in to keep the restoration roadmap on track.
