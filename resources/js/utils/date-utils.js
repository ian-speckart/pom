export function prettifySeconds(seconds) {
  /**
   * This is a fix for: "the first second is returned as '' if > 0 and < 1"
   * AppTimer steps with precise time, so it doesnt round.
   * The first second is sometimes 1, 0.991, 0.999, etc.
   */
  if (seconds === 0 || (seconds > 0 && seconds < 0.9)) return '0s';
  if (seconds >= 0.9 && seconds < 1) return '1s';

  const isNegative = seconds < 0;
  const absSeconds = Math.abs(seconds);

  const units = [
    { value: 3600, label: 'h' }, // hours
    { value: 60, label: 'm' }, // minutes
    { value: 1, label: 's' }, // seconds
  ];

  let remaining = absSeconds;
  const parts = [];

  for (const { value, label } of units) {
    if (remaining >= value) {
      const count = Math.floor(remaining / value);
      parts.push(`${count}${label}`);
      remaining %= value;
    }
  }

  return `${isNegative ? '-' : ''}${parts.join(' ')}`;
}

export function secondsBetweenUnixMs(date1Ms, date2Ms) {
  // Convert milliseconds to seconds
  const date1Seconds = date1Ms / 1000;
  const date2Seconds = date2Ms / 1000;

  // Calculate the absolute difference in seconds
  const differenceSeconds = Math.abs(date1Seconds - date2Seconds);

  return differenceSeconds;
}
