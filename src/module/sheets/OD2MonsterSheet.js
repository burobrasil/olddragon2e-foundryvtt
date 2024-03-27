import { showDialog } from '../helpers';
import { MonsterJPRoll, MonsterMORoll, MonsterDVRoll, MonsterAttackRoll, MonsterDamageRoll } from '../rolls';

export default class OD2MonsterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/olddragon2e/templates/sheets/monster-sheet.hbs',
      classes: ['olddragon2e', 'sheet', 'monster'],
      width: 600,
      height: 650,
      tabs: [{ navSelector: '.tabs', contentSelector: '.section', initial: 'attacks' }],
    });
  }

  getData() {
    const baseData = super.getData();
    let sheetData = {
      owner: this.actor.isOwner,
      editable: this.isEditable,
      actor: baseData.actor,
      system: baseData.actor.system,
      monster_attack: baseData.actor.system.monster_attack_items,
      config: CONFIG.olddragon2e,
    };

    return sheetData;
  }

  async activateListeners(html) {
    if (this.isEditable) {
      html.find('.item-edit').click(this._onItemEdit.bind(this));
      html.find('.item-delete').click(this._onItemDelete.bind(this));
    }

    // Owner-only Listeners
    if (this.actor.isOwner) {
      html.find('.jp-roll').click(this._onJPRoll.bind(this));
      html.find('.mo-roll').click(this._onMORoll.bind(this));
      html.find('.dv-roll').click(this._onDVRoll.bind(this));
      html.find('.attack-roll').click(this._onAttackRoll.bind(this));
      html.find('.damage-roll').click(this._onDamageRoll.bind(this));
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

  // Rolagem de ataque
  async _onAttackRoll(event) {
    event.preventDefault();
    let target = event.currentTarget;

    const ba = target.dataset.ba;
    const baBonus = target.dataset.baBonus === '';
    const itemID = event.currentTarget.closest('.attack').dataset.itemId;
    const item = this.actor.items.get(itemID);

    const attackRoll = new MonsterAttackRoll(this.actor, item, ba, baBonus);

    await showDialog({
      title: `Rolar Ataque`,
      content: 'systems/olddragon2e/templates/dialog/monsters/attack-roll-dialog.hbs',
      data: {
        formula: attackRoll.printFormula,
      },
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            let adjustment = html.find('#adjustment').val();
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();

            await attackRoll.roll(bonus, adjustment);
            attackRoll.sendMessage(mode, adjustment);
          },
        },
      },
    });
  }

  // Rolagem de dano
  async _onDamageRoll(event) {
    event.preventDefault();
    let target = event.currentTarget;

    const itemID = target.closest('.attack').dataset.itemId;
    const item = this.actor.items.get(itemID);

    const damageRoll = new MonsterDamageRoll(this.actor, item);

    await showDialog({
      title: `Rolar Dano`,
      content: 'systems/olddragon2e/templates/dialog/monsters/damage-roll-dialog.hbs',
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();
            const attackMode = html.find('#attack-mode').val();

            await damageRoll.roll(bonus, attackMode);

            damageRoll.sendMessage(mode);
          },
        },
      },
      render: (html) => {
        const formulaEl = html.find('#formula');
        const attackModeEl = html.find('#attack-mode');

        const updateFormula = () => {
          const selectedAttackMode = attackModeEl.val();
          formulaEl.val(damageRoll.printFormula(selectedAttackMode));
        };

        formulaEl.val(damageRoll.printFormula());
        attackModeEl.val(damageRoll.itemAttackType);

        attackModeEl.change(() => {
          updateFormula();
        });

        updateFormula();
      },
    });
  }

  // Editar item
  _onItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest('.item').dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }

  // Excluir item
  async _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest('.item').dataset.itemId;
    let itemName = this.actor.items.get(itemId).name;

    const confirmationTemplate = `
        <form>
            <div>
                <center>
                    Excluir <strong>${itemName}</strong>?
                </center>
                <br>
            </div>
        </form>`;

    await Dialog.confirm({
      title: game.i18n.localize('olddragon2e.delete'),
      content: confirmationTemplate,
      yes: async () => {
        await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
      },
      no: () => {},
    });
  }
}
