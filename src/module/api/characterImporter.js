export const importActor = async (json) => {
  const data = _jsonToActorData(json);

  return Actor.create(data);
};

const _jsonToActorData = (json) => {
  return {
    name: json.name,
    type: 'character',
    system: {
      level: json.level,
      hp: {
        value: json.health_points,
        max: json.max_hp,
      },
      forca: json.forca,
      destreza: json.destreza,
      constituicao: json.constituicao,
      inteligencia: json.inteligencia,
      sabedoria: json.sabedoria,
      carisma: json.carisma,
      current_xp: json.experience_points,
      economy: {
        cp: json.money_cp,
        sp: json.money_sp,
        gp: json.money_gp,
      },
      details: {
        alignment: json.alignment,
        languages: json.languages.join(', '),
        appearance: json.appearance,
        personality: json.personality,
        background: json.background,
      },
    },
  };
};
