/** Parses "m:ss" or "m.ss" (also plain minutes) into total seconds. Returns null if invalid. */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') {
    return null;
  }
  const withSeparator = /^(\d+)[:.](\d{1,2})$/.exec(trimmed);
  if (withSeparator) {
    const minutes = Number(withSeparator[1]);
    const seconds = Number(withSeparator[2]);
    if (seconds > 59) {
      return null;
    }
    return minutes * 60 + seconds;
  }
  const minutesOnly = /^(\d+)$/.exec(trimmed);
  if (minutesOnly) {
    return Number(minutesOnly[1]) * 60;
  }
  return null;
}

/** Formats seconds as "m:ss" with zero-padded seconds. */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
