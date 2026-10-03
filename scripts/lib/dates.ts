export function isoDate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** npm serves at most 18 months per download query, so long spans are split. */
export function downloadRanges(from: string, to: string, maxDays = 540): [string, string][] {
  const ranges: [string, string][] = [];
  let start = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (start <= end) {
    const chunkEnd = new Date(start);
    chunkEnd.setUTCDate(chunkEnd.getUTCDate() + maxDays - 1);
    const stop = chunkEnd < end ? chunkEnd : end;
    ranges.push([isoDate(start), isoDate(stop)]);
    start = new Date(stop);
    start.setUTCDate(start.getUTCDate() + 1);
  }
  return ranges;
}
