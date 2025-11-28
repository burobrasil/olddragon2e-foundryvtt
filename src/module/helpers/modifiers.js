/**
 * Calculate attribute modifier based on Old Dragon 2e rules
 * @param {number} value - The attribute value (1-19+)
 * @returns {number} The modifier (-4 to +4)
 */
export function calculateAttributeModifier(value) {
  if (value < 2) return -4;
  if (value < 4) return -3;
  if (value < 6) return -2;
  if (value < 9) return -1;
  if (value < 13) return 0;
  if (value < 15) return 1;
  if (value < 17) return 2;
  if (value < 19) return 3;
  return 4;
}
