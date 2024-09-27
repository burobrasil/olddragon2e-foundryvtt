export class OD2ClassDataModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      flavor: new fields.StringField(),
      description: new fields.StringField(),
      equipment_restrictions: new fields.SchemaField({
        weapons: new fields.StringField({
          initial: 'Sem restrições.',
        }),
        armors: new fields.StringField({
          initial: 'Sem restrições.',
        }),
        magic_items: new fields.StringField({
          initial: 'Sem restrições.',
        }),
      }),
      hp: new fields.NumberField({
        integer: true,
      }),
      high_level_hp_bonus: new fields.NumberField({
        integer: true,
      }),
      restrictions: new fields.SchemaField({
        alignments: new fields.ArrayField(new fields.StringField(), {
          default: [],
        }),
        races: new fields.ArrayField(new fields.StringField(), {
          default: [],
        }),
      }),
      levels: new fields.SchemaField({
        1: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
        }),
        2: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        3: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        4: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        5: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        6: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        7: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        8: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        9: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        10: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        11: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        12: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        13: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        14: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
        15: new fields.SchemaField({
          ba: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          jp: new fields.NumberField({
            required: true,
            integer: true,
            initial: 0,
          }),
          xp: new fields.NumberField({
            integer: true,
            initial: 0,
          }),
        }),
      }),
      class_abilities: new fields.ArrayField(new fields.StringField(), {
        default: [],
      }),
    };
  }
}
