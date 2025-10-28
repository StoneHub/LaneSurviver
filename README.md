# Lane Survivor

A responsive lane-dodging survival prototype ready for static hosting on low-power hardware like the Raspberry Pi 2B. The game is implemented with modern ES modules, renders with a single `<canvas>`, and ships with mobile-friendly controls that adapt to folding and slab Android layouts.

## ✨ Highlights

- **Zero-build static app** – just copy the repository to any web server.
- **Responsive HUD & controls** that shift between desktop and touch layouts.
- **Performance-first loop** tuned for 60 FPS on Raspberry Pi 2B hardware.
- **Modular ES6 code** for straightforward tweaking and future expansions.

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

## 📚 Documentation

All reference material now lives in `docs/`:

- [`docs/PROJECT_ROADMAP.md`](docs/PROJECT_ROADMAP.md)
- [`docs/QUICK_START.md`](docs/QUICK_START.md)
- [`docs/HEALTH_SYSTEM_GUIDE.md`](docs/HEALTH_SYSTEM_GUIDE.md)
- [`docs/milestone-notes.md`](docs/milestone-notes.md)

## 🎯 Current Milestone – Playtest Sprint

1. Deploy the static build to your Pi 2B or GitHub Pages and verify the adaptive layout across Android slabs and foldables.
2. Record at least ten survival runs (score, time, perceived lag) inside `docs/milestone-notes.md`.
3. Triage improvements for the next sprint (balance, art, audio) based on those notes.

Share your findings in `docs/milestone-notes.md` before the next check-in to keep the roadmap on track.
