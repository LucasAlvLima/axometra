import type {
  SleepCompleteness, SleepData, SleepIssue, SleepQuality, SleepRecordAnalysis, SleepSummary,
} from "./types";

/** Illustration only: not a clinical recommendation or a personalized goal. */
export const SLEEP_ILLUSTRATIVE_RANGE_MINUTES = Object.freeze({ min: 420, max: 540 } as const);

const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;
const MAX_WINDOW_MINUTES = 1_440; // Technical limit of the one-window-per-night model.

/** Structural contract failures never echo timestamps, observations or IDs. */
export class SleepContractError extends Error {
  constructor() {
    super("Dados de sono inválidos para cálculo.");
    this.name = "SleepContractError";
  }
}

function isCivilDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
}

/**
 * Explicit instant, minute precision. Validate the actual calendar before
 * Date.parse, which otherwise accepts some impossible dates by normalizing.
 * Supported numeric offsets: -14:00..+14:00; -00:00 denotes an unknown offset
 * and is rejected. Z and +00:00 both denote known UTC.
 */
function minuteInstant(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d):00(?:\.000)?(Z|([+-])(\d{2}):([0-5]\d))$/.exec(value);
  if (!match || !isCivilDate(match[1])) return null;
  if (match[4] !== "Z") {
    const hours = Number(match[6]);
    const minutes = Number(match[7]);
    if (hours > 14 || (hours === 14 && minutes !== 0) || match[4] === "-00:00") return null;
  }
  const instant = Date.parse(value);
  return Number.isSafeInteger(instant) && instant % MINUTE_MS === 0 ? instant : null;
}

function wakeDateAt(instant: number, formatter: Intl.DateTimeFormat): string | null {
  const parts = formatter.formatToParts(instant);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((entry) => entry.type === type)?.value;
  if (part("era") !== "AD") return null;
  const value = `${part("year")?.padStart(4, "0")}-${part("month")}-${part("day")}`;
  return isCivilDate(value) ? value : null;
}

/** Validate identity/container metadata. Record-field errors become analysis issues. */
export function validateSleepData(data: SleepData): void {
  if (!data || typeof data !== "object" || (data.source !== "personal" && data.source !== "demo")
    || data.timeZone !== "America/Sao_Paulo" || !Array.isArray(data.records)) throw new SleepContractError();
  if (data.period === null) {
    if (data.records.length > 0) throw new SleepContractError();
  } else if (!data.period || typeof data.period !== "object" || !isCivilDate(data.period.startDate)
    || !isCivilDate(data.period.endDate) || data.period.startDate > data.period.endDate) throw new SleepContractError();

  const ids = new Set<string>();
  for (const record of data.records) {
    if (!record || typeof record !== "object" || typeof record.id !== "string"
      || !record.id.trim() || ids.has(record.id)) throw new SleepContractError();
    ids.add(record.id);
  }
}

type Candidate = {
  id: string;
  startMs: number | null;
  wakeMs: number | null;
  wakeDate: string | null;
  windowMinutes: number | null;
  quality: SleepQuality | null;
  issues: SleepIssue[];
};

function addIssue(candidate: Candidate, issue: SleepIssue): void {
  if (!candidate.issues.includes(issue)) candidate.issues.push(issue);
}

function hasConflict(issues: readonly SleepIssue[]): boolean {
  return issues.includes("same-night-conflict") || issues.includes("overlapping-window");
}

/**
 * Analyze ALL supplied records before period filtering. Same wake dates conflict
 * even when an endpoint is missing/invalid. Overlap uses technically valid
 * windows and half-open intervals [start, wake); touching intervals are allowed.
 * Every involved record is flagged; no longest/latest record is selected, and
 * conflicts already found never remove a window from subsequent overlap checks.
 * The returned array preserves input order without modifying input records.
 */
export function analyzeSleepRecords(data: SleepData): readonly SleepRecordAnalysis[] {
  validateSleepData(data);
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: data.timeZone, calendar: "gregory", numberingSystem: "latn",
    year: "numeric", month: "2-digit", day: "2-digit", era: "short",
  });
  const candidates: Candidate[] = data.records.map((record) => {
    const startMs = minuteInstant(record.startedAt);
    const wakeMs = minuteInstant(record.wokeAt);
    const wakeDate = wakeMs === null ? null : wakeDateAt(wakeMs, formatter);
    const issues: SleepIssue[] = [];
    if (record.startedAt === null) issues.push("missing-start");
    else if (startMs === null) issues.push("invalid-start");
    if (record.wokeAt === null) issues.push("missing-wake");
    else if (wakeDate === null) issues.push("invalid-wake");

    let windowMinutes: number | null = null;
    if (startMs !== null && wakeMs !== null && wakeDate !== null) {
      const minutes = (wakeMs - startMs) / MINUTE_MS;
      if (minutes <= 0) issues.push("nonpositive-window");
      else if (minutes > MAX_WINDOW_MINUTES) issues.push("window-over-24h");
      else windowMinutes = minutes;
    }

    let quality: SleepQuality | null = null;
    if (record.quality !== undefined && record.quality !== null) {
      if (Number.isInteger(record.quality) && record.quality >= 1 && record.quality <= 5) quality = record.quality;
      else issues.push("invalid-quality");
    }
    if (record.observation !== undefined && record.observation !== null && typeof record.observation !== "string") {
      issues.push("invalid-observation");
    }
    return { id: record.id, startMs, wakeMs, wakeDate, windowMinutes, quality, issues };
  });

  const nights = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    if (candidate.wakeDate !== null) {
      const night = nights.get(candidate.wakeDate) ?? [];
      night.push(candidate);
      nights.set(candidate.wakeDate, night);
    }
  }
  for (const night of nights.values()) {
    if (night.length > 1) for (const candidate of night) addIssue(candidate, "same-night-conflict");
  }

  const windows = candidates.flatMap((candidate) => candidate.windowMinutes !== null
    && candidate.startMs !== null && candidate.wakeMs !== null
    ? [{ candidate, start: candidate.startMs, end: candidate.wakeMs }] : [])
    .sort((a, b) => a.start - b.start);
  for (let i = 0; i < windows.length; i += 1) {
    for (let j = i + 1; j < windows.length && windows[j].start < windows[i].end; j += 1) {
      addIssue(windows[i].candidate, "overlapping-window");
      addIssue(windows[j].candidate, "overlapping-window");
    }
  }

  const period = data.period;
  return candidates.map((candidate) => {
    const inPeriod = period !== null && candidate.wakeDate !== null
      && candidate.wakeDate >= period.startDate && candidate.wakeDate <= period.endDate;
    const conflict = hasConflict(candidate.issues);
    return {
      id: candidate.id, wakeDate: candidate.wakeDate, inPeriod,
      windowMinutes: candidate.windowMinutes, quality: candidate.quality,
      durationIncluded: inPeriod && !conflict && candidate.windowMinutes !== null,
      qualityIncluded: inPeriod && !conflict && candidate.quality !== null,
      issues: [...candidate.issues],
    };
  });
}

