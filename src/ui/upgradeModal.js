export class UpgradeModal {
  constructor(root, onChoose) {
    this.root = root;
    this.onChoose = onChoose;
    this.optionsContainer = this.root.querySelector('.upgrade-options');
  }

  show(options) {
    this.optionsContainer.innerHTML = '';
    options.forEach(option => {
      const card = document.createElement('div');
      card.className = 'upgrade-card';
      card.innerHTML = `
        <div class="upgrade-card-title">${option.name}</div>
        <div class="upgrade-card-desc">${option.desc(this.playerState)}</div>
        <div class="upgrade-level">Level ${option.level + 1}</div>
      `;
      card.onclick = () => {
        this.onChoose(option.key);
        this.hide();
      };
      this.optionsContainer.appendChild(card);
    });
    this.root.classList.add('active');
  }

  hide() {
    this.root.classList.remove('active');
  }

  setPlayerState(playerState) {
    this.playerState = playerState;
  }
}
