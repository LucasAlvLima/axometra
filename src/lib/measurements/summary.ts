import {
  MEASUREMENT_REGIONS, MeasurementsContractError,
  type BodyMeasurementRecordAnalysis, type MeasurementPoint,
  type MeasurementRecordAnalysis, type MeasurementRecordIssue,
  type MeasurementRegion, type MeasurementsData, type MeasurementsRecordsAnalysis,
  type MeasurementSeriesSummary, type MeasurementsSummary,
  type MeasurementValueAnalysis, type MeasurementValueIssue,
  type SeriesCoverage, type WeightRecordAnalysis,
} from "./types";

export { MeasurementsContractError } from "./types";

/** Operational caps only; no clinical interpretation, daily target or inference. */
export const MEASUREMENTS_TECHNICAL_LIMITS = Object.freeze({ weightKg: 1_000, centimetres: 500 });

function isObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean {
  return Reflect.ownKeys(value).every((key) => typeof key === "string" && allowed.includes(key));
}

/** Reject calendar normalization (e.g. 2026-02-30), offsets and year 0000. */
function isCivilDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
}

/** Gregorian day ordinal: arithmetic only, without Date/UTC/time-zone conversion. */
function civilDay(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  const previousYear = year - 1;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return previousYear * 365 + Math.floor(previousYear / 4) - Math.floor(previousYear / 100)
    + Math.floor(previousYear / 400) + monthDays.slice(0, month - 1).reduce((sum, days) => sum + days, 0) + day;
}

/**
 * Structural validation only. Individual date/value/observation errors remain
 * inspectable analysis issues. IDs must be unique separately in each collection.
 * Unknown keys are rejected rather than silently swallowing misspelled regions.
 */
export function validateMeasurementsData(data: MeasurementsData): void {
  if (!isObject(data) || !hasOnlyKeys(data, ["source", "timeZone", "period", "weightRecords", "measurementRecords"])
    || (data.source !== "personal" && data.source !== "demo") || data.timeZone !== "America/Sao_Paulo"
    || !Array.isArray(data.weightRecords) || !Array.isArray(data.measurementRecords)) throw new MeasurementsContractError();

  if (data.period === null) {
    if (data.weightRecords.length > 0 || data.measurementRecords.length > 0) throw new MeasurementsContractError();
  } else if (!isObject(data.period) || !hasOnlyKeys(data.period, ["startDate", "endDate"])
    || !isCivilDate(data.period.startDate) || !isCivilDate(data.period.endDate)
    || data.period.startDate > data.period.endDate) throw new MeasurementsContractError();

  for (const [records, body] of [[data.weightRecords, false], [data.measurementRecords, true]] as const) {
    const ids = new Set<string>();
    for (const record of records) {
      if (!isObject(record) || !hasOnlyKeys(record, body
        ? ["id", "date", "values", "observation"] : ["id", "date", "weightKg", "observation"])
        || typeof record.id !== "string" || !record.id.trim() || ids.has(record.id)) throw new MeasurementsContractError();
      ids.add(record.id);
      if (body && (!isObject(record.values) || !hasOnlyKeys(record.values, MEASUREMENT_REGIONS))) throw new MeasurementsContractError();
    }
  }
}

function mapRegions<T>(get: (region: MeasurementRegion) => T): Readonly<Record<MeasurementRegion, T>> {
  return {
    waist: get("waist"), abdomen: get("abdomen"), chest: get("chest"), hips: get("hips"),
    rightArm: get("rightArm"), leftArm: get("leftArm"), rightThigh: get("rightThigh"), leftThigh: get("leftThigh"),
  };
}

