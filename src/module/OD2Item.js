export default class OD2Item extends Item {
  chatTemplate = {
    attack: 'systems/olddragon2e/templates/partials/cards/attack-card.hbs',
    weapon: 'systems/olddragon2e/templates/partials/cards/weapon-card.hbs',
    armor: 'systems/olddragon2e/templates/partials/cards/armor-card.hbs',
    shield: 'systems/olddragon2e/templates/partials/cards/shield-card.hbs',
    misc: 'systems/olddragon2e/templates/partials/cards/misc-card.hbs',
    container: 'systems/olddragon2e/templates/partials/cards/container-card.hbs',
    vehicle: 'systems/olddragon2e/templates/partials/cards/vehicle-card.hbs',
    spell: 'systems/olddragon2e/templates/chat/spell-chat.hbs',
    race_ability: 'systems/olddragon2e/templates/partials/cards/race_ability-card.hbs',
    class_ability: 'systems/olddragon2e/templates/partials/cards/class_ability-card.hbs',
    monster_attack: 'systems/olddragon2e/templates/partials/cards/monster_attack-card.hbs',
  };

  async roll() {
    let chatData = {
      user: game.user.id,
      speaker: { alias: this.actor.name },
    };

    let cardData = {
      ...this.data,
      owner: this.actor.id,
    };

    chatData.content = await foundry.applications.handlebars.renderTemplate(this.chatTemplate[this.type], cardData);

    chatData.roll = true;

    return ChatMessage.create(chatData);
  }
}
