export class OD2MonsterAttackDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      text: new fields.StringField(),
      times: new fields.NumberField({
        required: true,
        initial: 1,
        integer: true,
      }),
      description: new fields.StringField(),
      ba: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      damage_description: new fields.StringField(),
      damage: new fields.StringField(),
      damage_bonus: new fields.NumberField({
        integer: true,
      }),
      weapon: new fields.BooleanField({
        required: true,
        initial: false,
      }),
    };
  }
}
