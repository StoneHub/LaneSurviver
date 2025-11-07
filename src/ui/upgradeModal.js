// TODO: Add keyboard controls (1, 2, 3 keys) for faster upgrade selection
// IDEA: Add hover preview showing what stats would look like with the upgrade
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
        <div class="upgrade-card-desc">${option.desc(this.playerState, option.level)}</div>
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
