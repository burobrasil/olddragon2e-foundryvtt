import { olddragon2e } from '../config';

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
      ac: {
        value: json.ac,
      },
      bac: json.bac,
      bad: json.bad,
      jpd: {
        value: json.jpd,
      },
      jpc: {
        value: json.jpc,
      },
      jps: {
        value: json.jps,
      },
      current_movement: json.current_movement,
      race: {
        name: _getRace(json.race),
      },
      class: {
        name: _getCharacterClass(json.class),
      },
    },
  };
};

const _getCharacterClass = (characterClass) =>
  game.i18n.localize(olddragon2e.classes[characterClass.replaceAll('-', '_')]);

const _getRace = (race) => game.i18n.localize(olddragon2e.races[race.replaceAll('-', '_')]);
