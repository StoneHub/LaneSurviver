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
import { XPManager } from './game/xp.js';
import { UpgradeManager } from './game/upgrades.js';
import { UpgradeModal } from './ui/upgradeModal.js';
import { GameOverModal } from './ui/gameOverModal.js';
import { RunHistory } from './systems/runHistory.js';
import { RunHistoryPanel } from './ui/runHistoryPanel.js';
import { AbilityManager } from './systems/abilities.js';

export class LaneSurvivorApp {
  constructor({ canvas, hudRoot, controlsRoot, historyRoot }) {
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
    this.abilityManager = new AbilityManager(this.state, this.particles);
    this.powerUps = new PowerUpManager({
      state: this.state,
      particles: this.particles,
      abilityManager: this.abilityManager,
    });
    this.xpManager = new XPManager(this.state);

    this.upgradeManager = new UpgradeManager(this.state);
    this.upgradeModal = new UpgradeModal(
      document.getElementById('upgradeModal'),
      (key) => this.engine.applyUpgrade(key)
    );

    // Game Over Modal and Run History
    this.gameOverModal = new GameOverModal(document.getElementById('gameOverModal'));
    this.gameOverModal.setRestartHandler(() => this.restart());
    this.runHistory = new RunHistory();
    this.runHistoryPanel = new RunHistoryPanel(historyRoot);
    this.runHistoryPanel.setClearHandler(() => {
      this.runHistory.clear();
      this.runHistoryPanel.update(this.runHistory);
    });
    this.runHistoryPanel.update(this.runHistory);

    this.engine = new GameEngine({
      state: this.state,
      player: this.player,
      spawner: this.spawner,
      renderer: this.renderer,
      particles: this.particles,
      forces: this.forces,
      powerUps: this.powerUps,
      xpManager: this.xpManager,
      upgradeManager: this.upgradeManager,
      upgradeModal: this.upgradeModal,
      abilityManager: this.abilityManager,
      autoFire: true,
      onFire: () => this.performFire(),
      onTick: (state) => this.onTick(state),
      onGameOver: (state) => this.onGameOver(state),
    });

    this.input = new InputManager(document);
    this.input.setHandlers({
      move: (direction) => this.player.move(direction),
      fire: () => this.handleFire(),
      restart: () => this.restart(),
      ability1: () => this.abilityManager.activate('lane-clear'),
      ability2: () => this.abilityManager.activate('side-blast'),
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

  // Dynamically resize the game canvas and UI elements to fit the viewport.
  handleResize() {
    this.metrics = this.computeMetrics();
    this.renderer.setMetrics(this.metrics);
  }

  onTick(state) {
    this.hud.update(state);
  }

  onGameOver(state) {
    // Save run to history
    this.runHistory.saveRun(state);
    this.runHistoryPanel.update(this.runHistory);

    // Show game over modal
    this.gameOverModal.show(state);
  }

  restart() {
    this.gameOverModal.hide();
    this.state.reset();
    this.particles.clear();
    this.forces.reset();
    this.spawner.spawnInterval = GAME_CONFIG.enemy.spawnInterval;
    this.engine.lastTime = performance.now();
    this.engine.gameOverTriggered = false; // Reset the flag
    this.hud.update(this.state);
    this.engine.start();
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
      ...GAME_CONFIG.effects.playerFire,
    });

    this.forces.addShake(GAME_CONFIG.effects.playerFireShake);
  }
}
