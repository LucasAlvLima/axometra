/** Values describe the consumed quantity, never implicitly a 100 g/ml basis. */
export type NutritionValues = Readonly<{
  proteinG: number | null;
  carbohydrateG: number | null;
  fatG: number | null;
  reportedEnergyKcal: number | null;
}>;

export type NutritionItem = Readonly<{
  id: string;
  label: string;
  amount: Readonly<{ value: number; unit: "g" | "ml" | "portion" }>;
  nutrients: NutritionValues;
}>;

export type NutritionMeal = Readonly<{
  id: string;
  label: string;
  localTime: string; // HH:mm in the day's timeZone.
  items: readonly NutritionItem[];
}>;

export type NutritionDay = Readonly<{
  source: "personal" | "demo";
  date: string | null; // YYYY-MM-DD civil date; null only for an empty view.
  timeZone: "America/Sao_Paulo";
  meals: readonly NutritionMeal[];
}>;

/** Counts refer to consumed items. Partial values are known subtotals, not totals. */
export type NutritionMetric = Readonly<{
  value: number | null;
  completeness: "empty" | "complete" | "partial";
  includedCount: number;
  missingCount: number;
}>;

export type NutritionDistribution = Readonly<{
  // Percent of estimated macro energy, not percent of grams/reported kcal.
  proteinPercent: number;
  carbohydratePercent: number;
  fatPercent: number;
}>;

export type NutritionTotals = Readonly<{
  proteinG: NutritionMetric;
  carbohydrateG: NutritionMetric;
  fatG: NutritionMetric;
  reportedEnergyKcal: NutritionMetric;
  estimatedEnergyKcal: NutritionMetric;
  distribution: NutritionDistribution | null;
  // Reported minus estimated, only when both energy aggregates are complete.
  energyDifferenceKcal: number | null;
}>;

export type NutritionItemSummary = NutritionTotals & Readonly<{ id: string }>;
export type NutritionMealSummary = NutritionTotals & Readonly<{
  id: string;
  items: readonly NutritionItemSummary[];
}>;
export type NutritionSummary = NutritionTotals & Readonly<{
  meals: readonly NutritionMealSummary[];
}>;
