import { GAME_CONFIG } from './config.js';
import { GameState } from './game/state.js';
import { Player } from './game/player.js';
import { EnemySpawner } from './game/enemy.js';
import { Renderer } from './game/renderer.js';
import { GameEngine } from './game/engine.js';
import { InputManager } from './game/input.js';
import { HUDController } from './ui/hud.js';
import { ResponsiveLayout } from './ui/responsive.js';

export class LaneSurvivorApp {
  constructor({ canvas, hudRoot, controlsRoot }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });

    this.state = new GameState();
    this.player = new Player(this.state);
    this.spawner = new EnemySpawner(this.state);

    this.metrics = this.computeMetrics();
    this.renderer = new Renderer(this.ctx, this.metrics);

    this.hud = new HUDController(hudRoot);
    this.responsive = new ResponsiveLayout(document.documentElement);

    this.engine = new GameEngine({
      state: this.state,
      player: this.player,
      spawner: this.spawner,
      renderer: this.renderer,
      onTick: (state) => this.hud.update(state),
    });

    this.input = new InputManager(document);
    this.input.setHandlers({
      move: (direction) => this.player.move(direction),
      fire: () => this.player.fire(),
      restart: () => this.restart(),
    });
    this.input.attach();
    this.input.bindTouchControls(controlsRoot);

    window.addEventListener('resize', () => this.handleResize());
    this.handleResize();
    this.hud.update(this.state);
    this.engine.start();
  }

  computeMetrics() {
    const container = this.canvas.parentElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight * 0.6;
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const widthUnits = GAME_CONFIG.canvasPadding * 2 + GAME_CONFIG.lanes * GAME_CONFIG.laneWidth;
    const heightUnits = GAME_CONFIG.canvasPadding * 2 + GAME_CONFIG.playfieldHeight;
    const scale = Math.min(width / widthUnits, height / heightUnits);
    const offsetX = (width - widthUnits * scale) / 2;
    const offsetY = (height - heightUnits * scale) / 2;

    return {
      pixelWidth: width,
      pixelHeight: height,
      scale,
      offsetX,
      offsetY,
      topY: offsetY + GAME_CONFIG.canvasPadding * scale,
      bottomY: offsetY + (GAME_CONFIG.canvasPadding + GAME_CONFIG.playfieldHeight) * scale,
      playfieldHeight: GAME_CONFIG.playfieldHeight,
      bottomPadding: GAME_CONFIG.canvasPadding,
      laneX: (lane) => GAME_CONFIG.canvasPadding + lane * GAME_CONFIG.laneWidth,
      laneCenter: (lane, offset = 0) =>
        GAME_CONFIG.canvasPadding + (lane + 0.5 + offset) * GAME_CONFIG.laneWidth,
    };
  }

  handleResize() {
    this.metrics = this.computeMetrics();
    this.renderer.setMetrics(this.metrics);
  }

  restart() {
    this.state.reset();
    this.spawner.spawnInterval = GAME_CONFIG.enemy.spawnInterval;
    this.engine.lastTime = performance.now();
    this.hud.update(this.state);
  }
}
