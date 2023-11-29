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
      mod_forca: json.mod_forca,
      mod_destreza: json.mod_destreza,
      mod_constituicao: json.mod_constituicao,
      mod_inteligencia: json.mod_inteligencia,
      mod_sabedoria: json.mod_sabedoria,
      mod_carisma: json.mod_carisma,
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
      current_movement: {
        value: json.current_movement,
      },
      movement_run: json.movement_run,
      movement_climb: json.movement_climb,
      movement_swim: json.movement_swim,
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
