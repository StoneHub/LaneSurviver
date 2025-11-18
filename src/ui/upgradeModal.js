// TODO: Add keyboard controls (1, 2, 3 keys) for faster upgrade selection
// IDEA: Add hover preview showing what stats would look like with the upgrade
export class UpgradeModal {
  constructor(root, onChoose) {
    this.root = root;
    this.onChoose = onChoose;
    this.optionsContainer = this.root.querySelector('.upgrade-options');
    this.timerBar = document.createElement('div');
    this.timerBar.className = 'upgrade-timer-bar';
    this.root.querySelector('.upgrade-panel').prepend(this.timerBar);

    this.boundHandleKey = this.handleKey.bind(this);
  }

  handleKey(e) {
    if (!this.root.classList.contains('active')) return;

    const key = parseInt(e.key);
    if (key >= 1 && key <= 3) {
      const index = key - 1;
      const cards = this.optionsContainer.querySelectorAll('.upgrade-card');
      if (cards[index]) {
        cards[index].click();
      }
    }
  }

  show(options) {
    this.optionsContainer.innerHTML = '';
    options.forEach((option, index) => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.dataset.key = index + 1;
      card.innerHTML = `
        <div class="upgrade-card-title">${option.name}</div>
        <div class="upgrade-card-desc">${option.desc(this.playerState, option.level)}</div>
        <div class="upgrade-level">Level ${option.level + 1}</div>
      `;
      card.onclick = () => {
        try {
          if (typeof this.onChoose === 'function') {
            this.onChoose(option.key);
            // Note: applyUpgrade in engine.js will call hide()
          } else {
            console.error('[UpgradeModal] onChoose is not a function!');
          }
        } catch (error) {
          console.error('[UpgradeModal] Error in onChoose callback:', error);
          this.hide();
        }
      };
      this.optionsContainer.appendChild(card);
    });
    this.root.classList.add('active');
    window.addEventListener('keydown', this.boundHandleKey);
  }

  updateTimer(progress) {
    this.timerBar.style.width = `${progress * 100}%`;
    // Change color based on urgency
    if (progress < 0.3) {
      this.timerBar.style.backgroundColor = '#ef4444';
    } else {
      this.timerBar.style.backgroundColor = '#fbbf24';
    }
  }

  highlightOption(index) {
    const cards = this.optionsContainer.querySelectorAll('.upgrade-card');
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add('highlight');
      } else {
        card.classList.remove('highlight');
      }
    });
  }

  hide() {
    this.root.classList.remove('active');
    window.removeEventListener('keydown', this.boundHandleKey);
  }

  setPlayerState(playerState) {
    this.playerState = playerState;
  }
}
