import type { DashboardData } from "./types";

// Deliberately fixed, fictional records. Never merge these with personal data.
export const demoDashboard = {
  periodLabel: "5 a 11 de outubro de 2026",
  days: [
    { date: "2026-10-05", weightKg: 80.4, caloriesKcal: 2200, workouts: 1, sleepMinutes: 450 },
    { date: "2026-10-06", weightKg: 80.2, caloriesKcal: 2300, workouts: 0, sleepMinutes: 420 },
    { date: "2026-10-07", weightKg: 80.3, caloriesKcal: 2100, workouts: 1, sleepMinutes: 480 },
    { date: "2026-10-08", weightKg: 80.1, caloriesKcal: 2250, workouts: 0, sleepMinutes: 465 },
    { date: "2026-10-09", weightKg: 80.2, caloriesKcal: 2150, workouts: 1, sleepMinutes: 435 },
    { date: "2026-10-10", weightKg: 79.9, caloriesKcal: 2400, workouts: 1, sleepMinutes: 510 },
    { date: "2026-10-11", weightKg: 80.0, caloriesKcal: 2000, workouts: 0, sleepMinutes: 495 },
  ],
} as const satisfies DashboardData;
