export class BaseRoll {
  constructor(actor, dice) {
    this.dice = dice;
    this.actor = actor;
  }

  get characterName() {
    return this.actor.name;
  }

  get characterBac() {
    return this.actor.system.bac;
  }

  get characterBad() {
    return this.actor.system.bad;
  }

  rollMode(mode) {
    switch (mode) {
      case 'private':
        return CONST.DICE_ROLL_MODES.PRIVATE;
      case 'blind':
        return CONST.DICE_ROLL_MODES.BLIND;
      case 'self':
        return CONST.DICE_ROLL_MODES.SELF;
      default:
        return CONST.DICE_ROLL_MODES.PUBLIC;
    }
  }
}
