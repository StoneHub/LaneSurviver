# Playtest Sprint Notes

Use this log to capture observations while running the Raspberry Pi-hosted build.

## Session Template

- **Date & time:**
- **Device:** (Pi 2B + browser / Android phone model)
- **Average FPS / smoothness:**
- **Survival time range:**
- **Highest score:**
- **Notable issues:**
- **Ideas for next sprint:**

## Quick Commands

```bash
# Serve the static build locally
python3 -m http.server 8000

# Sync to a Raspberry Pi (replace HOST)
rsync -avz ./ HOST:~/lane-survivor/
```

Document at least ten runs before the next milestone review.

## Restoration Checklist (per session)

- Neon presentation matches legacy build (borders, glow, particles).
- Power-up drops spawn, magnet toward the player, and apply stat changes.
- Upgrade draft surfaces correctly (modal opens, keyboard/touch navigation, options apply).
- Notifications and run summaries trigger at the right moments.
- Settings toggles persist across reloads (auto-collect, damage numbers, etc.).
- Burst waves escalate into multi-lane cohorts without tanking FPS.
- Auto-fire cadence feels responsive and lane auto-aim consistently tags the closest threat.
- HUD reports death cause, lane, and timestamp after each run.
- Analytics log captures survival time, upgrade picks, and damage taken.
