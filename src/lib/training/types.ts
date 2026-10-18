/** Civil dates are YYYY-MM-DD, inclusive, in America/Sao_Paulo. */
export type TrainingPeriod = Readonly<{
  startDate: string;
  endDate: string;
  timeZone: "America/Sao_Paulo";
}>;

export type TrainingLoad =
  | Readonly<{ kind: "external"; totalKg: number | null }>
  | Readonly<{ kind: "bodyweight" }>
  | Readonly<{ kind: "assisted"; assistanceKg: number | null }>;

/**
 * Both: repetitions of a simultaneous movement; totalKg includes both dumbbells
 * or the complete barbell. Unilateral: one effort per performed side, with that
 * side's load/repetitions. Never add a both effort to left/right efforts.
 * Unknown repetitions/load are null; an explicitly recorded zero remains zero.
 */
export type TrainingEffort = Readonly<{
  side: "both" | "left" | "right";
  repetitions: number | null;
  load: TrainingLoad;
}>;

export type TrainingSet = Readonly<{
  id: string;
  kind: "work" | "warmup";
  completed: boolean;
  efforts: readonly TrainingEffort[];
}>;

export type TrainingExercise = Readonly<{
  id: string;
  name: string;
  sets: readonly TrainingSet[];
}>;

export type TrainingSession = Readonly<{
  id: string;
  date: string;
  divisionId: string;
  status: "planned" | "in-progress" | "completed";
  exercises: readonly TrainingExercise[];
}>;

export type TrainingData = Readonly<{
  source: "personal" | "demo";
  period: TrainingPeriod | null;
  divisions: readonly Readonly<{ id: string; label: string }>[];
  sessions: readonly TrainingSession[];
}>;

/**
 * Counts describe effort segments in completed work sets, not sessions/sets.
 * Empty completed sets contribute one missing segment. Bodyweight/assisted
 * segments are excluded: no body mass or assistance conversion is estimated.
 * With missing segments, value is only the known subtotal (possibly null).
 * Empty means no quantifiable external volume and no missing external segment.
 */
export type TrainingVolume = Readonly<{
  value: number | null;
  unit: "kg·rep";
  completeness: "empty" | "complete" | "partial";
  includedCount: number;
  missingCount: number;
  excludedCount: number;
}>;

export type TrainingExerciseSummary = Readonly<{
  id: string;
  completedWorkSets: number;
  externalVolume: TrainingVolume;
}>;

export type TrainingSessionSummary = Readonly<{
  id: string;
  completedWorkSets: number;
  externalVolume: TrainingVolume;
  exercises: readonly TrainingExerciseSummary[];
}>;

export type TrainingSummary = Readonly<{
  // No sessions in the period: null; known sessions but none completed: zero.
  completedSessions: number | null;
  completedWorkSets: number | null;
  externalVolume: TrainingVolume;
  sessions: readonly TrainingSessionSummary[];
}>;
