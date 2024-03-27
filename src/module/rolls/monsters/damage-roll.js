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
 * @method constructor - Constructs the MonsterDamageRoll instance.
 * @method formula - Constructs the formula for the damage roll.
 * @method roll - Performs the damage roll.
 * @method sendMessage - Sends the message for the damage roll.
 */
export class MonsterDamageRoll extends BaseRoll {
  constructor(actor, item) {
    super(actor, '1d20');

    this.item = item;
  }

  printFormula() {
    let formula = this.item.system.damage;

    if (this.item.system.damage_bonus) {
      formula += ` + ${this.item.system.damage_bonus} (bônus)`;
    }

    return formula;
  }

  formula(bonus) {
    let formula = `${this.item.system.damage}`;

    if (this.item.system.damage_bonus) {
      formula += `+${this.item.system.damage_bonus}`;
    }

    if (bonus) {
      formula += `+${bonus}`;
    }

    return formula;
  }

  formatMessage() {
    return `<h2 class='text-center'>Dano com <strong>${this.item.system.description}</strong></h2>`;
  }

  /**
   * Roll the dice with the given bonus.
   * @param {number} bonus - The bonus to add to the roll.
   * @returns {Promise<Roll>} The result of the roll.
   */
  async roll(bonus) {
    const rollResult = await calculateRollResult(this.formula(bonus));

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
