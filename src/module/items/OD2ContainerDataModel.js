import { OD2EquipmentDataModel } from './OD2EquipmentDataModel.js';

export class OD2ContainerDataModel extends OD2EquipmentDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      increases_load_by: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
    };
  }
}
