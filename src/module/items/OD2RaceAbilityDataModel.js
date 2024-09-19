export class OD2RaceAbilityDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.StringField(),
      xp: new fields.NumberField({
        integer: true,
      }),
      jp: new fields.SchemaField({
        jpc: new fields.BooleanField({
          default: false,
        }),
        jpd: new fields.BooleanField({
          default: false,
        }),
        jps: new fields.BooleanField({
          default: false,
        }),
      }),
      bonus_damage_archery: new fields.BooleanField({
        default: false,
      }),
      rogue_talent: new fields.StringField({
        default: 'none',
      }),
    };
  }
}
