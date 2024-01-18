import { BaseRoll } from '../baseRoll';
import { calculateRollResult } from '../utils';
import { truncateString } from '../../helpers';

export class JPRoll extends BaseRoll {
  constructor(actor, jpLabel, jpName) {
    super(actor, '1d20');

    this.jpLabel = jpLabel;
    this.jpName = jpName;
  }

  get jpValue() {
    return this.actor.system[`${this.jpName}_total`];
  }

  formulaAdjustment(adjustment) {
    switch (adjustment) {
      case 'very-easy':
        return 5;
      case 'easy':
        return 2;
      case 'hard':
        return -2;
      case 'very-hard':
        return -5;
      default:
        return 0;
    }
  }

  formula(bonus) {
    let formula = this.dice;

    if (bonus) {
      formula += `+${bonus}`;
    }

    return formula;
  }

  messageAdjustment(adjustment) {
    switch (adjustment) {
      case 'very-easy':
        return `Teste (MF) de`;
      case 'easy':
        return `Teste (F) de`;
      case 'hard':
        return `Teste (D) de`;
      case 'very-hard':
        return `Teste (MD) de`;
      default:
        return `Teste de`;
    }
  }

  _success(adjustment) {
    let jpValue = this.jpValue;
    jpValue += this.formulaAdjustment(adjustment);

    console.log(`JP: ${jpValue} / Total: ${this.roll_result.total} ### V/F: ${this.roll_result.total <= jpValue}`);

    return this.roll_result.total <= jpValue;
  }

  formatMessage(adjustment) {
    let result = "<strong style='color:#aa0200;'>FALHA</strong>";

    if (this._success(adjustment)) {
      result = "<strong style='color:#18520b;'>SUCESSO!</strong>";
    }

    return `<h2 class='text-center'>${this.messageAdjustment(adjustment)} <strong>${
      this.jpLabel
    }</strong></h2><p class='text-xl text-center'>${result}</p>`;
  }

  async roll(bonus) {
    const rollResult = await calculateRollResult(this.formula(bonus));

    this.roll_result = rollResult;

    return rollResult.total;
  }

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
