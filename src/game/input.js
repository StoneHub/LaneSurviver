const MOVE_LEFT_KEYS = new Set(['ArrowLeft', 'a', 'A']);
const MOVE_RIGHT_KEYS = new Set(['ArrowRight', 'd', 'D']);
const FIRE_KEYS = new Set([' ', 'Spacebar', 'Space', 'Enter']);
const RESTART_KEYS = new Set(['r', 'R']);

export class InputManager {
  constructor(target = document) {
    this.target = target;
    this.handlers = {
      move: () => {},
      fire: () => {},
      restart: () => {},
    };
    this.keydown = this.onKeyDown.bind(this);
    this.pointerDown = this.onPointerDown.bind(this);
  }

  setHandlers(handlers) {
    this.handlers = { ...this.handlers, ...handlers };
  }

  attach() {
    this.target.addEventListener('keydown', this.keydown);
    this.target.addEventListener('pointerdown', this.pointerDown);
  }

  detach() {
    this.target.removeEventListener('keydown', this.keydown);
    this.target.removeEventListener('pointerdown', this.pointerDown);
  }

  bindTouchControls(container) {
    if (!container) return;
    container.querySelectorAll('[data-action]').forEach((element) => {
      element.addEventListener('pointerdown', (event) => {
        this.handleAction(element.dataset.action, event);
      });
      element.addEventListener('pointerup', (event) => {
        this.handleAction(`${element.dataset.action}-up`, event);
      });
    });
  }

  onKeyDown(event) {
    if (MOVE_LEFT_KEYS.has(event.key)) {
      event.preventDefault();
      this.handlers.move(-1);
    } else if (MOVE_RIGHT_KEYS.has(event.key)) {
      event.preventDefault();
      this.handlers.move(1);
    } else if (FIRE_KEYS.has(event.key)) {
      event.preventDefault();
      this.handlers.fire();
    } else if (RESTART_KEYS.has(event.key)) {
      event.preventDefault();
      this.handlers.restart();
    }
  }

  onPointerDown(event) {
    const actionElement = event.target.closest('[data-action]');
    if (!actionElement) return;
    this.handleAction(actionElement.dataset.action, event);
  }

  handleAction(action, event) {
    switch (action) {
      case 'move-left':
        this.handlers.move(-1);
        break;
      case 'move-right':
        this.handlers.move(1);
        break;
      case 'fire':
        this.handlers.fire();
        break;
      case 'restart':
        this.handlers.restart();
        break;
      default:
        break;
    }
    event.preventDefault();
  }
}
