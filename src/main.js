import { LaneSurvivorApp } from './app.js';

window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('game-canvas');
  const hudRoot = document.querySelector('[data-hud]');
  const controlsRoot = document.querySelector('[data-touch-controls]');

  if (!canvas || !hudRoot) {
    console.error('Lane Survivor app failed to boot: missing DOM nodes.');
    return;
  }

  const app = new LaneSurvivorApp({ canvas, hudRoot, controlsRoot });
  window.laneSurvivor = app;
});
