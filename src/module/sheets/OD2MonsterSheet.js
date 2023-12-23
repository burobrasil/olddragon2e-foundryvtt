import { showDialog } from '../helpers';
import { MonsterJPRoll, MonsterMORoll, MonsterDVRoll } from '../rolls';

export default class OD2MonsterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/olddragon2e/templates/sheets/monster-sheet.hbs',
      classes: ['olddragon2e', 'sheet', 'monster'],
      width: 600,
      height: 650,
      tabs: [{ navSelector: '.tabs', contentSelector: '.section', initial: 'skills' }],
    });
  }

  getData() {
    const baseData = super.getData();
    let sheetData = {
      owner: this.actor.isOwner,
      editable: this.isEditable,
      actor: baseData.actor,
      system: baseData.actor.system,
      config: CONFIG.olddragon2e,
    };

    return sheetData;
  }

  activateListeners(html) {
    // Owner-only Listeners
    if (this.actor.isOwner) {
      html.find('.jp-roll').click(this._onJPRoll.bind(this));
      html.find('.mo-roll').click(this._onMORoll.bind(this));
      html.find('.dv-roll').click(this._onDVRoll.bind(this));
    }

    super.activateListeners(html);
  }

  // Teste de JP | Jogada de Proteção
  async _onJPRoll(event) {
    event.preventDefault();

    const jpRoll = new MonsterJPRoll(this.actor);

    await showDialog({
      title: `Teste de Jogada de Proteção`,
      content: 'systems/olddragon2e/templates/dialog/monsters/jp-roll-dialog.hbs',
      data: {
        formula: jpRoll.formula(),
      },
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            let adjustment = html.find('#adjustment').val();
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();
            await jpRoll.roll(bonus);

            jpRoll.sendMessage(mode, adjustment);
          },
        },
      },
    });
  }

  // Teste de MO | Moral
  async _onMORoll(event) {
    event.preventDefault();

    const moRoll = new MonsterMORoll(this.actor);

    await showDialog({
      title: `Teste de Moral`,
      content: 'systems/olddragon2e/templates/dialog/monsters/mo-roll-dialog.hbs',
      data: {
        formula: moRoll.formula(),
      },
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            let adjustment = html.find('#adjustment').val();
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();
            await moRoll.roll(bonus);

            moRoll.sendMessage(mode, adjustment);
          },
        },
      },
    });
  }

  // Rolagem de Dado de Vida (DV)
  async _onDVRoll(event) {
    event.preventDefault();

    const dvRoll = new MonsterDVRoll(this.actor);

    await showDialog({
      title: `Rolar Dado de Vida`,
      content: 'systems/olddragon2e/templates/dialog/monsters/dv-roll-dialog.hbs',
      data: {
        formula: dvRoll.formula(),
      },
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();
            await dvRoll.roll(bonus);

            const hp = dvRoll.calculateHp();

            dvRoll.sendMessage(mode, hp);
            await dvRoll.updateHp();
          },
        },
      },
    });
  }
}
