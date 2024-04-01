export default class OD2ItemSheet extends ItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      width: 530,
      height: 340,
      classes: ['olddragon2e', 'sheet', 'item'],
    });
  }

  get template() {
    return `systems/olddragon2e/templates/sheets/${this.item.type}-sheet.hbs`;
  }

  getData() {
    const baseData = super.getData();
    let sheetData = {
      owner: this.item.isOwner,
      editable: this.isEditable,
      item: baseData.item,
      system: baseData.item.system,
      config: CONFIG.olddragon2e,
    };

    return sheetData;
  }

  async activateListeners(html) {
    if (this.isEditable) {
      html.find('.weapon-checkbox').change(this._isWeapon.bind(this));
    }

    super.activateListeners(html);
  }

  async _isWeapon(event) {
    setTimeout(() => {
      if (event.currentTarget.checked) {
        this.item.update({
          'system.description': 'arma',
          'system.damage': '',
        });
      }
    }, 0);
  }
}
