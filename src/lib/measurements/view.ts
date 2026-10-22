import { MEASUREMENT_REGIONS, type MeasurementRecordAnalysis, type MeasurementRecordIssue, type MeasurementRegion, type MeasurementValueAnalysis, type MeasurementValueIssue, type SeriesCoverage } from "./types";

export const regionLabels: Readonly<Record<MeasurementRegion, string>> = {
  waist: "Cintura", abdomen: "Abdômen", chest: "Peito", hips: "Quadril",
  rightArm: "Braço direito", leftArm: "Braço esquerdo", rightThigh: "Coxa direita", leftThigh: "Coxa esquerda",
};

export function selectMeasurementRegion(value: string | readonly string[] | undefined): MeasurementRegion {
  return typeof value === "string" && MEASUREMENT_REGIONS.some((region) => region === value) ? value as MeasurementRegion : "waist";
}

export function measurementRegionHref(region: MeasurementRegion, demo: boolean): string {
  return `/medidas?${demo ? "view=demo&" : ""}region=${region}`;
}

export function formatDate(date: string): string {
  return date.split("-").reverse().join("/");
}

export function formatValue(value: number, signed = false): string {
  const magnitude = Math.abs(value);
  const sign = value < 0 ? "−" : signed && value > 0 ? "+" : "";
  const displayed = magnitude > 0 && magnitude < 0.05 ? "<0,1" : magnitude.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  return `${sign}${displayed}`;
}

export function describeCoverage(coverage: SeriesCoverage): string {
  const completeness = { empty: "Sem valores no período", partial: "Cobertura parcial", complete: "Cobertura completa dos valores registrados" } as const;
  return `${completeness[coverage.dataCompleteness]}. ${coverage.validValueDates} de ${coverage.registeredDates} datas registradas com valor válido; ${coverage.missingValueDates} sem valor, ${coverage.invalidValueDates} inválidas e ${coverage.conflictDates} com conflito. ${coverage.daysWithoutRecord ?? "Não informado"} dias sem registro; ${coverage.unassignedRecordCount} registros sem data classificável e ${coverage.outOfPeriodRecordCount} fora do período.`;
}

const issueLabels: Readonly<Record<MeasurementRecordIssue | MeasurementValueIssue, string>> = {
  "missing-date": "Data não informada", "invalid-date": "Data civil inválida",
  "same-date-conflict": "Mais de um registro nesta data; grupo excluído dos indicadores",
  "invalid-observation": "Observação em formato inválido", "missing-value": "Valor não informado",
  "invalid-number": "Valor em formato numérico inválido", "nonpositive-value": "Valor deve ser maior que zero",
  "technical-limit-exceeded": "Valor acima do limite técnico de registro",
};

export function describeIssue(issue: MeasurementRecordIssue | MeasurementValueIssue): string {
  return issueLabels[issue];
}

export function describeMeasurement(value: MeasurementValueAnalysis, unit: "kg" | "cm"): string {
  if (value.value === null) return value.issues.map(describeIssue).join("; ") || "Não informado";
  return `${formatValue(value.value)} ${unit} · ${value.included ? "incluído nos indicadores" : "valor candidato excluído dos indicadores"}`;
}

export function describeRecordScope(record: MeasurementRecordAnalysis): string {
  return record.date === null ? "Sem data classificável; não atribuído ao período" : record.inPeriod ? "Data dentro do período" : "Fora do período; excluído dos indicadores";
}

/** Plot geometry only: explicit UTC midnight, including civil years 0001–0099. */
export function measurementDayOrdinal(date: string): number {
  return Date.parse(`${date}T00:00:00.000Z`) / 86_400_000;
}
