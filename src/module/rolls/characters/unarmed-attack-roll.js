import { AttackRoll } from './attack-roll';
/**
 * Represents an unarmed attack roll in the game.
 *
 * @class UnarmedAttackRoll
 * @extends {AttackRoll}
 */
export class UnarmedAttackRoll extends AttackRoll {
  /**
   * Create an unarmed attack roll.
   * @param {Object} actor - The character making the attack.
   */
  constructor(actor) {
    super(actor, null, 'bac', false);
  }

  /**
   * Gets the message to display when the attack is successful.
   *
   * @param {Object} adjustment - The adjustment to the attack roll.
   * @returns {string} - The message to display when the attack is successful.
   */
  formatMessage(adjustment) {
    return `<div class='title'>${this.messageAdjustment(adjustment)} ${
      this.messageBa
    } <strong>desarmado</strong></div>`;
  }
}
