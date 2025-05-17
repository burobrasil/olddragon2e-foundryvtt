// Constants for initiative results
const INITIATIVE_SUCCESS = 99;
const INITIATIVE_FAILURE = 33;
const INITIATIVE_NPC = 66;
const INITIATIVE_INVALID = 21;

function calculateInitiative(actor, rolled) {
  // Get the actor's dexterity and wisdom attributes
  const dex = Number(actor.system.destreza) || 0;
  const wis = Number(actor.system.sabedoria) || 0;
  const bestAttribute = Math.max(dex, wis);

  // Warn if attributes are invalid
  if (dex === 0 || wis === 0) {
    ui.notifications.warn(game.i18n.format('olddragon2e.initiative.invalid_attributes', { name: actor.name }));
    return { initiative: INITIATIVE_INVALID, success: false, bestAttribute };
  }

  // Determine success based on the rolled value
  const success = rolled <= bestAttribute;
  const initiative = success ? INITIATIVE_SUCCESS : INITIATIVE_FAILURE;

  return { initiative, success, bestAttribute };
}

function truncateName(name, maxLength = 10) {
  // Truncate the name if it exceeds the maximum length
  return name.length > maxLength ? name.slice(0, maxLength) + '…' : name;
}

function buildInitiativeReport(successes, failures, npcs, combatantsWithoutInitiative) {
  // Build the initiative report as an HTML string
  let report = `<div class="title">${game.i18n.localize('olddragon2e.initiative.test')}</div>`;
  if (combatantsWithoutInitiative.length > 0) {
    report += `<p><i>${game.i18n.localize('olddragon2e.initiative.auto_rolled')}</i></p>`;
  }

  report += `
    <table style="width:100%; border-collapse: collapse; margin: auto;">
      <tr>
        <th style="text-align:left; padding: 2px;">${game.i18n.localize('olddragon2e.initiative.combatant')}</th>
        <th style="text-align:center; padding: 2px;">${game.i18n.localize('olddragon2e.initiative.roll')}</th>
        <th style="text-align:center; padding: 2px;">${game.i18n.localize('olddragon2e.initiative.target')}</th>
        <th style="text-align:center; padding: 2px;">${game.i18n.localize('olddragon2e.initiative.result')}</th>
      </tr>`;

  // Add rows for successes
  for (const s of successes) {
    report += `
      <tr>
        <td style="padding: 2px;">${truncateName(s.name, 10)}</td>
        <td style="text-align:center; padding: 2px;">${s.rolled}</td>
        <td style="text-align:center; padding: 2px;">${s.bestAttribute}</td>
        <td style="text-align:left; padding: 2px;">✅ ${game.i18n.localize('olddragon2e.success')}</td>
      </tr>`;
  }

  // Add rows for NPCs
  for (const n of npcs) {
    report += `
      <tr>
        <td style="padding: 2px;">${truncateName(n.name, 10)}</td>
        <td style="text-align:center; padding: 2px;">—</td>
        <td style="text-align:center; padding: 2px;">—</td>
        <td style="text-align:left; padding: 2px;">👾 ${game.i18n.localize('olddragon2e.initiative.npc')}</td>
      </tr>`;
  }

  // Add rows for failures
  for (const f of failures) {
    report += `
      <tr>
        <td style="padding: 2px;">${truncateName(f.name, 10)}</td>
        <td style="text-align:center; padding: 2px;">${f.rolled}</td>
        <td style="text-align:center; padding: 2px;">${f.bestAttribute}</td>
        <td style="text-align:left; padding: 2px;">❌ ${game.i18n.localize('olddragon2e.failure')}</td>
      </tr>`;
  }

  report += `</table>`;
  return report;
}

// Export constants and functions for use in other modules
export const INITIATIVE = {
  SUCCESS: INITIATIVE_SUCCESS,
  FAILURE: INITIATIVE_FAILURE,
  NPC: INITIATIVE_NPC,
  INVALID: INITIATIVE_INVALID,
};

export { calculateInitiative, buildInitiativeReport };

// Function to check if standard initiative is active
function isStandardInitiativeActive() {
  // If the game is not fully initialized, return false
  if (!game || !game.settings || !game.settings.get) return false;

  try {
    const initiativeType = game.settings.get('olddragon2e', 'initiativeType');
    return initiativeType === 'standard';
  } catch (error) {
    console.error(game.i18n.localize('olddragon2e.initiative.error_checking_type'), error);
    return false;
  }
}

// Function to remove initiative hooks
function removeInitiativeHooks() {
  Hooks.off('preUpdateCombat', handlePreUpdateCombat);
  Hooks.off('createCombatant', handleCreateCombatant);
  Hooks.off('updateCombat', handleUpdateCombat);
}

