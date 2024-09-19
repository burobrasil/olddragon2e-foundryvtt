export class OD2ClassAbilityDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      level: new fields.NumberField({
        required: true,
        integer: true,
        initial: 1,
      }),
      description: new fields.StringField(),
      level3: new fields.StringField(),
      level6: new fields.StringField(),
      level10: new fields.StringField(),
      daily_uses: new fields.SchemaField({
        1: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        2: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        3: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        4: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        5: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        6: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        7: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        8: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        9: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        10: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        11: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        12: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        13: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        14: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
        15: new fields.NumberField({
          integer: true,
          initial: 0,
        }),
      }),
    };
  }
}
