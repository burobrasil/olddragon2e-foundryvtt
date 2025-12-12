const RACE_UUIDS = {
  anao: 'Compendium.olddragon2e.races.Item.d9seo5qPELZJetH6',
  elfo: 'Compendium.olddragon2e.races.Item.qZ5T7ZHQpGlmdfOq',
  gnomo: 'Compendium.olddragon2e.races.Item.GLAN1JCU7dTEVHmZ',
  halfling: 'Compendium.olddragon2e.races.Item.3VqpR0B3GFRHm9i7',
  humano: 'Compendium.olddragon2e.races.Item.LVAnPRB3y5OexOmz',
  'meio-elfo': 'Compendium.olddragon2e.races.Item.sdsNB4qd7pXkRBy9',
  // Raças de Legião
  grizzi: 'Compendium.olddragon2e-legiao.races.Item.1f25F4v2vMOSoZCp',
  'meio-elfo-kaduriano': 'Compendium.olddragon2e-legiao.races.Item.bchRiwagDwkAToHU',
  tenebrum: 'Compendium.olddragon2e-legiao.races.Item.Afas2pzK75wylg4r',
};

const CLASS_UUIDS = {
  academico: 'Compendium.olddragon2e.classes.Item.UbJdOGEnK1AHoHrh',
  'anao-aventureiro': 'Compendium.olddragon2e.classes.Item.Y46BnHjmf9v2sYYA',
  arqueiro: 'Compendium.olddragon2e.classes.Item.zVsnFVV3I7aOGLzK',
  assassino: 'Compendium.olddragon2e.classes.Item.qmcr4miRTUGaUZgr',
  barbaro: 'Compendium.olddragon2e.classes.Item.XyMxtlkHTVeuXict',
  bardo: 'Compendium.olddragon2e.classes.Item.zhBTrsrVCJuh0TIP',
  bruxo: 'Compendium.olddragon2e.classes.Item.RwWjaex47rIj9FwO',
  clerigo: 'Compendium.olddragon2e.classes.Item.cYfvA9p2XprFpamU',
  druida: 'Compendium.olddragon2e.classes.Item.tRhKnE5D6grdUwzL',
  'elfo-aventureiro': 'Compendium.olddragon2e.classes.Item.HufLva6gVWRi1l48',
  guerreiro: 'Compendium.olddragon2e.classes.Item.bkzh1k7B0ncxQfHR',
  'halfling-aventureiro': 'Compendium.olddragon2e.classes.Item.BMGOU1kveWlIJNx8',
  ilusionista: 'Compendium.olddragon2e.classes.Item.PBtvkfo69YBlKrGY',
  ladrao: 'Compendium.olddragon2e.classes.Item.o8cAybQI9lQp2MTd',
  mago: 'Compendium.olddragon2e.classes.Item.0VpxbklOWK0SaHMY',
  necromante: 'Compendium.olddragon2e.classes.Item.auquWM2cFz5Otr9z',
  paladino: 'Compendium.olddragon2e.classes.Item.UwfTTsIz4YlhQViE',
  proscrito: 'Compendium.olddragon2e.classes.Item.9cxLzlDnQQTEwuhD',
  ranger: 'Compendium.olddragon2e.classes.Item.fjNBciFT3punx7Ks',
  xama: 'Compendium.olddragon2e.classes.Item.mLrl21J2PMKmGLuh',
  // Classes de Legião
  'feiticeiro-clerigo': 'Compendium.olddragon2e-legiao.classes.Item.rViqghGwgybm5LHN',
  'feiticeiro-guerreiro': 'Compendium.olddragon2e-legiao.classes.Item.bRQgIXBLJa7gAlSm',
  'feiticeiro-ladrao': 'Compendium.olddragon2e-legiao.classes.Item.KofM93KX0N1Yglgw',
  legionario: 'Compendium.olddragon2e-legiao.classes.Item.AXvfz6DD6IM3JfjG',
};

export const importActor = async (json) => {
  const data = await _jsonToActorData(json);
  const actor = await Actor.create(data);

  const itemsToAdd = [];
  if (data.system.race) {
    itemsToAdd.push(data.system.race);
  }
  if (data.system.class) {
    itemsToAdd.push(data.system.class);
  }
  if (itemsToAdd.length > 0) {
    await actor.createEmbeddedDocuments('Item', itemsToAdd);
  }

  await _addRaceAndClassAbilities(actor, data.system.race, data.system.class);
  await _addInventoryItems(actor, json.inventory_items);

  return actor;
};

