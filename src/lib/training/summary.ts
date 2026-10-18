import type {
  TrainingData, TrainingExerciseSummary, TrainingSessionSummary, TrainingSummary, TrainingVolume,
} from "./types";

/** Invalid records fail explicitly, without echoing record contents. */
export class TrainingContractError extends Error {
  constructor() {
    super("Dados de treino inválidos para cálculo.");
    this.name = "TrainingContractError";
  }
}

function finiteNonnegative(value: number | null, integer = false): void {
  if (value !== null && (!Number.isFinite(value) || value < 0 || (integer && !Number.isSafeInteger(value)))) {
    throw new TrainingContractError();
  }
}

function civilDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
}

function validate(data: TrainingData): void {
  // IDs identify records globally within this dataset, including nested sets.
  const ids = new Set<string>();
  const unique = (id: string) => {
    if (!id.trim() || ids.has(id)) throw new TrainingContractError();
    ids.add(id);
  };
  if (data.source !== "personal" && data.source !== "demo") throw new TrainingContractError();
  if (data.period === null) {
    if (data.sessions.length) throw new TrainingContractError();
  } else if (!civilDate(data.period.startDate) || !civilDate(data.period.endDate)
    || data.period.startDate > data.period.endDate || data.period.timeZone !== "America/Sao_Paulo") {
    throw new TrainingContractError();
  }
  const divisionIds = new Set(data.divisions.map((division) => division.id));
  for (const division of data.divisions) unique(division.id);
  for (const session of data.sessions) {
    unique(session.id);
    if (!civilDate(session.date) || !divisionIds.has(session.divisionId)
      || !["planned", "in-progress", "completed"].includes(session.status)) throw new TrainingContractError();
    for (const exercise of session.exercises) {
      unique(exercise.id);
      for (const set of exercise.sets) {
        unique(set.id);
        if ((set.kind !== "work" && set.kind !== "warmup") || typeof set.completed !== "boolean") {
          throw new TrainingContractError();
        }
        const sides = new Set<string>();
        for (const effort of set.efforts) {
          if (!["both", "left", "right"].includes(effort.side) || sides.has(effort.side)) {
            throw new TrainingContractError();
          }
          sides.add(effort.side);
          finiteNonnegative(effort.repetitions, true);
          switch (effort.load.kind) {
            case "external": finiteNonnegative(effort.load.totalKg); break;
            case "bodyweight": break;
            case "assisted": finiteNonnegative(effort.load.assistanceKg); break;
            default: throw new TrainingContractError();
          }
        }
        if (sides.has("both") && sides.size > 1) throw new TrainingContractError();
      }
    }
  }
}

function volume(value: number | null = null, includedCount = 0, missingCount = 0, excludedCount = 0): TrainingVolume {
  if (value !== null && !Number.isFinite(value)) throw new TrainingContractError();
  return {
    value, unit: "kg·rep", includedCount, missingCount, excludedCount,
    completeness: missingCount > 0 ? "partial" : includedCount > 0 ? "complete" : "empty",
  };
}

function combine(values: readonly TrainingVolume[]): TrainingVolume {
  let sum = 0;
  let included = 0;
  let missing = 0;
  let excluded = 0;
  for (const item of values) {
    sum += item.value ?? 0;
    if (!Number.isFinite(sum)) throw new TrainingContractError();
    included += item.includedCount;
    missing += item.missingCount;
    excluded += item.excludedCount;
  }
  return volume(included ? sum : null, included, missing, excluded);
}

/** Pure aggregation. No clock, user/session access, caching, formatting or rounding. */
export function summarizeTraining(data: TrainingData): TrainingSummary {
  validate(data);
  const period = data.period;
  const sessions: TrainingSessionSummary[] = data.sessions
    .filter((session) => period !== null && session.date >= period.startDate && session.date <= period.endDate)
    .map((session) => {
      const exercises: TrainingExerciseSummary[] = session.exercises.map((exercise) => {
        const sets = exercise.sets.filter((set) => session.status === "completed" && set.completed && set.kind === "work");
        const contributions = sets.flatMap((set) => set.efforts.length === 0 ? [volume(null, 0, 1)] : set.efforts.map((effort) => {
          if (effort.load.kind !== "external") return volume(null, 0, 0, 1);
          if (effort.repetitions === null || effort.load.totalKg === null) return volume(null, 0, 1);
          return volume(effort.repetitions * effort.load.totalKg, 1);
        }));
        return { id: exercise.id, completedWorkSets: sets.length, externalVolume: combine(contributions) };
      });
      return {
        id: session.id,
        completedWorkSets: exercises.reduce((sum, exercise) => sum + exercise.completedWorkSets, 0),
        externalVolume: combine(exercises.map((exercise) => exercise.externalVolume)),
        exercises,
      };
    });
  const completedSessions = data.sessions.filter((session) => period !== null
    && session.date >= period.startDate && session.date <= period.endDate && session.status === "completed").length;
  return {
    completedSessions: sessions.length ? completedSessions : null,
    completedWorkSets: sessions.length ? sessions.reduce((sum, session) => sum + session.completedWorkSets, 0) : null,
    externalVolume: combine(sessions.map((session) => session.externalVolume)),
    sessions,
  };
}
