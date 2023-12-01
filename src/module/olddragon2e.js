// Import JavaScript modules
import { registerSettings } from './settings.js';
import { preloadTemplates } from './preloadTemplates.js';

import { olddragon2e } from './config.js';
import * as Chat from './chat.js';
import OD2Item from './OD2Item.js';
import OD2ItemSheet from './sheets/OD2ItemSheet.js';
import OD2CharacterSheet from './sheets/OD2CharacterSheet.js';
import OD2MonsterSheet from './sheets/OD2MonsterSheet.js';
import { renderActorDirectory } from './system/renderActorDirectory.js';

// Initialize system
Hooks.once('init', async () => {
  console.log('olddragon2e | Initializing Old Dragon 2e system');

  // Assign custom classes and constants here

  CONFIG.olddragon2e = olddragon2e;
  CONFIG.Item.documentClass = OD2Item;

  Items.unregisterSheet('core', ItemSheet);
  Items.registerSheet('olddragon2e', OD2ItemSheet, { makeDefault: true });

  Actors.unregisterSheet('core', ActorSheet);
  Actors.registerSheet('olddragon2e', OD2CharacterSheet, {
    types: ['character'],
    label: 'Personagem',
    makeDefault: true,
  });
  Actors.registerSheet('olddragon2e', OD2MonsterSheet, {
    types: ['monster'],
    label: 'Monstro/Inimigo',
    makeDefault: true,
  });

  // Register custom system settings
  registerSettings();

  // Preload Handlebars templates
  await preloadTemplates();

  // Register custom sheets (if any)
});

// Setup system
Hooks.once('setup', async () => {
  // Do anything after initialization but before
  // ready
});

// When ready
Hooks.once('ready', async () => {
  // Do anything once the system is ready
});

// Add any additional hooks if necessary
Hooks.on('renderActorDirectory', renderActorDirectory);
Hooks.on('renderChatLog', (_app, html) => Chat.addChatListeners(html));
