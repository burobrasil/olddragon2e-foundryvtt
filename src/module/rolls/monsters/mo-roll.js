import { BaseRoll } from '../baseRoll';
import { calculateRollResult } from '../utils';
import { truncateString } from '../../helpers';

export class MonsterMORoll extends BaseRoll {
  constructor(actor) {
    super(actor, '2d6');
  }

  get moValue() {
    return Number(this.actor.system.mo);
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
    let moValue = this.moValue;
    moValue += this.formulaAdjustment(adjustment);

    return this.roll_result.total <= moValue;
  }

  formatMessage(adjustment) {
    let result = '<strong class="failure">Falha</strong>';

    if (this._success(adjustment)) {
      result = '<strong class="success">Sucesso!</strong>';
    }

    return `<div class='title'>${this.messageAdjustment(
      adjustment,
    )} <strong>Moral</strong></div><p class='result'>${result}</p>`;
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
