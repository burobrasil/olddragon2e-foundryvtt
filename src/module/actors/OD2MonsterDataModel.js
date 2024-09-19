const getItemsOfActorOfType = (actor, filterType, filterFn = null) =>
  actor.items.filter(({ type }) => type === filterType).filter(filterFn || (() => true));

export class OD2MonsterDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      odo_id: new fields.StringField(),
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
      flavor: new fields.StringField(),
      concept: new fields.StringField({
        initial: 'humanoide',
      }),
      size: new fields.StringField({
        initial: 'medio',
      }),
      habitat: new fields.StringField({
        initial: 'qualquer',
      }),
      alignment: new fields.StringField({
        initial: 'neutro',
      }),
      variant: new fields.BooleanField(),
      description: new fields.StringField(),
      described_attacks: new fields.StringField(),
      encounters: new fields.StringField(),
      encounters_lair: new fields.StringField(),
      xp: new fields.StringField(),
      treasure: new fields.StringField(),
      treasure_lair: new fields.StringField(),
      mv: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      mvn: new fields.StringField(),
      mvv: new fields.StringField(),
      mvo: new fields.StringField(),
      dv: new fields.StringField(),
      dv_bonus: new fields.StringField(),
      ca: new fields.StringField(),
      jp: new fields.StringField(),
      mo: new fields.StringField(),
      url: new fields.StringField(),
    };
  }

  get mvc() {
    return Math.floor(parseInt(this.mv) * 2);
  }

  get mve() {
    return Math.floor(parseInt(this.mv) - 2);
  }

  get monster_attack_items() {
    return getItemsOfActorOfType(this.parent, 'monster_attack').sort((a, b) => (a.sort || 0) - (b.sort || 0));
  }
}
