import { BaseRoll } from '../baseRoll';
import { calculateRollResult } from '../utils';
import { truncateString, signed_number } from '../../helpers';

/**
 * Represents an attack roll in the game.
 *
 * @class AttackRoll
 * @extends {BaseRoll}
 *
 * @property {Actor} actor - The actor making the attack roll.
 * @property {Item} item - The item being used for the attack.
 *
 * @method constructor - Constructs the MonsterAttackRoll instance.
 * @method formulaAdjustment - Adjusts the formula based on the difficulty of the attack.
 * @method formula - Constructs the formula for the attack roll.
 * @method messageAdjustment - Constructs the message for the adjustment.
 * @method printFormula - Prints the formula for the attack roll.
 * @method formatMessage - Formats the message for the attack roll.
 * @method roll - Performs the attack roll.
 * @method sendMessage - Sends the message for the attack roll.
 */

export class MonsterAttackRoll extends BaseRoll {
  constructor(actor, item) {
    super(actor, '1d20');

    this.item = item;
  }

  get ba() {
    return signed_number(this.item.system.ba) || 0;
  }

  formulaAdjustment(adjustment) {
    switch (adjustment) {
      case 'very-easy':
        return '+5';
      case 'easy':
        return '+2';
      case 'hard':
        return '-2';
      case 'very-hard':
        return '-5';
      default:
        return '';
    }
  }

  formula(bonus, adjustment) {
    let formula = `${this.dice} ${this.formulaAdjustment(adjustment)} ${this.ba}`;

    if (bonus) {
      formula += `+${bonus}`;
    }

    return formula;
  }

  messageAdjustment(adjustment) {
    switch (adjustment) {
      case 'very-easy':
        return 'Ataque (MF)';
      case 'easy':
        return 'Ataque (F)';
      case 'hard':
        return 'Ataque (D)';
      case 'very-hard':
        return 'Ataque (MD)';
      default:
        return 'Ataque';
    }
  }

  get printFormula() {
    return `${this.dice} ${this.ba} (BA)`;
  }

  formatMessage(adjustment) {
    return `<h2 class='text-center'>${this.messageAdjustment(adjustment)} com <strong>${
      this.item.system.description
    }</strong></h2>`;
  }

  /**
   * Roll the dice with the given bonus and adjustment.
   * @param {number} bonus - The bonus to add to the roll.
   * @param {string} adjustment - The adjustment to apply to the roll.
   * @returns {Promise<Roll>} The result of the roll.
   */
  async roll(bonus, adjustment) {
    const rollResult = await calculateRollResult(this.formula(bonus, adjustment));

    this.roll_result = rollResult;

    return rollResult.total;
  }

  /**
   * Send the result of the attack roll as a message in the chat.
   * @param {string} mode - The mode of the message (e.g., 'private', 'blind', 'self').
   * @param {string} adjustment - The adjustment to apply to the roll.
   */
  sendMessage(mode, adjustment) {
    const message = this.formatMessage(adjustment);

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
