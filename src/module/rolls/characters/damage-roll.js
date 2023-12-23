import { BaseRoll } from '../baseRoll';
import { calculateRollResult } from '../utils';
import { truncateString } from '../../helpers';

/**
 * Represents a damage roll in the game.
 *
 * @class DamageRoll
 * @extends {BaseRoll}
 *
 * @property {Actor} actor - The actor making the damage roll.
 * @property {Item} item - The item being used for the damage.
 *
 * @method constructor - Constructs the DamageRoll instance.
 * @method formula - Constructs the formula for the damage roll.
 * @method roll - Performs the damage roll.
 * @method sendMessage - Sends the message for the damage roll.
 */
export class DamageRoll extends BaseRoll {
  constructor(actor, item) {
    super(actor, '1d20');

    this.item = item;
  }

  get itemAttackType() {
    switch (this.item.system.type) {
      case 'melee':
        return 'melee';
      case 'throwing':
        return 'throwing';
      case 'ammunition':
        return 'ranged';
      default:
        return 'melee';
    }
  }

  printFormula(attackMode) {
    const _attackMode = attackMode || this.itemAttackType;

    let formula = this.item.system.damage;

    if (_attackMode === 'melee' || _attackMode === 'throwing') {
      formula += `+${this.actor.system.mod_forca} (M. FOR)`;
    }

    if (this.item.system.bonus_damage) {
      formula += `+ ${this.actor.system.bonus_damage} (bônus)`;
    }

    return formula;
  }

  formula(bonus, attackMode) {
    let formula = `${this.item.system.damage}`;

    if (this.item.system.bonus_damage) {
      formula += `+${this.item.system.bonus_damage}`;
    }

    if (attackMode === 'melee' || attackMode === 'throwing') {
      formula += `+${this.actor.system.mod_forca}`;
    }

    if (bonus) {
      formula += `+${bonus}`;
    }

    return formula;
  }

  formatMessage() {
    return `<h2 class='text-center'>Dano com <strong>${this.item.name}</strong></h2>`;
  }

  /**
   * Roll the dice with the given bonus.
   * @param {number} bonus - The bonus to add to the roll.
   * @returns {Promise<Roll>} The result of the roll.
   */
  async roll(bonus, attackMode) {
    const rollResult = await calculateRollResult(this.formula(bonus, attackMode));

    this.roll_result = rollResult;

    return rollResult.total;
  }

  /**
   * Send the result of the damage roll as a message in the chat.
   * @param {string} mode - The mode of the message (e.g., 'private', 'blind', 'self').
   */
  sendMessage(mode) {
    const message = this.formatMessage();

    this.roll_result.toMessage(
      {
        flavor: message,
        speaker: {
          alias: truncateString(this.characterName, 30),
        },
      },
      { rollMode: this.rollMode(mode) },
    );
  }
}
