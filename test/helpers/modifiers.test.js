import { calculateAttributeModifier } from '../../src/module/helpers/modifiers.js';

describe('calculateAttributeModifier', () => {
  // Old Dragon 2e modifier table:
  // 1     = -4
  // 2-3   = -3
  // 4-5   = -2
  // 6-8   = -1
  // 9-12  = 0
  // 13-14 = +1
  // 15-16 = +2
  // 17-18 = +3
  // 19+   = +4

  it('returns -4 for value 1', () => {
    expect(calculateAttributeModifier(1)).toBe(-4);
    expect(calculateAttributeModifier(0)).toBe(-4);
  });

  it('returns -3 for values 2-3', () => {
    expect(calculateAttributeModifier(2)).toBe(-3);
    expect(calculateAttributeModifier(3)).toBe(-3);
  });

  it('returns -2 for values 4-5', () => {
    expect(calculateAttributeModifier(4)).toBe(-2);
    expect(calculateAttributeModifier(5)).toBe(-2);
  });

  it('returns -1 for values 6-8', () => {
    expect(calculateAttributeModifier(6)).toBe(-1);
    expect(calculateAttributeModifier(7)).toBe(-1);
    expect(calculateAttributeModifier(8)).toBe(-1);
  });

  it('returns 0 for values 9-12', () => {
    expect(calculateAttributeModifier(9)).toBe(0);
    expect(calculateAttributeModifier(10)).toBe(0);
    expect(calculateAttributeModifier(11)).toBe(0);
    expect(calculateAttributeModifier(12)).toBe(0);
  });

  it('returns +1 for values 13-14', () => {
    expect(calculateAttributeModifier(13)).toBe(1);
    expect(calculateAttributeModifier(14)).toBe(1);
  });

  it('returns +2 for values 15-16', () => {
    expect(calculateAttributeModifier(15)).toBe(2);
    expect(calculateAttributeModifier(16)).toBe(2);
  });

  it('returns +3 for values 17-18', () => {
    expect(calculateAttributeModifier(17)).toBe(3);
    expect(calculateAttributeModifier(18)).toBe(3);
  });

  it('returns +4 for values 19+', () => {
    expect(calculateAttributeModifier(19)).toBe(4);
    expect(calculateAttributeModifier(20)).toBe(4);
    expect(calculateAttributeModifier(25)).toBe(4);
  });
});
