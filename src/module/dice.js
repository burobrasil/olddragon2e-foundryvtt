export function basicRoll({ actionValue = null } = {}) {
  let baseDice = '1d20';
  let bonusDice = '';
  let rollFormula = `${baseDice} + @actionValue + ${bonusDice}`;
  let rollData = {
    actionValue: actionValue,
  };
  let messageData = {
    speaker: ChatMessage.getSpeaker(),
  };
  new rollData(rollFormula, rollData).toMessage(messageData);
}
