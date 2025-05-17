import { OD2ItemDataModel } from './OD2ItemDataModel.js';

export class OD2SpellDataModel extends OD2ItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      arcane: new fields.StringField({
        initial: 'null',
      }),
      divine: new fields.StringField({
        initial: 'null',
      }),
      necromancer: new fields.StringField({
        initial: 'null',
      }),
      illusionist: new fields.StringField({
        initial: 'null',
      }),
      reverse: new fields.BooleanField({
        initial: false,
      }),
      range: new fields.StringField(),
      duration: new fields.StringField(),
      jp: new fields.StringField(),
    };
  }
}
