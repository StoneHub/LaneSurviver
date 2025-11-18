export class SettingsModal {
  constructor(root, state) {
    this.root = root;
    this.state = state;
    this.autoCollectToggle = root.querySelector('#autoCollectToggle');
    this.passThroughInput = root.querySelector('#passThroughLimit');
    this.closeBtn = root.querySelector('#closeSettingsBtn');

    this.bindEvents();
    this.syncUI();
  }

  bindEvents() {
    this.autoCollectToggle.addEventListener('change', (e) => {
      this.state.settings.autoCollectXP = e.target.checked;
    });

    this.passThroughInput.addEventListener('input', (e) => {
      const value = parseInt(e.target.value, 10);
      if (!isNaN(value) && value >= 0) {
        this.state.settings.passThroughLimit = value;
      }
    });

    this.closeBtn.addEventListener('click', () => {
      this.hide();
    });
  }

  syncUI() {
    if (this.state.settings) {
      this.autoCollectToggle.checked = this.state.settings.autoCollectXP;
      this.passThroughInput.value = this.state.settings.passThroughLimit;
    }
  }

  show() {
    this.syncUI();
    this.root.classList.add('active');
  }

  hide() {
    this.root.classList.remove('active');
  }
}
