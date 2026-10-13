/** The time a writer stamps on a record, to the second, so same-day records keep their order. */
export function recordTime(date: Date = new Date()): string {
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/** A record date: `YYYY-MM-DD`, or an ISO 8601 timestamp with a time zone when the day is too coarse. */
export function isRecordDate(value: unknown): value is string {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

/** Records written before timestamps carry only the day; new and changed dates must carry the time. */
export function isRecordTimestamp(value: string): boolean {
  return isRecordDate(value) && value.includes("T");
}

export const RECORD_DATE_FORMAT = "YYYY-MM-DD or an ISO 8601 timestamp with a time zone";
