import { OD2EquipmentDataModel } from './OD2EquipmentDataModel.js';

export class OD2WeaponDataModel extends OD2EquipmentDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      type: new fields.StringField(),
      damage_type: new fields.StringField(),
      damage: new fields.StringField(),
      bonus_damage: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      bonus_ba: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      bonus_ca: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      shoot_range: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      throw_range: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      arrow: new fields.BooleanField({
        required: true,
        initial: false,
      }),
      bolt: new fields.BooleanField({
        required: true,
        initial: false,
      }),
      bolt_small: new fields.BooleanField({
        required: true,
        initial: false,
      }),
      polearm: new fields.BooleanField({
        required: true,
        initial: false,
      }),
      two_handed: new fields.BooleanField({
        required: true,
        initial: false,
      }),
      versatile: new fields.BooleanField({
        required: true,
        initial: false,
      }),
    };
  }
}
