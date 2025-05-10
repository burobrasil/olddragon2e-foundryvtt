// System settings
export const registerSettings = function () {
  game.settings.register('olddragon2e', 'initiativeType', {
    name: game.i18n.localize('olddragon2e.settings.initiativeType.name'),
    hint: game.i18n.localize('olddragon2e.settings.initiativeType.hint'),
    scope: 'world',
    config: true,
    type: String,
    choices: {
      individual: game.i18n.localize('olddragon2e.settings.initiativeType.choices.individual'),
      standard: game.i18n.localize('olddragon2e.settings.initiativeType.choices.standard'),
    },
    default: 'individual',
    onChange: (value) => {
      // Update the initiative formula based on the choice
      if (value === 'individual') {
        CONFIG.Combat.initiative = {
          formula: '1d12',
          decimals: 0,
        };
      } else if (value === 'standard') {
        CONFIG.Combat.initiative = {
          formula: '1d20',
          decimals: 0,
        };

        // Initialize the custom initiative module
        if (game.olddragon2e && game.olddragon2e.InitiativeModule) {
          game.olddragon2e.InitiativeModule.initializeAttributeInitiative();
        }
      }
    },
  });
};

// Function to get the current initiative type
export const getInitiativeType = function () {
  return game.settings.get('olddragon2e', 'initiativeType');
};
