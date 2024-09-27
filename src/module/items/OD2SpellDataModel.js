import { OD2ItemDataModel } from './OD2ItemDataModel.js';

export class OD2SpellDataModel extends OD2ItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      school: new fields.StringField({
        initial: 'null',
      }),
      circle: new fields.StringField({
        initial: 'null',
      }),
      arcane: new fields.StringField({
        initial: 'null',
      }),
      divine: new fields.StringField({
        initial: 'null',
      }),
      necromancer: new fields.StringField(),
      illusionist: new fields.StringField(),
      reverse: new fields.BooleanField({
        initial: false,
      }),
      range: new fields.StringField(),
      duration: new fields.StringField(),
      jp: new fields.StringField(),
    };
  }
}
