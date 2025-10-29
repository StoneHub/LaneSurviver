import { GAME_CONFIG } from './config.js';
import { GameState } from './game/state.js';
import { Player } from './game/player.js';
import { EnemySpawner } from './game/enemy.js';
import { Renderer } from './game/renderer.js';
import { GameEngine } from './game/engine.js';
import { InputManager } from './game/input.js';
import { HUDController } from './ui/hud.js';
import { ResponsiveLayout } from './ui/responsive.js';
import { ParticleSystem } from './systems/particles.js';
import { ForceField } from './physics/forces.js';
import { PowerUpManager } from './game/powerup.js';

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
    this.particles = new ParticleSystem();
    this.forces = new ForceField();
    this.powerUps = new PowerUpManager({
      state: this.state,
      particles: this.particles,
    });

    this.engine = new GameEngine({
      state: this.state,
      player: this.player,
      spawner: this.spawner,
      renderer: this.renderer,
      particles: this.particles,
      forces: this.forces,
      powerUps: this.powerUps,
      autoFire: true,
      onFire: () => this.performFire(),
      onTick: (state) => this.hud.update(state),
    });

    this.input = new InputManager(document);
    this.input.setHandlers({
      move: (direction) => this.player.move(direction),
      fire: () => this.handleFire(),
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
    this.particles.clear();
    this.forces.reset();
    this.spawner.spawnInterval = GAME_CONFIG.enemy.spawnInterval;
    this.engine.lastTime = performance.now();
    this.hud.update(this.state);
  }

  handleFire() {
    this.performFire();
  }

  performFire() {
    const result = this.player.fire();
    if (!result) return;

    const { lane, muzzleY } = result;
    const playerState = this.state.player;
    const laneProgress = playerState.laneProgress || 0;
    const laneCenter =
      GAME_CONFIG.canvasPadding +
      (lane + laneProgress + 0.5) * GAME_CONFIG.laneWidth;

    this.particles.emitBurst({
      x: laneCenter,
      y: muzzleY,
      count: 8,
      palette: ['#ffe566', '#fff6a8', '#ffb347'],
      speed: [160, 240],
      angle: -Math.PI / 2,
      spread: Math.PI / 6,
      life: [140, 220],
      size: [1.5, 3.5],
      gravity: 200,
      drag: 0.82,
      blend: 'lighter',
      fadePower: 1.2,
    });

    this.forces.addShake({ magnitude: 3, duration: 90 });
  }
}
