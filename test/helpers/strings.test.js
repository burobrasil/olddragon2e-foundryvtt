import { truncateString, signed_number } from '../../src/module/helpers/strings.js';

describe('truncateString', () => {
  it('returns the original string if shorter than limit', () => {
    expect(truncateString('hello', 10)).toBe('hello');
  });

  it('returns the original string if equal to limit', () => {
    expect(truncateString('hello', 5)).toBe('hello');
  });

  it('truncates and adds ellipsis if longer than limit', () => {
    expect(truncateString('hello world', 5)).toBe('hello...');
  });

  it('handles empty string', () => {
    expect(truncateString('', 5)).toBe('');
  });
});

describe('signed_number', () => {
  it('returns +0 for zero by default', () => {
    expect(signed_number('0')).toBe('+0');
  });

  it('returns custom zero string when provided', () => {
    expect(signed_number('0', '±0')).toBe('±0');
  });

  it('returns negative numbers as-is', () => {
    expect(signed_number(-3)).toBe('-3');
    expect(signed_number(-1)).toBe('-1');
  });

  it('adds + prefix to positive numbers', () => {
    expect(signed_number(1)).toBe('+1');
    expect(signed_number(4)).toBe('+4');
    expect(signed_number(10)).toBe('+10');
  });
});