const _jsonToActorData = async (json) => {
  const raceUUID = RACE_UUIDS[json.character_race?.id];
  const classUUID = CLASS_UUIDS[json.character_class?.id];

  const isLegiaoModuleAvailable = game.modules.get('olddragon2e-legiao')?.active;

  let raceItem = null;
  let classItem = null;

  const raceName = json.character_race?.name;
  const className = json.character_class?.name;

  if (raceUUID) {
    raceItem = await fromUuid(raceUUID).catch(() => null);
    if (!raceItem && raceUUID.startsWith('Compendium.olddragon2e-legiao') && !isLegiaoModuleAvailable) {
      ui.notifications.warn(`A Raça "${raceName}" é exclusiva do módulo premium "Legião - A Era da Desolação".`);
    } else if (!raceItem) {
      ui.notifications.warn(`A Raça "${raceName}" não foi encontrada.`);
    }
  } else {
    ui.notifications.warn(`Raça "${raceName}" não encontrada.`);
  }

  if (classUUID) {
    classItem = await fromUuid(classUUID).catch(() => null);
    if (!classItem && classUUID.startsWith('Compendium.olddragon2e-legiao') && !isLegiaoModuleAvailable) {
      ui.notifications.warn(`A Classe "${className}" é exclusiva do módulo premium "Legião - A Era da Desolação".`);
    } else if (!classItem) {
      ui.notifications.warn(`A Classe "${className}" não foi encontrada.`);
    }
  } else {
    ui.notifications.warn(`Classe "${className}" não encontrada.`);
  }

  const actorData = {
    name: json.name,
    type: 'character',
    system: {
      odo_id: json.id,
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
      jp_race_bonus: _extractJpRaceBonus(json),
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
      race: raceItem ? raceItem.toObject() : null,
      class: classItem ? classItem.toObject() : null,
    },
  };

  if (json.picture) {
    actorData.img = await _downloadAndSaveImage(json.picture);
  }

  return actorData;
};

