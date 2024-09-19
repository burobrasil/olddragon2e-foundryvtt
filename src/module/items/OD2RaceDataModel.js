export class OD2RaceDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      flavor: new fields.StringField(),
      description: new fields.StringField(),
      movement: new fields.NumberField({
        required: true,
        integer: true,
        initial: 0,
      }),
      infravision: new fields.NumberField({
        integer: true,
      }),
      alignment_tendency: new fields.StringField({
        initial: 'none',
      }),
      race_abilities: new fields.ArrayField(new fields.StringField(), {
        default: [],
      }),
    };
  }
}
