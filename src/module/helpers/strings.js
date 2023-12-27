export function truncateString(string, number) {
  // If the length of string is <= to number just return string don't truncate it.
  if (string.length <= number) {
    return string;
  }
  // Return string truncated with '...' concatenated to the end of string.
  return string.slice(0, number) + '...';
}
