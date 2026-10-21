export type SleepQuality = 1 | 2 | 3 | 4 | 5;

/**
 * Declared window, not measured effective sleep. Instants use explicit Z/offset,
 * full calendar dates and minute precision (:00 seconds; optional .000).
 * Null endpoints preserve incomplete records; quality/observation are optional.
 */
export type SleepRecord = Readonly<{
  id: string;
  startedAt: string | null;
  wokeAt: string | null;
  quality?: SleepQuality | null;
  observation?: string | null;
}>;

export type SleepPeriod = Readonly<{
  startDate: string; // YYYY-MM-DD civil date, inclusive.
  endDate: string;   // YYYY-MM-DD civil date, inclusive.
}>;

export type SleepData = Readonly<{
  source: "personal" | "demo";
  timeZone: "America/Sao_Paulo";
  period: SleepPeriod | null; // Null only when there are no records.
  records: readonly SleepRecord[];
}>;

export type SleepIssue =
  | "missing-start"
  | "missing-wake"
  | "invalid-start"
  | "invalid-wake"
  | "nonpositive-window"
  | "window-over-24h"
  | "invalid-quality"
  | "invalid-observation"
  | "same-night-conflict"
  | "overlapping-window";

export type SleepRecordAnalysis = Readonly<{
  id: string;
  // Derived from the wake instant in America/Sao_Paulo, never the input prefix.
  wakeDate: string | null;
  inPeriod: boolean;
  // Technically valid candidate window; conflicts retain it for inspection.
  windowMinutes: number | null;
  quality: SleepQuality | null;
  durationIncluded: boolean;
  qualityIncluded: boolean;
  issues: readonly SleepIssue[];
}>;

export type SleepCompleteness = "empty" | "partial" | "complete";

export type SleepCoverage = Readonly<{
  periodNights: number | null;
  registeredNightCount: number;
  validWindowNights: number;
  unregisteredNights: number | null;
  // Disjoint registered-night categories: conflict > invalid > incomplete > valid.
  incompleteWindowNights: number;
  invalidWindowNights: number;
  conflictedNights: number;
  // Quality is independent of duration, but excludes all conflicting nights.
  qualityEligibleNights: number;
  availableQualityCount: number;
  missingQualityCount: number;
  invalidQualityCount: number;
  // Invalid/missing wake dates cannot be assigned to the selected period.
  unassignedRecordCount: number;
  durationCompleteness: SleepCompleteness;
  qualityCompleteness: SleepCompleteness;
}>;

export type SleepSummary = Readonly<{
  // Distinct classifiable wake dates, including incomplete/invalid/conflicting nights.
  // No classifiable nights: null, with the reason retained in coverage/analyses.
  registeredNights: number | null;
  // Valid, nonconflicting windows only. Sum and mean use the same denominator.
  totalWindowMinutes: number | null;
  averageWindowMinutes: number | null;
  // Illustrative 420..540 minutes inclusive; not a clinical/personal sleep target.
  // No valid windows: null. Valid windows all outside the range: genuine zero.
  illustrativeRangeNights: number | null;
  averageQuality: number | null;
  coverage: SleepCoverage;
  // All supplied records, in input order, including out-of-period/unassigned ones.
  // Use inPeriod and inclusion flags when building a period chart/list.
  records: readonly SleepRecordAnalysis[];
}>;
