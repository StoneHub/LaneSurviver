import { UI_CONFIG } from '../config.js';

export class ResponsiveLayout {
  constructor(root) {
    this.root = root;
    this.onResize = this.updateLayout.bind(this);
    this.updateLayout();
    window.addEventListener('resize', this.onResize);
  }

  updateLayout() {
    if (!this.root) return;
    const mode = window.innerWidth <= UI_CONFIG.mobileBreakpoint ? 'mobile' : 'desktop';
    this.root.dataset.layout = mode;
  }

  destroy() {
    window.removeEventListener('resize', this.onResize);
  }
}
