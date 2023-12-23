import { showDialog } from '../helpers';
import { AttackRoll, UnarmedAttackRoll, DamageRoll, KnockoutRoll, StatRoll, JPRoll, BARoll } from '../rolls';

export default class OD2CharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      template: 'systems/olddragon2e/templates/sheets/character-sheet.hbs',
      classes: ['olddragon2e', 'sheet', 'character'],
      width: 820,
      height: 780,
      tabs: [{ navSelector: '.tabs', contentSelector: '.section', initial: 'attacks' }],
    });
  }

  getData() {
    const baseData = super.getData();

    const getItem = (filter) => {
      return baseData.items.filter(filter).map((item) => {
        let newItem = {
          ...item,
        };

        newItem.system.total_weight = this.calculateTotalWeight(
          item.system.quantity,
          item.system.weight_in_grams,
          item.system.weight_in_load,
        );

        newItem.system.total_cost = this.calculateTotalCost(item.system.quantity, item.system.cost);

        return newItem;
      });
    };

    const getAttackItems = () => {
      let items = [];

      for (const id of baseData.actor.system.equipped_items) {
        items.push(...getItem((item) => item._id === id && item.type === 'weapon'));
      }

      return items;
    };

    if (!baseData.actor.system.equipped_items) {
      baseData.actor.system.equipped_items = [];
    }

    let sheetData = {
      owner: this.actor.isOwner,
      editable: this.isEditable,
      actor: baseData.actor,
      system: baseData.actor.system,
      equipped_items: baseData.equipped_items,
      attack: getAttackItems(),
      weapon: getItem((item) => item.type === 'weapon'),
      armor: getItem((item) => item.type === 'armor'),
      shield: getItem((item) => item.type === 'shield'),
      misc: getItem((item) => item.type === 'misc'),
      container: getItem((item) => item.type === 'container'),
      vehicle: getItem((item) => item.type === 'vehicle'),
      spell: getItem((item) => item.type === 'spell'),
      config: CONFIG.olddragon2e,
    };

    return sheetData;
  }

  async activateListeners(html) {
    if (this.isEditable) {
      html.find('.item-create').click(this._onItemCreate.bind(this));
      html.find('.item-edit').click(this._onItemEdit.bind(this));
      html.find('.item-equip').click(this._onItemEquip.bind(this));
      html.find('.item-update-quantity').change(this._onItemUpdateQuantity.bind(this));
      html.find('.item-delete').click(this._onItemDelete.bind(this));
      html.find('.system-stat').change(this._onStatChangeHandler.bind(this));
      html.find('.system-class').change(this._onClassChangeHandler.bind(this));
      html.find('.system-race').change(this._onRaceChangeHandler.bind(this));
      html.find('.system-ac').change(this._onAcChangeHandler.bind(this));
      html.find('.system-ba').change(this._onBaChangeHandler.bind(this));
      html.find('.system-current-movement').change(this.calculateMovement.bind(this));
    }

    // Owner-only Listeners
    if (this.actor.isOwner) {
      html.find('.attack-roll').click(this._onAttackRoll.bind(this));
      html.find('.unarmed-attack-roll').click(this._onUnarmedAttackRoll.bind(this));
      html.find('.damage-roll').click(this._onDamageRoll.bind(this));
      html.find('.knockout-roll').click(this._onKnockoutRoll.bind(this));
      html.find('.spell-cast').click(this._onSpellCast.bind(this));
      html.find('.stat-roll').click(this._onStatRoll.bind(this));
      html.find('.jp-roll').click(this._onJPRoll.bind(this));
      html.find('.ba-roll').click(this._onBARoll.bind(this));
    }

    await this.calculateMaxLoad();
    await this.calculateCurrentLoad();
    this.updateEquippedItemIcon(html);
    super.activateListeners(html);
  }

  // Cálculo do Peso Total de um item
  calculateTotalWeight(quantity, weight_in_grams, weight_in_load) {
    let total_weight = 0;

    if (weight_in_grams > 0) {
      const weight_in_kilos = weight_in_grams / 1000;
      total_weight = Math.floor(weight_in_kilos * quantity);
    }

    if (weight_in_load > 0) {
      total_weight = weight_in_load * quantity;
    }

    return total_weight;
  }

  // Cálculo do Valor Total de um item
  calculateTotalCost(quantity, cost) {
    if (!cost) {
      return '0';
    }

    cost = cost.toUpperCase();
    let isPO = cost.match('PO') != null;
    let isPP = cost.match('PP') != null;
    let isPC = cost.match('PC') != null;
    let match = cost.match(/\d+/);
    let costValue = match[0];
    let totalCost = costValue * Number(quantity);

    if (match === null) {
      return '0 PO';
    }

    if (totalCost <= 0) {
      return cost;
    }

    if (!isPO && !isPP && !isPC) {
      isPO = true;
    }

    if (isPP) {
      let POvalue = Math.trunc(totalCost / 10);

      if (POvalue > 0) {
        return `${POvalue} PO`;
      }

      return `${totalCost} PP`;
    }

    if (isPC) {
      let PPvalue = Math.trunc(totalCost / 10);
      let POvalue = Math.trunc(totalCost / 100);

      if (POvalue > 0) {
        return `${POvalue} PO`;
      }

      if (PPvalue > 0) {
        return `${PPvalue} PP`;
      }

      return `${totalCost} PC`;
    }

    return `${totalCost} PO`;
  }

  // Descobrir o maior valor
  findHighestValue(value1, value2) {
    if (value1 > value2) {
      return value1;
    } else {
      return value2;
    }
  }

  // Cálculo da Carga Máxima
  async calculateMaxLoad() {
    const forca = this.actor.system.forca;
    const constituicao = this.actor.system.constituicao;
    let maxLoadInput = document.querySelector('[name="system.load.max"]');
    let maxLoadValue = this.findHighestValue(forca, constituicao);

    const equippedItems = this.actor.system.equipped_items || [];
    const items = this.actor.items;

    for (const itemId of equippedItems) {
      const item = items.get(itemId);
      if (item && item.type === 'container') {
        maxLoadValue += item.system.increases_load_by || 0;
      }
    }

    maxLoadInput.value = maxLoadValue;

    const updateObject = {};
    updateObject['system.load.max'] = maxLoadValue;

    await this.document.update(updateObject);
  }

  // Cálculo da Carga Atual (soma da Carga Total de todos os itens)
  async calculateCurrentLoad() {
    let currentLoad = document.getElementById('current-load');
    let currentLoadValue = 0;
    const itemTypes = ['weapon', 'armor', 'shield', 'misc', 'container'];

    for (const type of itemTypes) {
      const items = this.actor.items.filter((item) => item.type === type);
      for (const item of items) {
        currentLoadValue += this.calculateTotalWeight(
          item.system.quantity,
          item.system.weight_in_grams,
          item.system.weight_in_load,
        );
      }
    }

    if (this.actor.system.load.current === currentLoadValue) {
      return;
    }

    currentLoad.value = currentLoadValue;

    const updateObject = {};
    updateObject['system.load.current'] = currentLoadValue;

    await this.document.update(updateObject);
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

  // Quando o valor de um atributo é alterado
  async _onStatChangeHandler(event) {
    const statName = event.target.name.split('.')[1];
    const statValue = event.currentTarget.value;
    await this._calculateModifiers(statName, statValue);

    if (statName === this.stats.forca) {
      await this._calculateBA();
    }
    if (statName === this.stats.destreza || statName === this.stats.constituicao || statName === this.stats.sabedoria) {
      await this._calculateJP(this.statsJpMap[statName]);
    }
    if (statName === this.stats.destreza) {
      await this._calculateCA();
      await this._calculateBA();
    }
  }

  // Quando o valor de raça é alterado
  async _onRaceChangeHandler(event) {
    const splitedName = event.target.name.split('.');
    const jpName = splitedName[1];
    const inputName = splitedName[2];
    await this._calculateJP(jpName, {
      [inputName]: event.currentTarget.value,
    });
  }

  // Quando o valor de classe é alterado
  async _onClassChangeHandler(event) {
    const splitedName = event.target.name.split('.');
    const jpName = splitedName[1];
    const inputName = splitedName[2];
    await this._calculateJP(jpName, {
      [inputName]: event.currentTarget.value,
    });
  }

  // Quando os valores de CA são alterados
  async _onAcChangeHandler(event) {
    const inputName = event.target.name.split('.')[2];
    await this._calculateCA({
      [inputName]: event.currentTarget.value,
    });
  }

  // Quando o valor Base BA é alterado
  async _onBaChangeHandler(event) {
    const inputName = event.target.name.split('.')[1];
    await this._calculateBA({
      [inputName]: event.currentTarget.value,
    });
  }

  // Cálculo de modificadores
  async _calculateModifiers(statName, statValue) {
    let modStat = 0;

    if (statValue < 2) {
      modStat = -4;
    } else if (statValue < 4) {
      modStat = -3;
    } else if (statValue < 6) {
      modStat = -2;
    } else if (statValue < 9) {
      modStat = -1;
    } else if (statValue < 13) {
      modStat = 0;
    } else if (statValue < 15) {
      modStat = 1;
    } else if (statValue < 17) {
      modStat = 2;
    } else if (statValue < 19) {
      modStat = 3;
    } else if (statValue >= 19) {
      modStat = 4;
    }

    const updateObject = {};
    updateObject[`system.mod_${statName}`] = modStat;

    await this.document.update(updateObject);
  }

  // Cálculo de JP
  async _calculateJP(jpName, values) {
    const modName = this.jpModMap[jpName];

    let classValue = this.document.system[jpName].class || 0;
    let raceValue = this.document.system[jpName].race || 0;
    let modValue = this.document.system[modName] || 0;

    if (values) {
      if (values['class']) {
        classValue = values['class'];
      }
      if (values['race']) {
        raceValue = values['race'];
      }
    }

    let jp = Number(classValue) + Number(raceValue) + Number(modValue);

    const updateObject = {};
    updateObject[`system.${jpName}.value`] = jp;

    await this.document.update(updateObject);
  }

  async _calculateCA(values) {
    let baseValue = this.document.system.ac.base || 0;
    let modValue = this.document.system.mod_destreza || 0;
    let armorValue = this.document.system.ac.armor || 0;
    let shieldValue = this.document.system.ac.shield || 0;
    let magicWeaponValue = this.document.system.ac.magic_weapon || 0;

    if (values) {
      if (values['base']) {
        baseValue = values['base'];
      }
      if (values['armor']) {
        armorValue = values['armor'];
      }
      if (values['shield']) {
        shieldValue = values['shield'];
      }
      if (values['magic_weapon']) {
        magicWeaponValue = values['magic_weapon'];
      }
    }

    let ca = Number(baseValue) + Number(modValue) + Number(armorValue) + Number(shieldValue) + Number(magicWeaponValue);

    let updateObject = { 'system.ac.value': ca };

    await this.document.update(updateObject);
  }

  async _calculateBA(values) {
    let baseValue = this.document.system.ba.value || 0;
    let modForcaValue = this.document.system.mod_forca || 0;
    let modDestrezaValue = this.document.system.mod_destreza || 0;

    if (values) {
      if (values['ba']) {
        baseValue = values['ba'];
      }
    }

    let bac = Number(baseValue) + Number(modForcaValue);
    let bad = Number(baseValue) + Number(modDestrezaValue);

    const updateObject = {};
    updateObject[`system.bac`] = bac;
    updateObject[`system.bad`] = bad;

    await this.document.update(updateObject);
  }

  // Cálculo de Movimento
  async calculateMovement(event) {
    const currentMovement = event.currentTarget.value;
    let movementRun = this.actor.system.movement_run;
    let movementClimb = this.actor.system.movement_climb;
    let movementSwim = this.actor.system.movement_swim;

    movementRun = Math.floor(Number(currentMovement) * 2);
    movementClimb = Math.floor(Number(currentMovement) - 2);
    movementSwim = Math.floor(Number(currentMovement) / 2);

    const updateObject = {};
    updateObject[`system.movement_run`] = movementRun;
    updateObject[`system.movement_climb`] = movementClimb;
    updateObject[`system.movement_swim`] = movementSwim;

    await this.document.update(updateObject);
  }

  // Rolagem de ataque
  async _onAttackRoll(event) {
    event.preventDefault();
    let target = event.currentTarget;

    const ba = target.dataset.ba;
    const baBonus = target.dataset.baBonus === '';
    const itemID = event.currentTarget.closest('.attack').dataset.itemId;
    const item = this.actor.items.get(itemID);

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
  async _onSpellCast(event) {
    event.preventDefault();
    const itemID = event.currentTarget.closest('.item').dataset.itemId;
    const item = this.actor.items.get(itemID);
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
    chatData.content = await renderTemplate(chatTemplate, cardData);
    return ChatMessage.create(chatData);
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
    let equippedItems = this.actor.system.equipped_items || [];
    const isEquipped = equippedItems.includes(itemId);
    let armorValue = this.document.system.ac.armor || 0;
    let shieldValue = this.document.system.ac.shield || 0;
    let maxLoadValue = this.document.system.load.max || 0;
    let updateObject = {};

    if (isEquipped) {
      equippedItems = equippedItems.filter((id) => id !== itemId);
      if (item.type === 'armor') {
        armorValue -= item.system.bonus_ca || 0;
      }
      if (item.type === 'shield') {
        shieldValue -= item.system.bonus_ca || 0;
      }
      if (item.type === 'container') {
        maxLoadValue -= item.system.increases_load_by || 0;
      }
    } else {
      equippedItems.push(itemId);
      if (item.type === 'armor') {
        armorValue += item.system.bonus_ca || 0;
      }
      if (item.type === 'shield') {
        shieldValue += item.system.bonus_ca || 0;
      }
      if (item.type === 'container') {
        maxLoadValue += item.system.increases_load_by || 0;
      }
    }

    if (item.type === 'armor') {
      updateObject['system.ac.armor'] = armorValue;
    }

    if (item.type === 'shield') {
      updateObject['system.ac.shield'] = shieldValue;
    }

    if (item.type === 'container') {
      updateObject['system.load.max'] = maxLoadValue;
    }

    updateObject[`system.equipped_items`] = equippedItems;

    await this.document.update(updateObject);
    await this._calculateCA();
  }

  updateEquippedItemIcon(html) {
    if (!this.actor.system.equipped_items) {
      return;
    }

    let elements = html.find('.item-equip');

    for (let index = 0; index < elements.length; index++) {
      const element = elements[index];
      let itemId = element.closest('.item').dataset.itemId;

      if (this.actor.system.equipped_items.some((item) => item === itemId)) {
        element.firstChild.classList.remove('fa-regular');
        element.firstChild.classList.add('fa-solid');
      } else {
        element.firstChild.classList.remove('fa-solid');
        element.firstChild.classList.add('fa-regular');
      }
    }
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

  // Excluir item
  async _onItemDelete(event) {
    event.preventDefault();
    let element = event.currentTarget;
    let itemId = element.closest('.item').dataset.itemId;
    let item = this.actor.items.get(itemId);
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

    const isShieldOrArmor = item.type === 'shield' || item.type === 'armor';
    const isEquipped = this.document.system.equipped_items.includes(itemId);

    await Dialog.confirm({
      title: game.i18n.localize('olddragon2e.delete'),
      content: confirmationTemplate,
      yes: async () => {
        if (isShieldOrArmor && isEquipped) {
          const bonusCA = item.system.bonus_ca || 0;

          if (item.type === 'shield') {
            let shieldValue = this.document.system.ac.shield || 0;
            shieldValue -= bonusCA;
            await this.document.update({ 'system.ac.shield': shieldValue });
            await this._calculateCA();
          } else if (item.type === 'armor') {
            let armorValue = this.document.system.ac.armor || 0;
            armorValue -= bonusCA;
            await this.document.update({ 'system.ac.armor': armorValue });
            await this._calculateCA();
          }
        }

        await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
      },
      no: () => {},
    });
  }
}
