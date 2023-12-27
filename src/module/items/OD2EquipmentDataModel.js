import { OD2ItemDataModel } from './OD2ItemDataModel.js';

export class OD2EquipmentDataModel extends OD2ItemDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      ...super.defineSchema(),
      quantity: new fields.NumberField({
        required: true,
        initial: 1,
        integer: true,
      }),
      cost: new fields.StringField(),
      weight_in_load: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      weight_in_grams: new fields.NumberField({
        required: true,
        initial: 0,
        integer: true,
      }),
      magic_item: new fields.BooleanField({
        required: true,
        initial: false,
      }),
      is_equipped: new fields.BooleanField({
        required: true,
        initial: false,
      }),
    };
  }

  get total_weight() {
    return this._calculateTotalWeight(this.quantity, this.weight_in_grams, this.weight_in_load);
  }

  get total_cost() {
    return this._calculateTotalCost(this.quantity, this.cost);
  }

  // Cálculo do Peso Total de um item
  _calculateTotalWeight(quantity, weight_in_grams, weight_in_load) {
    let total_weight = 0;

    if (weight_in_grams > 0) {
      const weight_in_kilos = weight_in_grams / 1000;
      total_weight = Math.floor(weight_in_kilos * quantity);
    }

    if (weight_in_load > 0) {
      total_weight = weight_in_load * quantity;
    }

    return total_weight;
  }

  // Cálculo do Valor Total de um item
  _calculateTotalCost(quantity, cost) {
    if (!cost) {
      return '0';
    }

    cost = cost.toUpperCase();
    let isPO = cost.match('PO') != null;
    let isPP = cost.match('PP') != null;
    let isPC = cost.match('PC') != null;
    let match = cost.match(/\d+/);
    let costValue = match[0];
    let totalCost = costValue * Number(quantity);

    if (match === null) {
      return '0 PO';
    }

    if (totalCost <= 0) {
      return cost;
    }

    if (!isPO && !isPP && !isPC) {
      isPO = true;
    }

    if (isPP) {
      let POvalue = Math.trunc(totalCost / 10);

      if (POvalue > 0) {
        return `${POvalue} PO`;
      }

      return `${totalCost} PP`;
    }

    if (isPC) {
      let PPvalue = Math.trunc(totalCost / 10);
      let POvalue = Math.trunc(totalCost / 100);

      if (POvalue > 0) {
        return `${POvalue} PO`;
      }

      if (PPvalue > 0) {
        return `${PPvalue} PP`;
      }

      return `${totalCost} PC`;
    }

    return `${totalCost} PO`;
  }
}
