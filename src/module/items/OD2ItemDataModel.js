export class OD2ItemDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      odo_id: new fields.StringField(),
      description: new fields.StringField(),
    };
  }
}
