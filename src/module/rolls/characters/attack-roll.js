import { BaseRoll } from '../baseRoll';
import { calculateRollResult } from '../utils';
import { truncateString } from '../../helpers';

/**
 * Represents an attack roll in the game.
 *
 * @class AttackRoll
 * @extends {BaseRoll}
 *
 * @property {Actor} actor - The actor making the attack roll.
 * @property {Item} item - The item being used for the attack.
 * @property {string} baRoll - The base attack roll.
 * @property {boolean} baRollBonus - Indicates if there is a bonus for the base attack roll.
 *
 * @method constructor - Constructs the AttackRoll instance.
 * @method bac - Getter for the melee base attack.
 * @method bad - Getter for the ranged base attack.
 * @method formulaAdjustment - Adjusts the formula based on the difficulty of the attack.
 * @method formula - Constructs the formula for the attack roll.
 * @method messageBa - Constructs the message for the base attack.
 * @method messageAdjustment - Constructs the message for the adjustment.
 * @method printFormula - Prints the formula for the attack roll.
 * @method formatMessage - Formats the message for the attack roll.
 * @method roll - Performs the attack roll.
 * @method sendMessage - Sends the message for the attack roll.
 */

export class AttackRoll extends BaseRoll {
  constructor(actor, item, ba, baBonus) {
    super(actor, '1d20');

    this.item = item;
    this.ba_roll = ba;
    this.ba_bonus = baBonus;
  }

  get bac() {
    return this.characterBac + (this.ba_bonus ? this.item.system.bonus_ba : 0);
  }

  get bad() {
    return this.characterBad + (this.ba_bonus ? this.item.system.bonus_ba : 0);
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
    let formula = `${this.dice} ${this.formulaAdjustment(adjustment)}`;

    if (bonus) {
      formula += `+${bonus}`;
    }

    if (this.ba_roll === 'bac') {
      formula += `+${this.bac}`;
    }

    if (this.ba_roll === 'bad') {
      formula += `+${this.bad}`;
    }

    return formula;
  }

  get messageBa() {
    switch (this.ba_roll) {
      case 'bac':
        return `corpo-a-corpo`;
      case 'bad':
        return `à distância`;
      default:
        return '';
    }
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
    let formula = this.dice;

    if (this.ba_roll === 'bac') {
      formula += ` + ${this.characterBac} (BAC)`;
    }
    if (this.ba_roll === 'bad') {
      formula += ` + ${this.characterBad} (BAD)`;
    }
    if (this.ba_bonus) {
      formula += ` + ${this.item.system.bonus_ba} (bônus)`;
    }

    return formula;
  }

  formatMessage(adjustment) {
    return `<div class='title'>${this.messageAdjustment(adjustment)} ${this.messageBa} com <strong>${
      this.item.name
    }</strong></div>`;
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
