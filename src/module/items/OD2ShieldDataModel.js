import { OD2EquipmentDataModel } from './OD2EquipmentDataModel.js';

export class OD2ShieldDataModel extends OD2EquipmentDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      bonus_ca: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
    };
  }
}
