export const MEASUREMENT_REGIONS = Object.freeze([
  "waist", "abdomen", "chest", "hips",
  "rightArm", "leftArm", "rightThigh", "leftThigh",
] as const);

export type MeasurementRegion = (typeof MEASUREMENT_REGIONS)[number];

/** Civil dates, YYYY-MM-DD, inclusive, in America/Sao_Paulo; not UTC instants. */
export type MeasurementsPeriod = Readonly<{ startDate: string; endDate: string }>;

/** Kilograms, > 0 and <= 1,000. This is a technical limit, not a clinical range. */
export type WeightRecord = Readonly<{
  id: string;
  date: string | null;
  weightKg: number | null;
  observation?: string | null;
}>;

/**
 * Centimetres, > 0 and <= 500. Regions/sides are independent and all optional.
 * Omitted fields and explicit null both denote absence, never a zero measurement.
 */
export type BodyMeasurementRecord = Readonly<{
  id: string;
  date: string | null;
  values: Readonly<Partial<Record<MeasurementRegion, number | null>>>;
  observation?: string | null;
}>;

export type MeasurementsData = Readonly<{
  source: "personal" | "demo";
  timeZone: "America/Sao_Paulo";
  period: MeasurementsPeriod | null; // Null is allowed only when both collections are empty.
  weightRecords: readonly WeightRecord[];
  measurementRecords: readonly BodyMeasurementRecord[];
}>;

export type MeasurementValueIssue =
  | "missing-value"
  | "invalid-number"
  | "nonpositive-value"
  | "technical-limit-exceeded";

export type MeasurementRecordIssue =
  | "missing-date"
  | "invalid-date"
  | "same-date-conflict"
  | "invalid-observation";

export type MeasurementValueAnalysis = Readonly<{
  // Valid candidate survives conflicts/out-of-period exclusion for inspection.
  value: number | null;
  included: boolean;
  issues: readonly MeasurementValueIssue[];
}>;

export type MeasurementRecordAnalysis = Readonly<{
  id: string;
  date: string | null;
  inPeriod: boolean;
  observation: string | null;
  issues: readonly MeasurementRecordIssue[];
}>;

export type WeightRecordAnalysis = MeasurementRecordAnalysis & Readonly<{
  weight: MeasurementValueAnalysis;
}>;

export type BodyMeasurementRecordAnalysis = MeasurementRecordAnalysis & Readonly<{
  values: Readonly<Record<MeasurementRegion, MeasurementValueAnalysis>>;
}>;

export type MeasurementsRecordsAnalysis = Readonly<{
  // Canonical order: valid dates ascending, unassigned last; ties by exact ID.
  weightRecords: readonly WeightRecordAnalysis[];
  measurementRecords: readonly BodyMeasurementRecordAnalysis[];
}>;

export type MeasurementPoint = Readonly<{
  recordId: string;
  date: string;
  value: number;
}>;

export type SeriesCoverage = Readonly<{
  periodDays: number | null;
  recordCount: number; // Input records with a classifiable date inside the period, including duplicates.
  registeredDates: number; // Distinct dates, not records.
  // Disjoint date categories: conflict > invalid > missing > valid.
  validValueDates: number;
  missingValueDates: number;
  invalidValueDates: number;
  conflictDates: number;
  daysWithoutRecord: number | null;
  unassignedRecordCount: number;
  outOfPeriodRecordCount: number;
  // Integrity of recorded values, not adherence to a daily measurement target.
  // Unassigned records make integrity partial; out-of-period records do not.
  dataCompleteness: "empty" | "partial" | "complete";
}>;

export type MeasurementSeriesSummary<Unit extends "kg" | "cm"> = Readonly<{
  unit: Unit;
  first: MeasurementPoint | null;
  latest: MeasurementPoint | null;
  // Signed latest - first, unrounded; null requires fewer than two eligible dates.
  deltaSigned: number | null;
  points: readonly MeasurementPoint[];
  coverage: SeriesCoverage;
}>;

export type MeasurementsSummary = Readonly<{
  source: "personal" | "demo";
  timeZone: "America/Sao_Paulo";
  period: MeasurementsPeriod | null;
  weight: MeasurementSeriesSummary<"kg">;
  regions: Readonly<Record<MeasurementRegion, MeasurementSeriesSummary<"cm">>>;
  records: MeasurementsRecordsAnalysis;
}>;

/** Structural errors never interpolate IDs, observations or submitted values. */
export class MeasurementsContractError extends Error {
  constructor() {
    super("Dados de peso e medidas inválidos para cálculo.");
    this.name = "MeasurementsContractError";
  }
}
