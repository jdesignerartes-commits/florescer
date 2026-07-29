export type MeasurementContext =
  | "repouso"
  | "pos_atividade"
  | "pos_alimentacao"
  | "antes_dormir"
  | "ao_acordar"
  | "mal_estar"
  | "outro";

export type Symptom =
  | "dor_cabeca"
  | "tontura"
  | "fraqueza"
  | "visao_alterada"
  | "palpitacao"
  | "falta_ar"
  | "dor_peito"
  | "nausea"
  | "outro";

export interface HealthMeasurement {
  id: string;
  measurementDate: string; // yyyy-mm-dd
  measurementTime: string; // HH:MM
  systolic: number;
  diastolic: number;
  heartRate: number | null;
  context: MeasurementContext | null;
  armUsed: string | null;
  bodyPosition: string | null;
  symptoms: Symptom[];
  feeling: number | null; // mesma escala 1-5 do check-in de humor
  notes: string;
  createdAt: string;
}

export const CONTEXT_LABELS: Record<MeasurementContext, string> = {
  repouso: "Em repouso",
  pos_atividade: "Após atividade física",
  pos_alimentacao: "Após alimentação",
  antes_dormir: "Antes de dormir",
  ao_acordar: "Ao acordar",
  mal_estar: "Durante mal-estar",
  outro: "Outro",
};

export const SYMPTOM_LABELS: Record<Symptom, string> = {
  dor_cabeca: "Dor de cabeça",
  tontura: "Tontura",
  fraqueza: "Fraqueza",
  visao_alterada: "Visão alterada",
  palpitacao: "Palpitação",
  falta_ar: "Falta de ar",
  dor_peito: "Dor no peito",
  nausea: "Náusea",
  outro: "Outro",
};

// Sintomas cuja combinação com qualquer leitura já justifica orientar
// atendimento de urgência — não é diagnóstico, é a mesma lista de exemplos
// que está no brief do produto.
const URGENT_SYMPTOMS: Symptom[] = ["dor_peito", "falta_ar"];

export type HealthAlertLevel = "urgent" | "caution" | null;

export const ALERT_MESSAGES: Record<Exclude<HealthAlertLevel, null>, string> = {
  urgent:
    "Caso você esteja apresentando sintomas intensos ou súbitos, procure atendimento de urgência imediatamente.",
  caution:
    "Este registro pode precisar de atenção. Repita a medição corretamente e considere procurar orientação de um profissional de saúde.",
};

export function getHealthAlert(m: {
  systolic: number;
  diastolic: number;
  symptoms: Symptom[];
}): HealthAlertLevel {
  const hasUrgentSymptom = m.symptoms.some((s) => URGENT_SYMPTOMS.includes(s));
  if (hasUrgentSymptom || m.systolic >= 180 || m.diastolic >= 120) {
    return "urgent";
  }
  const hasOtherSymptom = m.symptoms.length > 0;
  if (
    hasOtherSymptom ||
    m.systolic >= 140 ||
    m.diastolic >= 90 ||
    m.systolic < 90 ||
    m.diastolic < 60
  ) {
    return "caution";
  }
  return null;
}
