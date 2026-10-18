import type { NutritionDay } from "./types";

// Fixed fictional consumed portions, not food composition claims or diet goals.
// Explicitly reported fictional kcal happen to match 4/4/9 in this fixture.
export const demoNutrition = {
  source: "demo",
  date: "2026-10-11",
  timeZone: "America/Sao_Paulo",
  meals: [
    {
      id: "meal-breakfast", label: "Café da manhã", localTime: "08:00",
      items: [{
        id: "item-breakfast", label: "Porção demonstrativa do café da manhã",
        amount: { value: 1, unit: "portion" },
        nutrients: { proteinG: 25, carbohydrateG: 50, fatG: 10, reportedEnergyKcal: 390 },
      }],
    },
    {
      id: "meal-lunch", label: "Almoço", localTime: "12:30",
      items: [{
        id: "item-lunch", label: "Porção demonstrativa do almoço",
        amount: { value: 1, unit: "portion" },
        nutrients: { proteinG: 40, carbohydrateG: 80, fatG: 20, reportedEnergyKcal: 660 },
      }],
    },
    {
      id: "meal-snack", label: "Lanche", localTime: "16:00",
      items: [{
        id: "item-snack", label: "Porção demonstrativa do lanche",
        amount: { value: 1, unit: "portion" },
        nutrients: { proteinG: 20, carbohydrateG: 35, fatG: 10, reportedEnergyKcal: 310 },
      }],
    },
    {
      id: "meal-dinner", label: "Jantar", localTime: "19:30",
      items: [{
        id: "item-dinner", label: "Porção demonstrativa do jantar",
        amount: { value: 1, unit: "portion" },
        nutrients: { proteinG: 35, carbohydrateG: 80, fatG: 20, reportedEnergyKcal: 640 },
      }],
    },
  ],
} as const satisfies NutritionDay;

export const emptyNutrition = {
  source: "personal", date: null, timeZone: "America/Sao_Paulo", meals: [],
} as const satisfies NutritionDay;
