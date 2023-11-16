export function addChatListeners(html) {
  html.on('click', '.spell-show', onSpellShow);
}

function onSpellShow(event) {
  event.preventDefault();
  const element = event.currentTarget.closest('.spell');
  let spellCaster = game.actors.get(element.dataset.ownerId);
  let spell = spellCaster.items.get(element.dataset.itemId);

  spell.sheet.render(true);
}
