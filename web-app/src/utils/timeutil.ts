const DAYS_IN_YEAR = 365.25;

export function yearsToDays(years: number | string): number {
  let y: number = typeof years === 'string' ? parseInt(years) : years;
  if (isNaN(y)) {
    y = 1;
  }

  return Math.floor(y * DAYS_IN_YEAR);
}
