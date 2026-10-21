import type { SleepData } from "./types";

// Fixed, fictional Sono fixture; intentionally not synchronized with Dashboard.
// Never merge these records with personal data or present them as measurements.
export const demoSleep = {
  source: "demo",
  timeZone: "America/Sao_Paulo",
  period: { startDate: "2026-10-05", endDate: "2026-10-11" },
  records: [
    {
      id: "sleep-05", startedAt: "2026-10-04T23:00:00-03:00", wokeAt: "2026-10-05T06:30:00-03:00",
      quality: 4, observation: "Exemplo fictício de registro de sono.",
    },
    {
      id: "sleep-06", startedAt: "2026-10-05T23:00:00-03:00", wokeAt: "2026-10-06T06:00:00-03:00",
      quality: null,
    },
    {
      id: "sleep-07", startedAt: "2026-10-06T23:00:00-03:00", wokeAt: "2026-10-07T05:45:00-03:00",
      quality: 3,
    },
    {
      id: "sleep-08", startedAt: "2026-10-07T23:00:00-03:00", wokeAt: "2026-10-08T07:00:00-03:00",
      quality: 5,
    },
    {
      id: "sleep-09", startedAt: "2026-10-08T23:00:00-03:00", wokeAt: "2026-10-09T08:00:00-03:00",
      quality: 4,
    },
    {
      id: "sleep-10", startedAt: "2026-10-09T23:00:00-03:00", wokeAt: "2026-10-10T05:30:00-03:00",
      quality: 2,
    },
    {
      id: "sleep-11", startedAt: "2026-10-10T23:00:00-03:00", wokeAt: "2026-10-11T07:30:00-03:00",
      quality: null,
    },
  ],
} as const satisfies SleepData;

export const emptySleep = {
  source: "personal", timeZone: "America/Sao_Paulo", period: null, records: [],
} as const satisfies SleepData;