const _downloadAndSaveImage = async (url) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${url}`);
  }

  const blob = await response.blob();
  const fileName = url.split('/').pop(); // Extrai a parte final da URL
  const file = new File([blob], `${fileName}.webp`, { type: blob.type });

  const worldName = game.world.id;
  const folderPath = `worlds/${worldName}/assets/character-picture`;
  const filePath = `${folderPath}/${fileName}.webp`;

  try {
    await foundry.applications.apps.FilePicker.implementation.browse('data', folderPath);
  } catch (e) {
    if (e.message.includes('does not exist or is not accessible')) {
      const parts = folderPath.split('/');
      for (let i = 1; i <= parts.length; i++) {
        const subPath = parts.slice(0, i).join('/');
        try {
          await foundry.applications.apps.FilePicker.implementation.createDirectory('data', subPath);
        } catch (err) {
          if (!err.message.includes('EEXIST')) {
            throw err;
          }
        }
      }
    } else {
      throw e;
    }
  }

  await foundry.applications.apps.FilePicker.implementation.upload('data', folderPath, file, { bucket: null });

  return filePath;
};

const _addRaceAndClassAbilities = async (actor, raceItem, classItem) => {
  const itemsToAdd = [];

  if (raceItem && raceItem.system.race_abilities) {
    const raceAbilities = await _getItemsFromUUIDs(raceItem.system.race_abilities);
    itemsToAdd.push(...raceAbilities);
  }

  if (classItem && classItem.system.class_abilities) {
    const classAbilities = await _getItemsFromUUIDs(classItem.system.class_abilities);
    itemsToAdd.push(...classAbilities);
  }

  if (itemsToAdd.length > 0) {
    await actor.createEmbeddedDocuments('Item', itemsToAdd);
  }
};

const _getItemsFromUUIDs = async (uuids) => {
  const items = [];
  for (const uuid of uuids) {
    const item = await fromUuid(uuid);
    if (item) items.push(item.toObject());
  }
  return items;
};

/**
 * Extracts the JP race bonus from the new race_mechanic_selections structure.
 * @param {Object} json - Character JSON from Old Dragon Online
 * @returns {string} The selection_key value ('jpd', 'jpc', 'jps') or empty string
 */
const _extractJpRaceBonus = (json) => {
  // Return empty string if array doesn't exist or is empty
  if (!json.race_mechanic_selections || json.race_mechanic_selections.length === 0) {
    return '';
  }

  // Find the first selection with a JP-related selection_key
  // Only jpd, jpc, and jps are valid for race JP bonuses
  const jpSelection = json.race_mechanic_selections.find((selection) =>
    ['jpd', 'jpc', 'jps'].includes(selection.selection_key),
  );

  return jpSelection ? jpSelection.selection_key : '';
};

const _convertCost = (costInPC) => {
  if (costInPC >= 100) {
    return `${Math.floor(costInPC / 100)} PO`;
  } else if (costInPC >= 10) {
    return `${Math.floor(costInPC / 10)} PP`;
  } else {
    return `${costInPC} PC`;
  }
};

const _determineWeaponType = (item) => {
  if (item.throw_range) {
    return 'throwing';
  } else if (item.shoot_range) {
    return 'ranged';
  } else if (item.arrow || item.bolt || item.bolt_small) {
    return 'ammunition';
  } else {
    return 'melee';
  }
};

const _addInventoryItems = async (actor, inventoryItems) => {
  const itemsToAdd = inventoryItems.map((item) => {
    const isEquipped = item.name === 'Mochila' && item.concept === 'container' ? true : item.equipped;

    const itemData = {
      name: item.name,
      type: item.concept,
      system: {
        is_equipped: isEquipped,
        description: item.description,
        quantity: item.quantity,
        cost: _convertCost(item.cost),
        weight_in_load: item.weight_in_load,
        weight_in_grams: item.weight_in_grams,
        magic_item: item.magic_item,
        damage_type: item.damage_type,
        damage: item.damage,
        bonus_damage: item.bonus_damage,
        bonus_ba: item.bonus_ba,
        bonus_ca: item.bonus_ca,
        shoot_range: item.shoot_range,
        throw_range: item.throw_range,
        arrow: item.arrow,
        bolt: item.bolt,
        bolt_small: item.bolt_small,
        polearm: item.polearm,
        two_handed: item.two_handed,
        versatile: item.versatile,
        increases_load_by: item.increases_load_by,
      },
    };

    if (item.concept === 'weapon') {
      itemData.system.type = _determineWeaponType(item);
    }

    return itemData;
  });

  if (itemsToAdd.length > 0) {
    await actor.createEmbeddedDocuments('Item', itemsToAdd);
  }
};

/**
 * Removes all inventory items from an actor, preserving spells.
 * @param {Actor} actor - The Foundry actor
 */
const _removeInventoryItems = async (actor) => {
  const INVENTORY_TYPES = ['weapon', 'armor', 'shield', 'misc', 'container', 'vehicle'];

  const itemsToRemove = actor.items.filter((item) => INVENTORY_TYPES.includes(item.type));

  const itemIds = itemsToRemove.map((item) => item.id);

  if (itemIds.length > 0) {
    await actor.deleteEmbeddedDocuments('Item', itemIds);
  }
};

/**
 * Fetches character data from Old Dragon Online API and updates an existing actor.
 * @param {Actor} actor - The Foundry actor to update
 * @returns {Promise<Actor>} The updated actor
 */
export const updateActor = async (actor) => {
  const odoId = actor.system.odo_id;
  if (!odoId) {
    ui.notifications.error('Este personagem não possui um ID do Old Dragon Online.');
    return actor;
  }

  const apiUrl = `https://olddragon.com.br/personagens/${odoId}.json`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Erro ao buscar dados: ${response.status}`);
    }

    const json = await response.json();

    // Update basic character data
    const updateData = {
      name: json.name,
      'system.level': json.level,
      'system.hp.value': json.health_points,
      'system.hp.max': json.max_hp,
      'system.forca': json.forca,
      'system.destreza': json.destreza,
      'system.constituicao': json.constituicao,
      'system.inteligencia': json.inteligencia,
      'system.sabedoria': json.sabedoria,
      'system.carisma': json.carisma,
      'system.jp_race_bonus': _extractJpRaceBonus(json),
      'system.current_xp': json.experience_points,
      'system.economy.cp': json.money_cp,
      'system.economy.sp': json.money_sp,
      'system.economy.gp': json.money_gp,
      'system.details.alignment': json.alignment,
      'system.details.languages': json.languages.join(', '),
      'system.details.appearance': json.appearance,
      'system.details.personality': json.personality,
      'system.details.background': json.background,
    };

    // Update picture if changed
    if (json.picture) {
      const newImg = await _downloadAndSaveImage(json.picture);
      updateData.img = newImg;
    }

    await actor.update(updateData);

    // Sync inventory items
    await _removeInventoryItems(actor);
    await _addInventoryItems(actor, json.inventory_items);

    ui.notifications.info(`Personagem "${json.name}" atualizado com sucesso!`);
    return actor;
  } catch (error) {
    ui.notifications.error(`Erro ao atualizar personagem: ${error.message}`);
    console.error('Error updating actor from ODO:', error);
    return actor;
  }
};