function analyzeValue(value: unknown, cap: number, eligible: boolean): MeasurementValueAnalysis {
  const issues: MeasurementValueIssue[] = [];
  let candidate: number | null = null;
  if (value === null || value === undefined) issues.push("missing-value");
  else if (typeof value !== "number" || !Number.isFinite(value)) issues.push("invalid-number");
  else if (value <= 0) issues.push("nonpositive-value");
  else if (value > cap) issues.push("technical-limit-exceeded");
  else candidate = value;
  return { value: candidate, included: eligible && candidate !== null, issues };
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function canonicalOrder(a: MeasurementRecordAnalysis, b: MeasurementRecordAnalysis): number {
  if (a.date === null && b.date !== null) return 1;
  if (a.date !== null && b.date === null) return -1;
  return compareText(a.date ?? "", b.date ?? "") || compareText(a.id, b.id);
}

function conflictingDates(records: readonly Readonly<{ date: string | null }>[]): ReadonlySet<string> {
  const counts = new Map<string, number>();
  for (const record of records) {
    if (isCivilDate(record.date)) counts.set(record.date, (counts.get(record.date) ?? 0) + 1);
  }
  return new Set([...counts].filter(([, count]) => count > 1).map(([date]) => date));
}

function analyzeRecord(
  record: Readonly<{ id: string; date: string | null; observation?: string | null }>,
  data: MeasurementsData,
  conflicts: ReadonlySet<string>,
): MeasurementRecordAnalysis {
  const issues: MeasurementRecordIssue[] = [];
  const date = isCivilDate(record.date) ? record.date : null;
  if (record.date === null || record.date === undefined) issues.push("missing-date");
  else if (date === null) issues.push("invalid-date");
  if (date !== null && conflicts.has(date)) issues.push("same-date-conflict");
  if (record.observation !== undefined && record.observation !== null && typeof record.observation !== "string") {
    issues.push("invalid-observation");
  }
  return {
    id: record.id, date,
    inPeriod: date !== null && data.period !== null && date >= data.period.startDate && date <= data.period.endDate,
    observation: typeof record.observation === "string" ? record.observation : null,
    issues,
  };
}

/**
 * Analyze before filtering: every duplicate date excludes its entire collection's
 * group, including identical, complementary or all-null records. No merging.
 * All records survive, with normalized candidates and flags; no invalid raw
 * number/date/observation is copied into the serializable result.
 */
export function analyzeMeasurementsRecords(data: MeasurementsData): MeasurementsRecordsAnalysis {
  validateMeasurementsData(data);
  const weightConflicts = conflictingDates(data.weightRecords);
  const bodyConflicts = conflictingDates(data.measurementRecords);
  const weightRecords: WeightRecordAnalysis[] = data.weightRecords.map((record) => {
    const analysis = analyzeRecord(record, data, weightConflicts);
    return {
      ...analysis,
      weight: analyzeValue(record.weightKg, MEASUREMENTS_TECHNICAL_LIMITS.weightKg,
        analysis.inPeriod && !analysis.issues.includes("same-date-conflict")),
    };
  });
  const measurementRecords: BodyMeasurementRecordAnalysis[] = data.measurementRecords.map((record) => {
    const analysis = analyzeRecord(record, data, bodyConflicts);
    return {
      ...analysis,
      values: mapRegions((region) => analyzeValue(record.values[region], MEASUREMENTS_TECHNICAL_LIMITS.centimetres,
        analysis.inPeriod && !analysis.issues.includes("same-date-conflict"))),
    };
  });
  return {
    weightRecords: weightRecords.sort(canonicalOrder),
    measurementRecords: measurementRecords.sort(canonicalOrder),
  };
}

function summarizeSeries<Unit extends "kg" | "cm", Row extends MeasurementRecordAnalysis>(
  unit: Unit,
  records: readonly Row[],
  getValue: (record: Row) => MeasurementValueAnalysis,
  periodDays: number | null,
): MeasurementSeriesSummary<Unit> {
  const dates = new Map<string, Row[]>();
  let recordCount = 0;
  let unassignedRecordCount = 0;
  let outOfPeriodRecordCount = 0;
  for (const record of records) {
    if (record.date === null) unassignedRecordCount += 1;
    else if (!record.inPeriod) outOfPeriodRecordCount += 1;
    else {
      recordCount += 1;
      const group = dates.get(record.date) ?? [];
      group.push(record);
      dates.set(record.date, group);
    }
  }
  const points: MeasurementPoint[] = [];
  let conflictDates = 0;
  let invalidValueDates = 0;
  let missingValueDates = 0;
  for (const [date, group] of dates) {
    if (group.some((record) => record.issues.includes("same-date-conflict"))) {
      conflictDates += 1;
      continue;
    }
    const record = group[0];
    const candidate = getValue(record);
    if (candidate.included && candidate.value !== null) points.push({ recordId: record.id, date, value: candidate.value });
    else if (candidate.issues.some((issue) => issue !== "missing-value")) invalidValueDates += 1;
    else missingValueDates += 1;
  }
  const registeredDates = dates.size;
  const validValueDates = points.length;
  const dataCompleteness: SeriesCoverage["dataCompleteness"] = registeredDates === 0 && unassignedRecordCount === 0
    ? "empty" : validValueDates === registeredDates && unassignedRecordCount === 0 ? "complete" : "partial";
  const first = points[0] ?? null;
  const latest = points[points.length - 1] ?? null;
  return {
    unit, first, latest,
    deltaSigned: points.length >= 2 && first !== null && latest !== null ? latest.value - first.value : null,
    points,
    coverage: {
      periodDays, recordCount, registeredDates, validValueDates, missingValueDates,
      invalidValueDates, conflictDates,
      daysWithoutRecord: periodDays === null ? null : periodDays - registeredDates,
      unassignedRecordCount, outOfPeriodRecordCount, dataCompleteness,
    },
  };
}

/**
 * Weight and every region have independent series and coverage. Precision is
 * preserved; latest means latest eligible in-period date, never "today".
 * Signed differences are neutral, not classifications of progress or health.
 */
export function summarizeMeasurements(data: MeasurementsData): MeasurementsSummary {
  const records = analyzeMeasurementsRecords(data);
  const period = data.period === null ? null : { ...data.period };
  const periodDays = period === null ? null : civilDay(period.endDate) - civilDay(period.startDate) + 1;
  return {
    source: data.source, timeZone: data.timeZone, period, records,
    weight: summarizeSeries("kg", records.weightRecords, (record) => record.weight, periodDays),
    regions: mapRegions((region) => summarizeSeries("cm", records.measurementRecords, (record) => record.values[region], periodDays)),
  };
}
