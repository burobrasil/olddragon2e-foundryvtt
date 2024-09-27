const getItemsOfActorOfType = (actor, filterType, filterFn = null) =>
  actor.items.filter(({ type }) => type === filterType).filter(filterFn || (() => true));

export class OD2CharacterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      odo_id: new fields.StringField(),
      level: new fields.NumberField({
        required: true,
        initial: 1,
        integer: true,
      }),
      hp: new fields.SchemaField({
        value: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true,
        }),
        max: new fields.NumberField({
          required: true,
          initial: 10,
          integer: true,
        }),
      }),
      forca: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      destreza: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      constituicao: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      inteligencia: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      sabedoria: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      carisma: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      ac_extra: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      class_jpd: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      class_jpc: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      class_jps: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      jp_race_bonus: new fields.StringField({
        default: '',
      }),
      jpd: new fields.SchemaField({
        class: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        race: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      jpc: new fields.SchemaField({
        class: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        race: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      jps: new fields.SchemaField({
        class: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        race: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      economy: new fields.SchemaField({
        cp: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        sp: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        gp: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        count: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        load: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      details: new fields.SchemaField({
        alignment: new fields.StringField({
          required: true,
          initial: 'neutro',
        }),
        languages: new fields.StringField(),
        reputation: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        appearance: new fields.StringField(),
        personality: new fields.StringField(),
        background: new fields.StringField(),
        notes: new fields.StringField(),
      }),
      current_xp: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      campanha_url: new fields.StringField(),
      url: new fields.StringField(),
    };
  }

  static migrateData(source) {
    if (typeof source.ba === 'object') {
      source.ba = source.ba.value;
    }
    if (typeof source.current_movement === 'object') {
      source.current_movement = source.current_movement.value;
    }
    return super.migrateData(source);
  }

  get ac_base() {
    return 10;
  }

  get ac_total() {
    const base = this.ac_base;
    const magic_weapon = this.ac_extra;

    const shield_ac = this.ac_shield;
    const armor_ac = this.ac_armor;

    const mod = this.mod_destreza;

    return base + mod + magic_weapon + shield_ac + armor_ac;
  }

  get ac_shield() {
    const equipped_shields = this.shield_items.filter(({ system }) => system.is_equipped);

    const shield_ac = equipped_shields.reduce((acc, { system }) => acc + system.bonus_ca, 0);

    return shield_ac;
  }

  get ac_armor() {
    const equipped_armor = this.armor_items.filter(({ system }) => system.is_equipped);

    const armor_ac = equipped_armor.reduce((acc, { system }) => acc + system.bonus_ca, 0);

    return armor_ac;
  }

  get ba() {
    const characterClass = this.class;
    if (!characterClass) return 0;

    const level = this.level;
    const classLevels = characterClass.system.levels;

    const levelData = classLevels[level];

    if (!levelData) return 0;

    return levelData.ba;
  }

  get bac() {
    const base = this.ba;
    const mod = this.mod_forca;

    return base + mod;
  }

  get bad() {
    const base = this.ba;
    const mod = this.mod_destreza;

    return base + mod;
  }

  get mod_forca() {
    const forca = this.forca;

    return this._calculateModifiers(forca);
  }

  get mod_destreza() {
    const destreza = this.destreza;

    return this._calculateModifiers(destreza);
  }

  get mod_constituicao() {
    const constituicao = this.constituicao;

    return this._calculateModifiers(constituicao);
  }

  get mod_inteligencia() {
    const inteligencia = this.inteligencia;

    return this._calculateModifiers(inteligencia);
  }

  get mod_sabedoria() {
    const sabedoria = this.sabedoria;

    return this._calculateModifiers(sabedoria);
  }

  get mod_carisma() {
    const carisma = this.carisma;

    return this._calculateModifiers(carisma);
  }

  get jpd_race_bonus() {
    if (this.jp_race_bonus === 'jpd') {
      return 1;
    }
    return 0;
  }

  get jpc_race_bonus() {
    if (this.jp_race_bonus === 'jpc') {
      return 1;
    }
    return 0;
  }

  get jps_race_bonus() {
    if (this.jp_race_bonus === 'jps') {
      return 1;
    }
    return 0;
  }

  get jp() {
    const characterClass = this.class;
    if (!characterClass) return 0;

    const level = this.level;
    const classLevels = characterClass.system.levels;

    const levelData = classLevels[level];

    if (!levelData) return 0;

    return levelData.jp;
  }

  get jpd_total() {
    const class_jpd = this.jp;
    const race_bonus = this.jpd_race_bonus;
    const mod = this.mod_destreza;

    return class_jpd + race_bonus + mod;
  }

  get jpc_total() {
    const class_jpc = this.jp;
    const race_bonus = this.jpc_race_bonus;
    const mod = this.mod_constituicao;

    return class_jpc + race_bonus + mod;
  }

  get jps_total() {
    const class_jps = this.jp;
    const race_bonus = this.jps_race_bonus;
    const mod = this.mod_sabedoria;

    return class_jps + race_bonus + mod;
  }

  _calculateModifiers(value) {
    if (value < 2) {
      return -4;
    }

    if (value < 4) {
      return -3;
    }

    if (value < 6) {
      return -2;
    }

    if (value < 9) {
      return -1;
    }

    if (value < 13) {
      return 0;
    }

    if (value < 15) {
      return 1;
    }

    if (value < 17) {
      return 2;
    }

    if (value < 19) {
      return 3;
    }

    return 4;
  }

  get current_movement() {
    if (this.race == null) {
      return 0;
    }

    return this.race.system.movement;
  }

  get movement_run() {
    return Math.floor(this.current_movement * 2);
  }

  get movement_climb() {
    if (this.current_movement <= 0) {
      return 0;
    }
    return Math.floor(this.current_movement - 2);
  }

  get movement_swim() {
    return Math.floor(this.current_movement / 2);
  }

  get next_level_xp() {
    const characterClass = this.class;
    if (!characterClass) return 0;

    const level = this.level;
    const classLevels = characterClass.system.levels;

    const levelData = classLevels[level + 1];

    if (!levelData) return 0;

    return levelData.xp;
  }

  _levelUp() {
    const currentXp = this.current_xp;
    const nextLevelXp = this.next_level_xp;

    if (currentXp >= nextLevelXp) {
      ui.notifications.info(`Parabéns! ${this.parent.name} já pode subir de nível!`);
    }
  }

  get load_max() {
    let maxLoadValue = this._findHighestValue(this.forca, this.constituicao);

    const equipped_containers = getItemsOfActorOfType(this.parent, 'container', ({ system }) => system.is_equipped);

    for (const item of equipped_containers) {
      maxLoadValue += item.system.increases_load_by || 0;
    }

    return maxLoadValue;
  }

  get load_current() {
    return Math.floor(this._inventoryItemsLoad() + this._economyCoinLoad());
  }

  _inventoryItemsLoad() {
    let currentLoadValue = 0;
    const itemTypes = ['weapon', 'armor', 'shield', 'misc', 'container'];

    for (const type of itemTypes) {
      const items = getItemsOfActorOfType(this.parent, type);

      for (const item of items) {
        currentLoadValue += item.system.total_weight;
      }
    }

    return Math.floor(currentLoadValue);
  }

  _economyCoinSum() {
    return this.economy.cp + this.economy.sp + this.economy.gp;
  }

  _economyCoinLoad() {
    return this._economyCoinSum() / 100;
  }

  _findHighestValue(value1, value2) {
    if (value1 > value2) {
      return value1;
    } else {
      return value2;
    }
  }

  get equipped_items() {
    return this.parent.items.filter(({ system }) => system.is_equipped);
  }

  get attack_items() {
    return getItemsOfActorOfType(this.parent, 'weapon', ({ system }) => system.is_equipped).sort(
      (a, b) => (a.sort || 0) - (b.sort || 0),
    );
  }

  get weapon_items() {
    return getItemsOfActorOfType(this.parent, 'weapon').sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  get armor_items() {
    return getItemsOfActorOfType(this.parent, 'armor').sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  get shield_items() {
    return getItemsOfActorOfType(this.parent, 'shield').sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  get misc_items() {
    return getItemsOfActorOfType(this.parent, 'misc').sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  get container_items() {
    return getItemsOfActorOfType(this.parent, 'container').sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  get vehicle_items() {
    return getItemsOfActorOfType(this.parent, 'vehicle').sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  get spell_items() {
    return getItemsOfActorOfType(this.parent, 'spell').sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }

  get race() {
    const raceItems = getItemsOfActorOfType(this.parent, 'race');

    if (raceItems && raceItems.length) {
      return raceItems[0];
    }

    return null;
  }

  get class() {
    const classItems = getItemsOfActorOfType(this.parent, 'class');

    if (classItems && classItems.length) {
      return classItems[0];
    }

    return null;
  }

  async getItemsFromUUIDs(uuids) {
    const items = [];
    for (const uuid of uuids) {
      const item = await fromUuid(uuid);
      if (item) items.push(item);
    }
    return items;
  }

  // Habilidades de Raça
  async updateRaceAbilities(uuids) {
    const raceAbilities = await this.getItemsFromUUIDs(uuids);
    const currentRaceAbilities = this.race_abilities;
    const currentRaceAbilitiesUUIDs = [];

    for (const ability of currentRaceAbilities) {
      currentRaceAbilitiesUUIDs.push(ability._id);
    }

    await this.parent.deleteEmbeddedDocuments('Item', currentRaceAbilitiesUUIDs);

    for (const raceAbility of raceAbilities) {
      await this.parent.createEmbeddedDocuments('Item', [raceAbility]);
    }
  }

  async syncRaceAbilities() {
    const race = this.race;
    if (!race) return [];

    const raceAbilitiesUUIDs = race.system.race_abilities || [];
    const raceAbilities = await this.getItemsFromUUIDs(raceAbilitiesUUIDs);

    for (const raceAbility of raceAbilities) {
      await this.parent.createEmbeddedDocuments('Item', [raceAbility]);
    }

    return raceAbilities;
  }

  get race_abilities() {
    return getItemsOfActorOfType(this.parent, 'race_ability');
  }

  // Habilidades de Classe
  async updateClassAbilities(uuids) {
    const classAbilities = await this.getItemsFromUUIDs(uuids);
    const currentClassAbilities = this.class_abilities;
    const currentClassAbilitiesUUIDs = [];

    for (const ability of currentClassAbilities) {
      currentClassAbilitiesUUIDs.push(ability._id);
    }

    await this.parent.deleteEmbeddedDocuments('Item', currentClassAbilitiesUUIDs);

    for (const classAbility of classAbilities) {
      await this.parent.createEmbeddedDocuments('Item', [classAbility]);
    }
  }

  async syncClassAbilities() {
    const characterClass = this.class;
    if (!characterClass) return [];

    const classAbilitiesUUIDs = characterClass.system.class_abilities || [];
    const classAbilities = await this.getItemsFromUUIDs(classAbilitiesUUIDs);

    for (const classAbility of classAbilities) {
      await this.parent.createEmbeddedDocuments('Item', [classAbility]);
    }

    return classAbilities;
  }

  get class_abilities() {
    return getItemsOfActorOfType(this.parent, 'class_ability');
  }
}
