export function truncateString(string, number) {
  // If the length of string is <= to number just return string don't truncate it.
  if (string.length <= number) {
    return string;
  }
  // Return string truncated with '...' concatenated to the end of string.
  return string.slice(0, number) + '...';
}

export function signed_number(number, zero = '+0') {
  if (number === '0') {
    return zero;
  } else if (number < 0) {
    return number.toString();
  } else {
    return `+${number}`;
  }
}
