export const VERA_INGEST_ENDPOINTS = {
  resumo: "ingest-resumo",
  conversationState: "ingest-conversation-state",
  handoff: "ingest-handoff",
} as const;

export const VERA_INGEST_AUTH_HEADER = "X-Ingest-Token";

export const VERA_RESUMO_OUTCOMES = ["agendou", "recusou", "transferido", "abandonado"] as const;

export const VERA_SPIN_STAGES = [
  "triagem",
  "situacao",
  "problema",
  "implicacao",
  "necessidade",
  "proposta",
  "encerramento",
] as const;

const VERA_SPIN_STAGE_ALIASES: Record<string, VeraSpinStage> = {
  situation: "situacao",
  problem: "problema",
  implication: "implicacao",
  need_payoff: "necessidade",
};

export type VeraResumoOutcome = (typeof VERA_RESUMO_OUTCOMES)[number];
export type VeraSpinStage = (typeof VERA_SPIN_STAGES)[number];

export type VeraResumoPayload = {
  user_id: string;
  channel: string;
  resumo: string;
  outcome?: VeraResumoOutcome | null;
  data_agendamento?: string | null;
  tags?: string[] | null;
  origem?: string | null;
};

export type VeraConversationStatePayload = {
  chat_id: string;
  channel: string;
  spin_stage: VeraSpinStage;
};

export type VeraHandoffPayload = {
  chat_id: string;
  channel: string;
  motivo: string;
  payload?: Record<string, unknown> | null;
};

export function validateVeraResumoPayload(payload: Partial<VeraResumoPayload>): string[] {
  const errors: string[] = [];
  if (!isFilled(payload.user_id)) errors.push("user_id required");
  if (!isFilled(payload.channel)) errors.push("channel required");
  if (!isFilled(payload.resumo)) errors.push("resumo required");
  if (payload.outcome && !includesValue(VERA_RESUMO_OUTCOMES, payload.outcome)) {
    errors.push(`outcome must be one of ${VERA_RESUMO_OUTCOMES.join(",")}`);
  }
  if (payload.tags != null && !Array.isArray(payload.tags)) errors.push("tags must be an array");
  return errors;
}

export function validateVeraConversationStatePayload(
  payload: Partial<VeraConversationStatePayload>,
): string[] {
  const errors: string[] = [];
  if (!isFilled(payload.chat_id)) errors.push("chat_id required");
  if (!isFilled(payload.channel)) errors.push("channel required");
  const spinStage = normalizeVeraSpinStage(payload.spin_stage);
  if (!isFilled(payload.spin_stage)) {
    errors.push("spin_stage required");
  } else if (!spinStage) {
    errors.push(`spin_stage must be one of ${VERA_SPIN_STAGES.join(",")}`);
  }
  return errors;
}

export function normalizeVeraSpinStage(value: unknown): VeraSpinStage | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (includesValue(VERA_SPIN_STAGES, normalized)) return normalized;
  return VERA_SPIN_STAGE_ALIASES[normalized] ?? null;
}

export function validateVeraHandoffPayload(payload: Partial<VeraHandoffPayload>): string[] {
  const errors: string[] = [];
  if (!isFilled(payload.chat_id)) errors.push("chat_id required");
  if (!isFilled(payload.channel)) errors.push("channel required");
  if (!isFilled(payload.motivo)) errors.push("motivo required");
  return errors;
}

function isFilled(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function includesValue<T extends readonly string[]>(values: T, value: unknown): value is T[number] {
  return typeof value === "string" && values.includes(value);
}
