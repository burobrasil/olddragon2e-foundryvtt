export async function preloadTemplates() {
  const templatePaths = [
    'systems/olddragon2e/templates/partials/tabs/character-tab-attacks.hbs',
    'systems/olddragon2e/templates/partials/tabs/character-tab-skills.hbs',
    'systems/olddragon2e/templates/partials/tabs/character-tab-spells.hbs',
    'systems/olddragon2e/templates/partials/tabs/character-tab-equipment.hbs',
    'systems/olddragon2e/templates/partials/tabs/character-tab-details.hbs',
    'systems/olddragon2e/templates/partials/tabs/monster-tab-skills.hbs',
    'systems/olddragon2e/templates/partials/tabs/monster-tab-info.hbs',
    'systems/olddragon2e/templates/partials/cards/attack-card.hbs',
    'systems/olddragon2e/templates/partials/cards/weapon-card.hbs',
    'systems/olddragon2e/templates/partials/cards/armor-card.hbs',
    'systems/olddragon2e/templates/partials/cards/shield-card.hbs',
    'systems/olddragon2e/templates/partials/cards/misc-card.hbs',
    'systems/olddragon2e/templates/partials/cards/container-card.hbs',
    'systems/olddragon2e/templates/partials/cards/vehicle-card.hbs',
    'systems/olddragon2e/templates/partials/cards/spell-card.hbs',
  ];

  return loadTemplates(templatePaths);
}
