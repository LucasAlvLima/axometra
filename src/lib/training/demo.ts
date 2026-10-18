import type { TrainingData, TrainingExercise } from "./types";

// Fixed fictional records. Each series is an individual record, not a multiplier.
function exercise(id: string, name: string, totalKg: number): TrainingExercise {
  return {
    id,
    name,
    sets: [1, 2, 3].map((position) => ({
      id: `${id}-set-${position}`,
      kind: "work",
      completed: true,
      efforts: [{ side: "both", repetitions: 10, load: { kind: "external", totalKg } }],
    })),
  };
}

export const demoTraining = {
  source: "demo",
  period: {
    startDate: "2026-10-05",
    endDate: "2026-10-11",
    timeZone: "America/Sao_Paulo",
  },
  divisions: [
    { id: "division-a", label: "Divisão A" },
    { id: "division-b", label: "Divisão B" },
  ],
  sessions: [
    {
      id: "session-05", date: "2026-10-05", divisionId: "division-a", status: "completed",
      exercises: [
        exercise("05-squat", "Agachamento", 60),
        exercise("05-bench", "Supino", 40),
        exercise("05-row", "Remada", 40),
      ],
    },
    {
      id: "session-07", date: "2026-10-07", divisionId: "division-b", status: "completed",
      exercises: [
        exercise("07-deadlift", "Terra romeno", 60),
        exercise("07-press", "Desenvolvimento", 20),
        exercise("07-pulldown", "Puxada", 40),
      ],
    },
    {
      id: "session-09", date: "2026-10-09", divisionId: "division-a", status: "completed",
      exercises: [
        exercise("09-squat", "Agachamento", 60),
        exercise("09-bench", "Supino", 40),
        exercise("09-row", "Remada", 40),
      ],
    },
    {
      id: "session-10", date: "2026-10-10", divisionId: "division-b", status: "completed",
      exercises: [
        exercise("10-deadlift", "Terra romeno", 60),
        exercise("10-press", "Desenvolvimento", 20),
        exercise("10-pulldown", "Puxada", 40),
      ],
    },
  ],
} as const satisfies TrainingData;

export const emptyTraining = {
  source: "personal", period: null, divisions: [], sessions: [],
} as const satisfies TrainingData;
