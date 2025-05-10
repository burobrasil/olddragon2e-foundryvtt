// Import JavaScript modules
import { registerHandlebarsHelper } from './helpers';
import { preloadTemplates } from './preloadTemplates.js';

import { olddragon2e } from './config.js';
import * as Chat from './chat.js';
import OD2Item from './OD2Item.js';
import OD2ItemSheet from './sheets/OD2ItemSheet.js';
import OD2CharacterSheet from './sheets/OD2CharacterSheet.js';
import OD2MonsterSheet from './sheets/OD2MonsterSheet.js';
import { renderActorDirectory } from './system/renderActorDirectory.js';
import { registerSettings, getInitiativeType } from './settings.js';
// Importar o módulo de iniciativa diretamente para evitar importação dinâmica
import * as InitiativeModule from './rolls/initiative.js';

import { OD2CharacterDataModel } from './actors/OD2CharacterDataModel.js';
import { OD2MonsterDataModel } from './actors/OD2MonsterDataModel.js';
import {
  OD2WeaponDataModel,
  OD2ArmorDataModel,
  OD2ShieldDataModel,
  OD2EquipmentDataModel,
  OD2ContainerDataModel,
  OD2SpellDataModel,
  OD2RaceDataModel,
  OD2RaceAbilityDataModel,
  OD2ClassDataModel,
  OD2ClassAbilityDataModel,
  OD2MonsterAttackDataModel,
} from './items';

// Initialize system
Hooks.once('init', async () => {
  console.log('olddragon2e | Initializing Old Dragon 2e system');

  // Assign custom classes and constants here

  CONFIG.olddragon2e = olddragon2e;
  CONFIG.Item.documentClass = OD2Item;

  CONFIG.Actor.dataModels = {
    character: OD2CharacterDataModel,
    monster: OD2MonsterDataModel,
  };

  CONFIG.Item.dataModels = {
    weapon: OD2WeaponDataModel,
    armor: OD2ArmorDataModel,
    shield: OD2ShieldDataModel,
    misc: OD2EquipmentDataModel,
    container: OD2ContainerDataModel,
    vehicle: OD2EquipmentDataModel,
    spell: OD2SpellDataModel,
    race: OD2RaceDataModel,
    race_ability: OD2RaceAbilityDataModel,
    class: OD2ClassDataModel,
    class_ability: OD2ClassAbilityDataModel,
    monster_attack: OD2MonsterAttackDataModel,
  };

  foundry.documents.collections.Items.unregisterSheet('core', foundry.appv1.sheets.ItemSheet);
  foundry.documents.collections.Items.registerSheet('olddragon2e', OD2ItemSheet, { makeDefault: true });

  foundry.documents.collections.Actors.unregisterSheet('core', foundry.appv1.sheets.ActorSheet);
  foundry.documents.collections.Actors.registerSheet('olddragon2e', OD2CharacterSheet, {
    types: ['character'],
    label: 'Personagem',
    makeDefault: true,
  });
  foundry.documents.collections.Actors.registerSheet('olddragon2e', OD2MonsterSheet, {
    types: ['monster'],
    label: 'Monstro/Inimigo',
    makeDefault: true,
  });

  // Disponibilizar o módulo de iniciativa globalmente
  game.olddragon2e = game.olddragon2e || {};
  game.olddragon2e.InitiativeModule = InitiativeModule;

  // Registrar configurações do sistema
  registerSettings();

  // Register custom Handlebars helpers
  registerHandlebarsHelper();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
});

// Setup system
Hooks.once('setup', async () => {
  // Do anything after initialization but before ready
});

// When ready
Hooks.once('ready', async () => {
  // Do anything once the system is ready

  // Configurar iniciativa com base nas configurações
  const initiativeType = getInitiativeType();
  if (initiativeType === 'individual') {
    CONFIG.Combat.initiative = {
      formula: '1d12',
      decimals: 0,
    };
    console.log('olddragon2e | Iniciativa individual (1d12) configurada');
  } else if (initiativeType === 'standard') {
    // Usar a iniciativa baseada em atributos
    CONFIG.Combat.initiative = {
      formula: '1d20',
      decimals: 0,
    };

    // Inicializar o módulo de iniciativa personalizada
    InitiativeModule.initializeAttributeInitiative();
    console.log('olddragon2e | Iniciativa standard (baseada em atributos) configurada');
  }
});

// Add any additional hooks if necessary
Hooks.on('renderActorDirectory', renderActorDirectory);
Hooks.on('renderChatLog', (_app, html) => Chat.addChatListeners(html));

Hooks.on('updateItem', (item, data, options, userId) => {
  console.log('olddragon2e | Hooks.on(updateItem)', item, data, options, userId);
});
