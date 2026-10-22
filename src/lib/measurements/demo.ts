import type { MeasurementsData } from "./types";

// Fixed fictional records, never merged with personal data. Weight values match
// the approved Dashboard illustration, without importing/coupling its dataset.
export const demoMeasurements = {
  source: "demo",
  timeZone: "America/Sao_Paulo",
  period: { startDate: "2026-10-05", endDate: "2026-10-11" },
  weightRecords: [
    { id: "weight-05", date: "2026-10-05", weightKg: 80.4 },
    { id: "weight-06", date: "2026-10-06", weightKg: 80.2 },
    { id: "weight-07", date: "2026-10-07", weightKg: 80.3 },
    { id: "weight-08", date: "2026-10-08", weightKg: 80.1 },
    { id: "weight-09", date: "2026-10-09", weightKg: 80.2 },
    { id: "weight-10", date: "2026-10-10", weightKg: 79.9 },
    { id: "weight-11", date: "2026-10-11", weightKg: 80.0 },
  ],
  measurementRecords: [
    {
      id: "body-05", date: "2026-10-05",
      values: {
        waist: 88.0, abdomen: 92.0, chest: 101.0, hips: 100.0,
        rightArm: 34.0, leftArm: 33.8, rightThigh: 58.0, leftThigh: 57.8,
      },
      observation: "Registro demonstrativo fictício; sem avaliação clínica.",
    },
    {
      id: "body-08", date: "2026-10-08",
      values: {
        waist: 87.5, abdomen: 91.5, chest: 101.2, hips: 99.8,
        rightArm: 34.1, leftArm: null, rightThigh: 58.1, leftThigh: null,
      },
    },
    {
      id: "body-11", date: "2026-10-11",
      values: {
        waist: 87.0, abdomen: 91.0, chest: 101.3, hips: 99.5,
        rightArm: 34.2, leftArm: 34.0, rightThigh: 58.2, leftThigh: 58.0,
      },
    },
  ],
} as const satisfies MeasurementsData;

export const emptyMeasurements = {
  source: "personal", timeZone: "America/Sao_Paulo", period: null,
  weightRecords: [], measurementRecords: [],
} as const satisfies MeasurementsData;
