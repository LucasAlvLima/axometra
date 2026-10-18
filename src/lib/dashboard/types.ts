export type DashboardDay = Readonly<{
  date: string;
  weightKg: number | null;
  caloriesKcal: number | null;
  workouts: number | null;
  sleepMinutes: number | null;
}>;

export type DashboardData = Readonly<{
  periodLabel: string | null;
  days: readonly DashboardDay[];
}>;

export type DashboardMetric = Readonly<{
  id: "weight" | "calories" | "workouts" | "sleep";
  label: string;
  value: string | null;
  unit: string;
  detail: string;
}>;

export type WeightPoint = Readonly<{ date: string; weightKg: number }>;
