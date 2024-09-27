export async function calculateRollResult(rollFormula) {
  const roll = new Roll(rollFormula);
  await roll.roll();
  return roll;
}
