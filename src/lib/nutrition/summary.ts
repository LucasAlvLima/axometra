import type {
  NutritionDay, NutritionItemSummary, NutritionMealSummary, NutritionMetric,
  NutritionSummary, NutritionTotals, NutritionValues,
} from "./types";

/** Contract failures contain no raw item contents. */
export class NutritionContractError extends Error {
  constructor() {
    super("Dados de alimentação inválidos para cálculo.");
    this.name = "NutritionContractError";
  }
}

function checked(value: number): number {
  if (!Number.isFinite(value) || value < 0) throw new NutritionContractError();
  return value;
}

function civilDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return year > 0 && month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1];
}

function validate(data: NutritionDay): void {
  if ((data.source !== "personal" && data.source !== "demo") || data.timeZone !== "America/Sao_Paulo"
    || (data.date === null ? data.meals.length > 0 : !civilDate(data.date))) throw new NutritionContractError();
  // IDs identify meal/item records globally within this day's dataset.
  const ids = new Set<string>();
  const unique = (id: string) => {
    if (!id.trim() || ids.has(id)) throw new NutritionContractError();
    ids.add(id);
  };
  for (const meal of data.meals) {
    unique(meal.id);
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(meal.localTime)) throw new NutritionContractError();
    for (const item of meal.items) {
      unique(item.id);
      checked(item.amount.value);
      if (!["g", "ml", "portion"].includes(item.amount.unit)) throw new NutritionContractError();
      for (const key of ["proteinG", "carbohydrateG", "fatG", "reportedEnergyKcal"] as const) {
        const value = item.nutrients[key];
        if (value !== null) checked(value);
      }
    }
  }
}

function metric(value: number | null, includedCount: number, missingCount: number): NutritionMetric {
  return {
    value, includedCount, missingCount,
    completeness: missingCount ? "partial" : includedCount ? "complete" : "empty",
  };
}

function combine(values: readonly NutritionMetric[]): NutritionMetric {
  let sum = 0;
  let included = 0;
  let missing = 0;
  for (const item of values) {
    sum = checked(sum + (item.value ?? 0));
    included += item.includedCount;
    missing += item.missingCount;
  }
  return metric(included ? sum : null, included, missing);
}

function totals(
  proteinG: NutritionMetric,
  carbohydrateG: NutritionMetric,
  fatG: NutritionMetric,
  reportedEnergyKcal: NutritionMetric,
  estimatedEnergyKcal: NutritionMetric,
): NutritionTotals {
  const completeMacros = proteinG.completeness === "complete" && carbohydrateG.completeness === "complete"
    && fatG.completeness === "complete";
  const protein = proteinG.value;
  const carbohydrate = carbohydrateG.value;
  const fat = fatG.value;
  const energy = estimatedEnergyKcal.value;
  const distribution = completeMacros && protein !== null && carbohydrate !== null && fat !== null
    && energy !== null && energy > 0 && estimatedEnergyKcal.completeness === "complete"
    ? {
      proteinPercent: checked(checked(4 * protein) / energy * 100),
      carbohydratePercent: checked(checked(4 * carbohydrate) / energy * 100),
      fatPercent: checked(checked(9 * fat) / energy * 100),
    } : null;
  const energyDifferenceKcal = reportedEnergyKcal.completeness === "complete"
    && estimatedEnergyKcal.completeness === "complete" && reportedEnergyKcal.value !== null && energy !== null
    ? reportedEnergyKcal.value - energy : null;
  return { proteinG, carbohydrateG, fatG, reportedEnergyKcal, estimatedEnergyKcal, distribution, energyDifferenceKcal };
}

function summarizeItem(values: NutritionValues): NutritionTotals {
  const toMetric = (value: number | null) => metric(value, value === null ? 0 : 1, value === null ? 1 : 0);
  const { proteinG, carbohydrateG, fatG, reportedEnergyKcal } = values;
  // General 4/4/9 factors give an estimate, not a replacement for reported kcal.
  const estimated = proteinG === null || carbohydrateG === null || fatG === null
    ? null : checked(checked(4 * proteinG) + checked(4 * carbohydrateG) + checked(9 * fatG));
  return totals(toMetric(proteinG), toMetric(carbohydrateG), toMetric(fatG), toMetric(reportedEnergyKcal), toMetric(estimated));
}

function combineTotals(values: readonly NutritionTotals[]): NutritionTotals {
  return totals(
    combine(values.map((item) => item.proteinG)),
    combine(values.map((item) => item.carbohydrateG)),
    combine(values.map((item) => item.fatG)),
    combine(values.map((item) => item.reportedEnergyKcal)),
    combine(values.map((item) => item.estimatedEnergyKcal)),
  );
}

/**
 * Pure item -> meal -> day aggregation. No scaling (values already describe
 * consumed quantities), clock, rounding, targets or inferred mismatch cause.
 * UI must label partials as known subtotals and distinguish reported/estimated
 * kcal. Round only for display; rounded percentages need not sum to exactly 100.
 */
export function summarizeNutrition(data: NutritionDay): NutritionSummary {
  validate(data);
  const meals: NutritionMealSummary[] = data.meals.map((meal) => {
    const items: NutritionItemSummary[] = meal.items.map((item) => ({ id: item.id, ...summarizeItem(item.nutrients) }));
    return { id: meal.id, ...combineTotals(items), items };
  });
  return { ...combineTotals(meals), meals };
}
