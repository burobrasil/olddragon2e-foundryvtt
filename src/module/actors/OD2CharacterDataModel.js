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
      ac: new fields.SchemaField({
        base: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        magic_weapon: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
      }),
      ba: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
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
      current_movement: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      race: new fields.SchemaField({
        name: new fields.StringField(),
        infravision: new fields.StringField(),
        skills: new fields.StringField(),
      }),
      class: new fields.SchemaField({
        name: new fields.StringField(),
        skills: new fields.StringField(),
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
      xp: new fields.SchemaField({
        current: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
        next_level: new fields.NumberField({
          required: true,
          initial: 0,
          integer: true,
        }),
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

  get ac_total() {
    const base = this.ac.base;
    const magic_weapon = this.ac.magic_weapon;

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

  get jpd_total() {
    const class_jpd = this.jpd.class;
    const race_jpd = this.jpd.race;
    const mod = this.mod_destreza;

    return class_jpd + race_jpd + mod;
  }

  get jpc_total() {
    const class_jpc = this.jpc.class;
    const race_jpc = this.jpc.race;
    const mod = this.mod_constituicao;

    return class_jpc + race_jpc + mod;
  }

  get jps_total() {
    const class_jps = this.jps.class;
    const race_jps = this.jps.race;
    const mod = this.mod_sabedoria;

    return class_jps + race_jps + mod;
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

  get movement_run() {
    return Math.floor(this.current_movement * 2);
  }

  get movement_climb() {
    return Math.floor(this.current_movement - 2);
  }

  get movement_swim() {
    return Math.floor(this.current_movement / 2);
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
    let currentLoadValue = 0;
    const itemTypes = ['weapon', 'armor', 'shield', 'misc', 'container'];

    for (const type of itemTypes) {
      const items = getItemsOfActorOfType(this.parent, type);

      for (const item of items) {
        currentLoadValue += item.system.total_weight;
      }
    }

    return currentLoadValue;
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
}
