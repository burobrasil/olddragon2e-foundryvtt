import { BaseRoll } from '../baseRoll';
import { calculateRollResult } from '../utils';
import { truncateString } from '../../helpers';

export class MonsterDVRoll extends BaseRoll {
  constructor(actor) {
    super(actor, 'd8');
  }

  get dvInput() {
    return this.actor.system.dv.replace(/d8|\s/g, ''); // Remove 'd8' and spaces from input
  }

  get dvInputIsHalf() {
    return this.dvInput === '½';
  }

  /**
   * Returns the quantity of dice for the DV roll.
   * If the DV value includes 'a', it is treated as a range and the average is returned.
   * If the DV value is not a valid number or empty, the default value of 1 is returned.
   * @returns {number} The quantity of dice for the DV roll.
   */
  get diceQuantity() {
    let dvInput = this.dvInput;
    const dvValue = dvInput.trim();

    if (dvValue.includes('a')) {
      const rangeValues = dvValue.split('a').map((val) => parseInt(val.trim()));
      if (rangeValues.length === 2 && !isNaN(rangeValues[0]) && !isNaN(rangeValues[1])) {
        const min = rangeValues[0];
        const max = rangeValues[1];
        return Math.round((min + max) / 2);
      }
    }

    if (!dvInput || isNaN(dvInput) || !Number.isInteger(parseFloat(dvInput))) {
      dvInput = '1';
    }

    return parseInt(dvInput);
  }

  get dvBonus() {
    let dvBonusInput = this.actor.system.dv_bonus;

    if (!dvBonusInput || isNaN(dvBonusInput) || !Number.isInteger(parseFloat(dvBonusInput))) {
      dvBonusInput = '0';
    }

    return parseInt(dvBonusInput);
  }

  get currentHp() {
    return this.actor.system.hp.value;
  }

  get maxHp() {
    return this.actor.system.hp.max;
  }

  formula(bonus) {
    let formula = `${this.diceQuantity}${this.dice}`;

    if (bonus) {
      formula += `+${bonus}`;
    }

    return formula;
  }

  async roll(bonus) {
    const rollResult = await calculateRollResult(this.formula(bonus));
    this.roll_result = rollResult;

    return rollResult.total;
  }

  /**
   * Calculates the hit points (hp) for a monster's DV roll.
   * @param {boolean} [withBonus=true] - Indicates whether to include the bonus in the calculation.
   * @returns {Object} - An object containing the calculated hit points.
   * @property {number} total - The total hit points.
   * @property {number} [half] - The half hit points, only calculated if the DV input is '½'.
   * @property {number} [totalWithBonus] - The total hit points with bonus, only calculated if withBonus is true and dvBonus is provided.
   * @property {number} [halfWithBonus] - The half hit points with bonus, only calculated if withBonus is true, dvBonus is provided, and the DV input is '½'.
   */

  calculateHp(withBonus = true) {
    let hp = {
      total: 0,
      half: 0,
      totalWithBonus: 0,
      halfWithBonus: 0,
    };
    hp.total = this.roll_result.total;

    if (this.dvInputIsHalf) {
      hp.half = Math.ceil(this.roll_result.total / 2);
    }

    if (withBonus && this.dvBonus) {
      const bonus = parseInt(this.dvBonus || 0);
      hp.totalWithBonus = hp.total + bonus;
      hp.halfWithBonus = hp.half + bonus;
    }

    return hp;
  }

  async updateHp() {
    const hp = this.calculateHp();

    let hpValue = hp.total;
    if (this.dvBonus !== 0) {
      hpValue = hp.totalWithBonus;
    }

    if (this.dvInputIsHalf) {
      hpValue = hp.half;

      if (this.dvBonus !== 0) {
        hpValue = hp.halfWithBonus;
      }
    }

    await this.actor.update({
      'system.hp.value': hpValue,
      'system.hp.max': hpValue,
    });
  }

  /**
   * Formats the message for displaying points of health (hp).
   *
   * @param {Object} hp - The object containing health points information.
   * @param {number} hp.total - The total health points.
   * @param {number} hp.half - The half health points.
   * @param {number} hp.halfWithBonus - The half health points with bonus.
   * @param {number} hp.totalWithBonus - The total health points with bonus.
   * @returns {string} - The formatted message for displaying points of health.
   */

  formatMessage(hp) {
    let bonusText = '';
    let resultText = '';

    let bonus = parseInt(this.dvBonus || 0);
    let hasBonus = bonus !== 0;

    resultText = ` ${hp.total}`;
    if (this.dvInputIsHalf) {
      resultText = ` ${hp.total} &div; 2 &cong; ${hp.half}`;

      if (hasBonus) {
        bonusText = ` + ${bonus} <em>(DV Bônus)</em> = <strong>${hp.halfWithBonus}</strong>`;
        resultText += `${bonusText}`;
      }
    }

    if (!this.dvInputIsHalf && hasBonus) {
      bonusText = ` + ${bonus} <em>(DV Bônus)</em> = <strong>${hp.totalWithBonus}</strong>`;
      resultText = ` ${hp.total}${bonusText}`;
    }

    return `<h2 class="text-center">Rolagem de <strong>Pontos de Vida</strong></h2><p class="text-center">PV Totais: ${resultText}</p>`;
  }

  /**
   * Sends a message with the given mode and hp.
   * @param {string} mode - The mode of the message.
   * @param {number} hp - The hp value to format the message with.
   */

  sendMessage(mode, hp) {
    const message = this.formatMessage(hp);

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
