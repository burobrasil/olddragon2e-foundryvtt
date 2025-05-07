import { BaseRoll } from '../baseRoll';
import { calculateRollResult } from '../utils';
import { truncateString } from '../../helpers';

export class KnockoutRoll extends BaseRoll {
  constructor(actor) {
    super(actor, '1d6');
  }

  get knockoutChance() {
    let chance = 1;

    if (this.actor.system.mod_forca > 0 && this.actor.system.mod_forca < 5) {
      chance = this.actor.system.mod_forca;
    }

    return chance;
  }

  get printFormula() {
    return this.dice;
  }

  formula(bonus) {
    let formula = this.dice;

    if (bonus) {
      formula += ` + ${bonus}`;
    }

    return formula;
  }

  formatMessage() {
    let result = '<strong class="failure">Falha</strong>';

    if (this._success) {
      result = '<strong class="success">Sucesso!</strong>';
    }

    return `<div class='title'>Chance de <strong>nocaute</strong></div><p class='result'>${result}</p>`;
  }

  async roll(bonus) {
    const rollResult = await calculateRollResult(this.formula(bonus));

    this.roll_result = rollResult;

    return rollResult.total;
  }

  get _success() {
    return this.roll_result.total <= this.knockoutChance;
  }

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
