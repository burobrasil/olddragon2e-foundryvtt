import { showDialog } from '../helpers';
import { AttackRoll, UnarmedAttackRoll, DamageRoll, KnockoutRoll, StatRoll, JPRoll, BARoll } from '../rolls';

export default class OD2CharacterSheet extends foundry.appv1.sheets.ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: 'systems/olddragon2e/templates/sheets/character-sheet.hbs',
      classes: ['olddragon2e', 'sheet', 'character'],
      width: 820,
      height: 780,
      tabs: [{ navSelector: '.tabs', contentSelector: '.section', initial: 'attacks' }],
    });
  }

  async getData() {
    const baseData = super.getData();

    // Magias por círculo
    const spellItems = baseData.actor.system.spell_items;
    const spellByCircle = {};

    // Inicializa círculos (1º ao 9º)
    for (let i = 1; i <= 9; i++) {
      spellByCircle[i] = {
        circle: i,
        spells: [],
      };
    }

    // Distribui magias nos círculos correspondentes
    if (spellItems && spellItems.length > 0) {
      spellItems.forEach((spell) => {
        // Determina o círculo da magia (Arcana, Divina, Necromante ou Ilusionista)
        let circle = null;

        if (spell.system.arcane && spell.system.arcane !== 'null' && parseInt(spell.system.arcane) > 0) {
          circle = parseInt(spell.system.arcane);
        } else if (spell.system.divine && spell.system.divine !== 'null' && parseInt(spell.system.divine) > 0) {
          circle = parseInt(spell.system.divine);
        } else if (
          spell.system.necromancer &&
          spell.system.necromancer !== 'null' &&
          parseInt(spell.system.necromancer) > 0
        ) {
          circle = parseInt(spell.system.necromancer);
        } else if (
          spell.system.illusionist &&
          spell.system.illusionist !== 'null' &&
          parseInt(spell.system.illusionist) > 0
        ) {
          circle = parseInt(spell.system.illusionist);
        }

        // Vincula a magia ao círculo correspondente
        if (circle && spellByCircle[circle]) {
          spellByCircle[circle].spells.push(spell);
        } else {
          // Fallback: Se não possui círculo definido, vincula ao 1º círculo
          if (spellByCircle[1]) {
            spellByCircle[1].spells.push(spell);
          }
        }
      });
    }

    let sheetData = {
      owner: this.actor.isOwner,
      editable: this.isEditable,
      actor: baseData.actor,
      system: baseData.actor.system,
      race_abilities: baseData.actor.system.race_abilities,
      class_abilities: baseData.actor.system.class_abilities,
      equipped_items: baseData.actor.system.equipped_items,
      attack: baseData.actor.system.attack_items,
      weapon: baseData.actor.system.weapon_items,
      armor: baseData.actor.system.armor_items,
      shield: baseData.actor.system.shield_items,
      misc: baseData.actor.system.misc_items,
      container: baseData.actor.system.container_items,
      vehicle: baseData.actor.system.vehicle_items,
      spell: baseData.actor.system.spell_items,
      spell_by_circle: spellByCircle,
      config: CONFIG.olddragon2e,
    };

    this.render();

    return sheetData;
  }

  async _onDrop(event) {
    const data = JSON.parse(event.dataTransfer.getData('text/plain'));
    if (data.type === 'Folder') {
      event.preventDefault();
    } else if (data.type === 'Item') {
      this._onDropItem(event, data);
    }
  }

  async _onDropItem(event, data) {
    const item = await Item.implementation.fromDropData(data);

    if (item.type === 'race') {
      if (this.actor.system.race !== null) {
        ui.notifications.error('Este personagem já possui uma raça. Remova a raça atual antes de adicionar uma nova.');
        return;
      }
    }

    if (item.type === 'race_ability') {
      ui.notifications.error(
        'Habilidades de raça não podem ser adicionadas diretamente ao personagem. Adicione-as à raça do personagem.',
      );
      return;
    }

    if (item.type === 'class') {
      if (this.actor.system.race === null) {
        ui.notifications.error(
          'Este personagem ainda não possui uma raça definida. Adicione a raça antes de adicionar a classe.',
        );
        return;
      }
      if (this.actor.system.class !== null) {
        ui.notifications.error(
          'Este personagem já possui uma classe. Remova a classe atual antes de adicionar uma nova.',
        );
        return;
      }

      const raceName = this.actor.system.race.name;
      let classRestrictions = item.system.restrictions.races;

      // Dividir a string de raças em um array de raças individuais
      if (classRestrictions.length > 0 && typeof classRestrictions[0] === 'string') {
        classRestrictions = classRestrictions[0].split(',').map((race) => race.trim());
      }

      // Verificar se classRestrictions contém apenas uma string vazia e tratá-la como um array vazio
      if (classRestrictions.length === 1 && classRestrictions[0] === '') {
        classRestrictions = [];
      }

      if (classRestrictions.length > 0 && !classRestrictions.includes(raceName)) {
        ui.notifications.error(
          `Para vincular a classe ${
            item.name
          }, o personagem deve ser de uma das seguintes raças: ${classRestrictions.join(', ')}.`,
        );
        return;
      }
    }

    if (item.type === 'class_ability') {
      ui.notifications.error(
        'Habilidades de classe não podem ser adicionadas diretamente ao personagem. Adicione-as à classe do personagem.',
      );
      return;
    }

    await super._onDropItem(event, data);

    if (item.type === 'race') {
      await this.actor.system.syncRaceAbilities();
    }

    if (item.type === 'class') {
      await this.actor.system.syncClassAbilities();
    }
  }

  async activateListeners(html) {
    if (this.isEditable) {
      html.find('.item-create').click(this._onItemCreate.bind(this));
      html.find('.item-edit').click(this._onItemEdit.bind(this));
      html.find('.item-equip').click(this._onItemEquip.bind(this));
      html.find('.item-update-quantity').change(this._onItemUpdateQuantity.bind(this));
      html.find('.item-delete').click(this._onItemDelete.bind(this));
      html.find('input[name="system.current_xp"]').change(this._onCurrentXpChange.bind(this));
    }

    // Owner-only Listeners
    if (this.actor.isOwner) {
      html.find('.attack-roll').click(this._onAttackRoll.bind(this));
      html.find('.unarmed-attack-roll').click(this._onUnarmedAttackRoll.bind(this));
      html.find('.damage-roll').click(this._onDamageRoll.bind(this));
      html.find('.knockout-roll').click(this._onKnockoutRoll.bind(this));
      html.find('.spell-cast').click(this._onSpellCast.bind(this));
      html.find('.memorized-toggle').change(this._onSpellMemorizedToggle.bind(this));
      html.find('.slots-select').change(this._onSpellSlotsChange.bind(this));
      html.find('.spell-use-checkbox').change(this._onSpellUseCheckboxChange.bind(this));
      html.find('.class-ability-use-checkbox').change(this._onClassAbilityUseCheckboxChange.bind(this));
      html.find('.stat-roll').click(this._onStatRoll.bind(this));
      html.find('.jp-roll').click(this._onJPRoll.bind(this));
      html.find('.ba-roll').click(this._onBARoll.bind(this));
    }

    super.activateListeners(html);
  }

  jpStatsMap = {
    jpd: 'destreza',
    jpc: 'constituicao',
    jps: 'sabedoria',
  };

  jpModMap = {
    jpd: 'mod_destreza',
    jpc: 'mod_constituicao',
    jps: 'mod_sabedoria',
  };

  statsJpMap = {
    destreza: 'jpd',
    constituicao: 'jpc',
    sabedoria: 'jps',
  };

  stats = {
    forca: 'forca',
    destreza: 'destreza',
    constituicao: 'constituicao',
    inteligencia: 'inteligencia',
    sabedoria: 'sabedoria',
    carisma: 'carisma',
  };

  // Notificação de level up
  _onCurrentXpChange(event) {
    event.preventDefault();
    const input = event.currentTarget;
    const newValue = parseInt(input.value);

    this.actor.update({ 'system.current_xp': newValue }).then(() => {
      this.actor.system._levelUp();
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
    if (!item) return;

    const attackRoll = new AttackRoll(this.actor, item, ba, baBonus);

    await showDialog({
      title: `Rolar Ataque`,
      content: 'systems/olddragon2e/templates/dialog/characters/attack-roll-dialog.hbs',
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

  // Rolagem de ataque desarmado
  async _onUnarmedAttackRoll(event) {
    event.preventDefault();

    const unarmedAttackRoll = new UnarmedAttackRoll(this.actor);

    await showDialog({
      title: `Rolar Ataque Desarmado`,
      content: 'systems/olddragon2e/templates/dialog/characters/unarmed-attack-roll-dialog.hbs',
      data: {
        formula: unarmedAttackRoll.printFormula,
      },
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            let adjustment = html.find('#adjustment').val();
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();

            await unarmedAttackRoll.roll(bonus, adjustment);
            unarmedAttackRoll.sendMessage(mode, adjustment);
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
    if (!item) return;

    const damageRoll = new DamageRoll(this.actor, item);

    await showDialog({
      title: `Rolar Dano`,
      content: 'systems/olddragon2e/templates/dialog/characters/damage-roll-dialog.hbs',
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

  // Rolagem de chance de nocaute
  async _onKnockoutRoll(event) {
    event.preventDefault();

    const knockoutRoll = new KnockoutRoll(this.actor);

    await showDialog({
      title: `Chance de nocaute`,
      content: 'systems/olddragon2e/templates/dialog/characters/knockout-roll-dialog.hbs',
      data: {
        formula: knockoutRoll.printFormula,
      },
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();

            await knockoutRoll.roll(bonus);
            knockoutRoll.sendMessage(mode);
          },
        },
      },
    });
  }

  // Lançar magia
  async _onSpellCast(event, options = {}) {
    event.preventDefault();
    const itemID = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemID);
    if (!item) return;

    // Verifica se o item é uma magia e se ela está memorizada
    if (item.type === 'spell') {
      const spellFlags = item.getFlag('olddragon2e', 'spell') || {};
      if (!spellFlags.memorized) {
        ui.notifications.warn(`A magia "${item.name}" não está preparada. Memorize a magia para poder lançá-la.`);
        return;
      }
      if (!spellFlags.slots || Number(spellFlags.slots) < 1) {
        ui.notifications.warn('É necessário determinar a quantidade de usos de uma magia para poder lançá-la.');
        return;
      }
    }

    const chatTemplate = 'systems/olddragon2e/templates/chat/spell-chat.hbs';
    let chatData = {
      user: game.user.id,
      speaker: { alias: this.actor.name },
      sound: 'sounds/dice.wav',
    };
    let cardData = {
      name: item.name,
      owner: this.actor.id,
      id: item._id,
      system: item.system,
    };
    chatData.content = await foundry.applications.handlebars.renderTemplate(chatTemplate, cardData);

    if (item.type === 'spell') {
      const spellFlags = item.getFlag('olddragon2e', 'spell') || {};
      const slots = Number(spellFlags.slots) || 0;
      let dailyUses = foundry.utils.duplicate(spellFlags['daily-uses'] || {});
      let used = false;

      // Só marca o uso se não for um lançamento via checkbox já marcado
      if (!options.skipUsage) {
        for (let i = 1; i <= slots; i++) {
          if (!dailyUses[i]) {
            dailyUses[i] = true;
            used = true;
            break;
          }
        }
        if (slots > 0 && used) {
          await item.update({ 'flags.olddragon2e.spell.daily-uses': dailyUses });
        }
        if (slots > 0 && !used) {
          ui.notifications.warn(`Não há mais usos disponíveis para a magia "${item.name}".`);
          return;
        }
      }
    }

    return ChatMessage.create(chatData);
  }

  // Memorizar magia
  async _onSpellMemorizedToggle(event) {
    const input = event.currentTarget;
    const itemId = input.dataset.itemId;
    const item = this.actor.items.get(itemId);
    const memorized = input.checked;

    // Ao desmarcar, limpa slots e usos
    let update = { 'flags.olddragon2e.spell.memorized': memorized };
    if (!memorized) {
      update['flags.olddragon2e.spell.slots'] = '';
      update['flags.olddragon2e.spell.daily-uses'] = {};
    }
    await item.update(update);
  }

  // Definir a quantidade de slots disponíveis
  async _onSpellSlotsChange(event) {
    const select = event.currentTarget;
    const itemId = select.dataset.itemId;
    const item = this.actor.items.get(itemId);
    const slots = select.value ? Number(select.value) : '';

    // Ao alterar a quantidade de slots, zera os usos
    await item.update({
      'flags.olddragon2e.spell.slots': slots,
      'flags.olddragon2e.spell.daily-uses': {},
    });
  }

  // Usos diários de magia
  async _onSpellUseCheckboxChange(event) {
    const checkbox = event.currentTarget;
    const itemId = checkbox.dataset.itemId;
    const useIndex = checkbox.dataset.useIndex;
    const item = this.actor.items.get(itemId);

    // Atualiza apenas o uso marcado
    const spellFlags = item.getFlag('olddragon2e', 'spell') || {};
    let dailyUses = foundry.utils.duplicate(spellFlags['daily-uses'] || {});
    dailyUses[useIndex] = checkbox.checked;

    await item.update({ 'flags.olddragon2e.spell.daily-uses': dailyUses });

    // Lança a magia se o checkbox foi marcado
    if (checkbox.checked) {
      // Cria um evento "falso" para reaproveitar o método _onSpellCast
      const itemElem = checkbox.closest('.item');
      if (itemElem) {
        // Simula um evento de clique no botão "Lançar"
        const fakeEvent = new Event('click');
        Object.defineProperty(fakeEvent, 'currentTarget', {
          writable: false,
          value: itemElem.querySelector('.spell-cast'),
        });
        await this._onSpellCast(fakeEvent, { skipUsage: true });
      } else {
        // Se não encontrar o elemento .item, chama diretamente o método
        await this._onSpellCast(
          {
            preventDefault: () => {},
            currentTarget: { closest: () => ({ dataset: { itemId } }) },
          },
          { skipUsage: true },
        );
      }
    }
  }

  // Usos diários de habilidade de classe
  async _onClassAbilityUseCheckboxChange(event) {
    const checkbox = event.currentTarget;
    const abilityId = checkbox.dataset.abilityId;
    const useIndex = checkbox.dataset.useIndex;
    const ability = this.actor.items.get(abilityId);

    // Atualiza apenas o uso marcado/desmarcado
    const abilityFlags = ability.getFlag('olddragon2e', 'daily-uses') || {};
    let dailyUses = foundry.utils.duplicate(abilityFlags);
    dailyUses[useIndex] = checkbox.checked;

    await ability.update({ 'flags.olddragon2e.daily-uses': dailyUses });

    // Notifica o uso da habilidade se o checkbox foi marcado
    if (checkbox.checked) {
      ChatMessage.create({
        user: game.user.id,
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        content: `<div class="title">Usou a habilidade:<br><strong>${ability.name}</strong></div>`,
      });
    }
  }

  // Teste de Atributos (Força; Destreza; Constituição; Inteligência; Sabedoria; Carisma)
  async _onStatRoll(event) {
    event.preventDefault();
    let target = event.currentTarget;
    let statLabel = target.dataset.statLabel;
    const statName = target.dataset.stat;

    const statRoll = new StatRoll(this.actor, statLabel, statName);

    await showDialog({
      title: `Teste de ${statLabel}`,
      content: 'systems/olddragon2e/templates/dialog/characters/stat-roll-dialog.hbs',
      data: {
        formula: statRoll.formula(),
      },
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            let adjustment = html.find('#adjustment').val();
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();
            await statRoll.roll(bonus);

            statRoll.sendMessage(mode, adjustment);
          },
        },
      },
    });
  }

  // Teste de JP | Jogada de Proteção (JPD; JPC; JPS)
  async _onJPRoll(event) {
    event.preventDefault();
    let target = event.currentTarget;
    let jpLabel = target.dataset.jpLabel;
    const jpName = target.dataset.jp;

    const jpRoll = new JPRoll(this.actor, jpLabel, jpName);

    await showDialog({
      title: `Teste de ${jpLabel}`,
      content: 'systems/olddragon2e/templates/dialog/characters/jp-roll-dialog.hbs',
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

  // Teste de BA | Base de Ataque (BAC; BAD)
  async _onBARoll(event) {
    event.preventDefault();
    let target = event.currentTarget;

    const ba = target.dataset.ba;
    const baLabel = target.dataset.baLabel;

    const baRoll = new BARoll(this.actor, ba);

    await showDialog({
      title: `Teste de ${baLabel}`,
      content: 'systems/olddragon2e/templates/dialog/characters/ba-roll-dialog.hbs',
      data: {
        formula: baRoll.printFormula,
      },
      buttons: {
        roll: {
          icon: "<i class='fa-solid fa-dice-d20'></i>",
          label: 'Rolar',
          callback: async (html) => {
            let adjustment = html.find('#adjustment').val();
            const bonus = html.find('#bonus').val();
            const mode = html.find('#rollMode').val();

            await baRoll.roll(bonus, adjustment);
            baRoll.sendMessage(mode, adjustment);
          },
        },
      },
    });
  }

  // Rolar item (não utilizado)
  _onItemRoll(event) {
    const itemID = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemID);

    item.roll();
  }

  // Criar item
  _onItemCreate(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemType = element.dataset.type;
    let itemName = '';

    switch (itemType) {
      case 'weapon':
        itemName = 'Nova Arma';
        break;
      case 'armor':
        itemName = 'Nova Armadura';
        break;
      case 'shield':
        itemName = 'Novo Escudo';
        break;
      case 'misc':
        itemName = 'Novo Item';
        break;
      case 'container':
        itemName = 'Novo Recipiente/Vasilhame';
        break;
      case 'vehicle':
        itemName = 'Nova Montaria/Transporte';
        break;
      case 'spell':
        itemName = 'Nova Magia';
    }

    let itemData = {
      name: itemName,
      type: itemType,
    };

    return this.actor.createEmbeddedDocuments('Item', [itemData]);
  }

  // Editar item
  _onItemEdit(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest('.item').dataset.itemId;
    let item = this.actor.items.get(itemId);

    item.sheet.render(true);
  }

  // Equipar/Desequipar item
  async _onItemEquip(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const itemId = element.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemId);

    let updateObject = {
      'system.is_equipped': !item.system.is_equipped,
    };

    await item.update(updateObject);
  }

  // Alterar quantidade
  async _onItemUpdateQuantity(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest('.item').dataset.itemId;
    let item = this.actor.items.get(itemId);
    let newQuantity = element.value;

    if (newQuantity <= 0) {
      newQuantity = 1;
    }

    const updateObject = {};
    updateObject[`system.quantity`] = newQuantity;

    await item.update(updateObject);
  }

  // Excluir habilidades de raça
  async removeRaceAbilities() {
    const raceAbilities = this.actor.items.filter((item) => item.type === 'race_ability');
    for (const ability of raceAbilities) {
      await this.actor.deleteEmbeddedDocuments('Item', [ability.id]);
    }
  }

  // Excluir habilidades de classe
  async removeClassAbilities() {
    const classAbilities = this.actor.items.filter((item) => item.type === 'class_ability');
    for (const ability of classAbilities) {
      await this.actor.deleteEmbeddedDocuments('Item', [ability.id]);
    }
  }

  // Excluir item
  async _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest('.item').dataset.itemId;
    let itemName = this.actor.items.get(itemId).name;
    let itemType = this.actor.items.get(itemId).type;

    const standardTemplate = `
        <form>
            <div>
                <center>
                    Excluir <strong>${itemName}</strong>?
                </center>
            </div>
        </form>`;

    const raceTemplate = `
        <form>
            <div>
                <center>
                    Excluir a raça <strong>${itemName}</strong>?
                </center>
                <br>
                <center>
                    Ao excluir a raça, todas as características e habilidades de raça serão removidas do personagem.
                </center>
            </div>
        </form>`;

    const classTemplate = `
        <form>
            <div>
                <center>
                    Excluir a classe <strong>${itemName}</strong>?
                </center>
                <br>
                <center>
                    Ao excluir a classe, todas as características e habilidades de classe serão removidas do personagem.
                </center>
            </div>
        </form>`;

    let confirmationTemplate;

    if (itemType === 'race') {
      const characterClass = this.actor.system.class;
      if (characterClass) {
        const classRestrictions = characterClass.system.restrictions.races;
        if (classRestrictions.length > 0 && classRestrictions.includes(itemName)) {
          ui.notifications.error(
            `Não é possível excluir a raça ${itemName} enquanto a classe ${characterClass.name} estiver vinculada ao personagem.`,
          );
          return;
        }
      }
      confirmationTemplate = raceTemplate;
    } else if (itemType === 'class') {
      confirmationTemplate = classTemplate;
    } else {
      confirmationTemplate = standardTemplate;
    }

    await Dialog.confirm({
      title: game.i18n.localize('olddragon2e.delete'),
      content: confirmationTemplate,
      yes: async () => {
        await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
        if (itemType === 'race') {
          await this.actor.update({ 'system.jp_race_bonus': '' });
          await this.removeRaceAbilities();
        } else if (itemType === 'class') {
          await this.removeClassAbilities();
        }
      },
      no: () => {},
    });
  }
}