function completeness(included: number, registered: number, expected: number | null, unassigned: number): SleepCompleteness {
  if (registered === 0 && unassigned === 0) return "empty";
  return unassigned > 0 || included !== registered || (expected !== null && registered < expected) ? "partial" : "complete";
}

/**
 * Pure aggregation of declared windows and subjective quality, without a clock,
 * inference of effective sleep, clinical scoring, rounding or personal/demo merge.
 * Registered nights count distinct classifiable wake dates, even with invalid
 * starts/conflicts. Quality is independent of window validity but excludes
 * conflicts/unclassifiable dates. No observations produces null, never fake zero.
 */
export function summarizeSleep(data: SleepData): SleepSummary {
  const records = analyzeSleepRecords(data);
  const periodNights = data.period === null ? null
    : (Date.parse(`${data.period.endDate}T00:00:00Z`) - Date.parse(`${data.period.startDate}T00:00:00Z`)) / DAY_MS + 1;
  const nights = new Map<string, SleepRecordAnalysis[]>();
  for (const record of records) {
    if (record.inPeriod && record.wakeDate !== null) {
      const night = nights.get(record.wakeDate) ?? [];
      night.push(record);
      nights.set(record.wakeDate, night);
    }
  }

  let validWindowNights = 0;
  let incompleteWindowNights = 0;
  let invalidWindowNights = 0;
  let conflictedNights = 0;
  let qualityEligibleNights = 0;
  let availableQualityCount = 0;
  let missingQualityCount = 0;
  let invalidQualityCount = 0;
  let totalMinutes = 0;
  let rangeNights = 0;
  let qualitySum = 0;
  for (const night of nights.values()) {
    if (night.some((record) => hasConflict(record.issues))) {
      conflictedNights += 1;
      continue;
    }
    const record = night[0]; // Exactly one record: repeated dates were classified as conflicts.
    if (record.durationIncluded && record.windowMinutes !== null) {
      validWindowNights += 1;
      totalMinutes += record.windowMinutes;
      if (record.windowMinutes >= SLEEP_ILLUSTRATIVE_RANGE_MINUTES.min
        && record.windowMinutes <= SLEEP_ILLUSTRATIVE_RANGE_MINUTES.max) rangeNights += 1;
    } else if (record.issues.some((issue) => issue === "invalid-start" || issue === "nonpositive-window" || issue === "window-over-24h")) {
      invalidWindowNights += 1;
    } else incompleteWindowNights += 1;

    qualityEligibleNights += 1;
    if (record.qualityIncluded && record.quality !== null) {
      availableQualityCount += 1;
      qualitySum += record.quality;
    } else if (record.issues.includes("invalid-quality")) invalidQualityCount += 1;
    else missingQualityCount += 1;
  }
  if (!Number.isSafeInteger(totalMinutes) || !Number.isSafeInteger(qualitySum)) throw new SleepContractError();
  const registeredNightCount = nights.size;
  const unassignedRecordCount = records.filter((record) => record.wakeDate === null).length;
  return {
    registeredNights: registeredNightCount || null,
    totalWindowMinutes: validWindowNights ? totalMinutes : null,
    averageWindowMinutes: validWindowNights ? totalMinutes / validWindowNights : null,
    illustrativeRangeNights: validWindowNights ? rangeNights : null,
    averageQuality: availableQualityCount ? qualitySum / availableQualityCount : null,
    coverage: {
      periodNights, registeredNightCount, validWindowNights,
      unregisteredNights: periodNights === null ? null : periodNights - registeredNightCount,
      incompleteWindowNights, invalidWindowNights, conflictedNights,
      qualityEligibleNights, availableQualityCount, missingQualityCount, invalidQualityCount,
      unassignedRecordCount,
      durationCompleteness: completeness(validWindowNights, registeredNightCount, periodNights, unassignedRecordCount),
      qualityCompleteness: completeness(availableQualityCount, registeredNightCount, periodNights, unassignedRecordCount),
    },
    records,
  };
}
