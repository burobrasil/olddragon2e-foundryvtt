export default class OD2ItemSheet extends foundry.appv1.sheets.ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ['olddragon2e', 'sheet', 'item'],
      width: 530,
      height: 340,
      tabs: [
        { navSelector: '.race-tabs', contentSelector: '.section', initial: 'about' },
        { navSelector: '.race-ability-tabs', contentSelector: '.section', initial: 'about' },
        { navSelector: '.class-tabs', contentSelector: '.section', initial: 'about' },
        { navSelector: '.class-ability-tabs', contentSelector: '.section', initial: 'about' },
      ],
    });
  }

  get template() {
    return `systems/olddragon2e/templates/sheets/${this.item.type}-sheet.hbs`;
  }

  async getData() {
    const baseData = super.getData();
    const raceAbilities = await this.getItemsFromUUIDs(this.item.system.race_abilities || []);
    const classAbilities = await this.getItemsFromUUIDs(this.item.system.class_abilities || []);

    let sheetData = {
      owner: this.item.isOwner,
      editable: this.isEditable,
      item: baseData.item,
      system: baseData.item.system,
      race_abilities: raceAbilities,
      class_abilities: classAbilities,
      config: CONFIG.olddragon2e,
    };

    this.render();

    return sheetData;
  }

  async activateListeners(html) {
    if (this.isEditable) {
      html.find('.weapon-checkbox').change(this._isWeapon.bind(this));
      html.find('.item-edit').click(this._onItemEdit.bind(this));
      html.find('.item-delete').click(this._onItemDelete.bind(this));
    }

    html.on('drop', this._onDropItem.bind(this));

    super.activateListeners(html);
  }

  async getItemsFromUUIDs(uuids) {
    const items = [];
    for (const uuid of uuids) {
      const item = await fromUuid(uuid);
      if (item) items.push(item);
    }
    return items;
  }

  // Ao soltar um item sob outro item
  async _onDropItem(event) {
    event.preventDefault();

    const receivingItem = this.item;
    let raceAbilities = receivingItem.system.race_abilities || [];
    let classAbilities = receivingItem.system.class_abilities || [];
    const data = JSON.parse(event.originalEvent.dataTransfer.getData('text/plain'));
    const item = await Item.implementation.fromDropData(data);

    if (receivingItem.type === 'race') {
      if (item.type !== 'race_ability') {
        ui.notifications.error('Apenas habilidades de raça podem ser adicionadas.');
        return;
      }
      // Adiciona o UUID do Item
      raceAbilities.push(item.uuid);
      await receivingItem.update({ 'system.race_abilities': raceAbilities });
      await receivingItem.parent.system.updateRaceAbilities(raceAbilities);
    } else if (receivingItem.type === 'class') {
      if (item.type !== 'class_ability') {
        ui.notifications.error('Apenas habilidades de classe podem ser adicionadas.');
        return;
      }
      // Adiciona o UUID do Item
      classAbilities.push(item.uuid);
      await receivingItem.update({ 'system.class_abilities': classAbilities });
      await receivingItem.parent.system.updateClassAbilities(classAbilities);
    } else {
      ui.notifications.error('Apenas raças e classes podem receber habilidades.');
      return;
    }

    this.render();
  }

  // Editar item
  async _onItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest('.item').dataset.itemUuid;

    let item = await fromUuid(itemId);

    item.sheet.render(true);
  }

  // Excluir item
  async _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest('.item').dataset.itemUuid;

    let item = await fromUuid(itemId);

    const raceAbilityTemplate = `
        <form>
            <div>
                <center>
                    Excluir a habilidade de raça <strong>${item.name}</strong>?
                </center>
            </div>
        </form>`;

    const classAbilityTemplate = `
        <form>
            <div>
                <center>
                    Excluir a habilidade de classe <strong>${item.name}</strong>?
                </center>
            </div>
        </form>`;

    let confirmationTemplate;

    if (item.type === 'race_ability') {
      confirmationTemplate = raceAbilityTemplate;
    } else if (item.type === 'class_ability') {
      confirmationTemplate = classAbilityTemplate;
    }

    await Dialog.confirm({
      title: game.i18n.localize('olddragon2e.delete'),
      content: confirmationTemplate,
      yes: async () => {
        if (item.type === 'race_ability') {
          let items = this.item.system.race_abilities.filter((ability) => ability !== item.uuid);
          await this.item.update({ 'system.race_abilities': items });
          this.item.parent && (await this.item.parent.system.updateRaceAbilities(items));
        } else if (item.type === 'class_ability') {
          let items = this.item.system.class_abilities.filter((ability) => ability !== item.uuid);
          await this.item.update({ 'system.class_abilities': items });
          this.item.parent && (await this.item.parent.system.updateClassAbilities(items));
        }
      },
      no: () => {},
    });
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