// Handlers for initiative hooks
async function handlePreUpdateCombat(combat, update) {
  // Check again if standard initiative is active
  if (!isStandardInitiativeActive()) {
    removeInitiativeHooks();
    return;
  }

  const currentRound = combat.round;
  const newRound = foundry.utils.getProperty(update, 'round');
  if (newRound !== 1 || currentRound >= 1) return;

  const combatantsWithoutInitiative = combat.combatants.contents.filter((c) => c.initiative === null);

  if (combat.getFlag('world', 'initiativeProcessed') && combatantsWithoutInitiative.length === 0) {
    return;
  }

  if (combatantsWithoutInitiative.length > 0) {
    ui.notifications.info(game.i18n.localize('olddragon2e.initiative.auto_rolling_notification'));

    for (const c of combatantsWithoutInitiative) {
      const roll = await new Roll('1d20').roll();
      await combat.setInitiative(c.id, roll.total);
    }
  }

  const successes = [];
  const failures = [];
  const npcs = [];

  for (const combatant of combat.combatants.contents) {
    const actor = combatant.actor;
    if (!actor) continue;
    const isVisible = !combatant.hidden;

    if (actor.type !== 'character') {
      await combat.setInitiative(combatant.id, INITIATIVE_NPC);

      if (isVisible) {
        npcs.push({
          name: actor.name,
        });
      }

      continue;
    }

    const rolled = combatant.initiative ?? 0;
    const { initiative, success, bestAttribute } = calculateInitiative(actor, rolled);

    await combat.setInitiative(combatant.id, initiative);
    await combatant.setFlag('world', 'old-dragon-2e-standard-initiative', {
      success,
      value: rolled,
      attribute: bestAttribute,
    });

    if (isVisible) {
      const entry = {
        name: actor.name,
        rolled,
        bestAttribute,
        success,
      };

      if (success) {
        successes.push(entry);
      } else {
        failures.push(entry);
      }
    }
  }

  await combat.setupTurns();

  await combat.setFlag('world', 'initiativeProcessed', true);

  const initiativeReport = buildInitiativeReport(successes, failures, npcs, combatantsWithoutInitiative);

  await ChatMessage.create({
    user: game.user.id,
    speaker: { alias: game.i18n.localize('olddragon2e.initiative.system') },
    content: initiativeReport,
    type: CONST.CHAT_MESSAGE_STYLES.OTHER,
  });
}

async function handleCreateCombatant(combatant) {
  // Check again if standard initiative is active
  if (!isStandardInitiativeActive()) {
    removeInitiativeHooks();
    return;
  }

  const combat = combatant.combat;
  if (!combat || combat.round < 1) return;

  const actor = combatant.actor;
  if (!actor || combatant.initiative !== null) return;
  const isVisible = !combatant.hidden;

  const roll = await new Roll('1d20').roll();

  if (isVisible) {
    await roll.toMessage({ speaker: ChatMessage.getSpeaker({ actor }) });
  }

  if (actor.type !== 'character') {
    await combat.setInitiative(combatant.id, INITIATIVE_NPC);
    return;
  }

  const { initiative } = calculateInitiative(actor, roll.total);
  await combat.setInitiative(combatant.id, initiative);
  await combat.setupTurns();
}

async function handleUpdateCombat(combat, update) {
  // Check again if standard initiative is active
  if (!isStandardInitiativeActive()) {
    removeInitiativeHooks();
    return;
  }

  if (update?.combatants) {
    const initiativeReset = update.combatants.some(
      (c) => Object.prototype.hasOwnProperty.call(c, 'initiative') && c.initiative === null,
    );
    if (initiativeReset) {
      await combat.unsetFlag('world', 'initiativeProcessed');
    }
  }
}

// Function to initialize initiative hooks
export function initializeAttributeInitiative() {
  if (game.system.id !== 'olddragon2e') return;

  // Check if standard initiative is active
  if (!isStandardInitiativeActive()) {
    return;
  }

  CONFIG.Combat.initiative = {
    formula: '1d20',
    decimals: 0,
  };

  // Register hooks with handler functions
  Hooks.on('preUpdateCombat', handlePreUpdateCombat);
  Hooks.on('createCombatant', handleCreateCombatant);
  Hooks.on('updateCombat', handleUpdateCombat);

  // Register a hook for when settings are updated
  Hooks.on('updateSetting', (setting, data) => {
    if (setting.key === 'olddragon2e.initiativeType') {
      if (data.value === 'individual') {
        removeInitiativeHooks();
      } else if (data.value === 'standard') {
        // Reactivate hooks if necessary
        initializeAttributeInitiative();
      }
    }
  });
}
