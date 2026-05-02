export type VeraActionHealthItem = {
  action_type?: string | null;
  reason?: string | null;
  status?: string | null;
  scheduled_at?: string | null;
  scheduled_for?: string | null;
  created_at?: string | null;
  priority?: string | null;
  prioridade?: string | null;
};

export type VeraConversationHealthItem = {
  session_id?: string | null;
  updated_at?: string | null;
  mensagens?: Array<{
    tipo?: string | null;
    conteudo?: string | null;
    timestamp?: string | null;
  }>;
};

export type VeraAuditHealthItem = {
  acao?: string | null;
  criado_em?: string | null;
};

export type VeraConnectionLogHealthItem = {
  status?: string | null;
  created_at?: string | null;
};

export type VeraN8nExecutionHealthItem = {
  id?: string | number | null;
  workflowId?: string | null;
  workflowName?: string | null;
  status?: string | null;
  finished?: boolean | null;
  startedAt?: string | null;
  stoppedAt?: string | null;
};

export type VeraHandoffHealthItem = {
  status?: string | null;
  motivo?: string | null;
  channel?: string | null;
  criado_em?: string | null;
};

export type VeraReasonCount = {
  label: string;
  count: number;
};

export type VeraHealthInputs = {
  actions?: VeraActionHealthItem[];
  conversations?: VeraConversationHealthItem[];
  audits?: VeraAuditHealthItem[];
  connectionLogs?: VeraConnectionLogHealthItem[];
  n8nExecutions?: VeraN8nExecutionHealthItem[];
  handoffs?: VeraHandoffHealthItem[];
  summariesCount?: number;
  statesCount?: number;
  now?: Date;
};

export type VeraHealthSummary = {
  score: number;
  label: "ok" | "attention" | "critical";
  openActions: number;
  failedActions: number;
  staleActions: number;
  highPriorityActions: number;
  conversationCount: number;
  activeConversations24h: number;
  recentAuditCount: number;
  whatsappStatus: string;
  summariesCount: number;
  statesCount: number;
  repeatedAiResponses: number;
  scheduleMentions: number;
  prematureDataRequests: number;
  prematureScheduleMentions: number;
  fallbackResponses: number;
  unansweredConversations: number;
  poorlyHandledPriceResponses: number;
  n8nExecutionsCount: number;
  n8nFailedExecutions: number;
  n8nRunningExecutions: number;
  pendingHandoffs: number;
  topActionReasons: VeraReasonCount[];
  topHandoffReasons: VeraReasonCount[];
  issues: string[];
};

const OPEN_ACTION_STATUSES = new Set(["pending", "failed", "simulated"]);
const ONLINE_WHATSAPP_STATUSES = new Set(["open", "connected"]);

function parseTime(value?: string | null): number | null {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
}

function isWithin(value: string | null | undefined, now: Date, hours: number) {
  const time = parseTime(value);
  if (!time) return false;
  return now.getTime() - time <= hours * 60 * 60 * 1000;
}

function isOlderThan(value: string | null | undefined, now: Date, hours: number) {
  const time = parseTime(value);
  if (!time) return false;
  return now.getTime() - time > hours * 60 * 60 * 1000;
}

function normalizeAiText(value?: string | null) {
  if (!value) return "";
  return value
    .replace(/<resposta>([\s\S]*?)<\/resposta>/i, "$1")
    .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/g, " ")
    .replace(/\[CONTEXTO_SESSAO\][\s\S]*?(\[\/CONTEXTO_SESSAO\]|$)/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function hasScheduleMention(value?: string | null) {
  const text = normalizeAiText(value);
  return /\b(agenda|agendar|agendamento|avaliacao|avaliação|horario|horário)\b/.test(text);
}

function hasDataRequest(value?: string | null) {
  const text = normalizeAiText(value);
  return /\b(nome|telefone|whatsapp|zap|numero|número|contato)\b/.test(text) &&
    /\b(me passa|pode me passar|qual seu|seu nome|seu telefone|confirmar|agendamento)\b/.test(text);
}

function hasFallbackSignal(value?: string | null) {
  const text = normalizeAiText(value);
  return /(\bdesculp|nao consegui|não consegui|nao entendi|não entendi|confus[aã]o|erro|instabilidade|falha|tente novamente|vou corrigir|corrigir isso\b)/.test(text);
}

function hasPriceMention(value?: string | null) {
  const text = normalizeAiText(value);
  return /\b(preco|preço|valor|valores|custa|custo|or[cç]amento|parcela|pagamento|pix|cart[aã]o|dinheiro|carn[eê])\b/.test(text);
}

function hasExplicitPriceValue(value?: string | null) {
  const text = normalizeAiText(value);
  return /(r\$\s*\d+|\b\d{2,5}(,\d{2})?\s*reais\b|\b\d{2,5},\d{2}\b)/.test(text);
}

function hasEvaluationGuidance(value?: string | null) {
  const text = normalizeAiText(value);
  return /\b(avalia[cç][aã]o|avaliar|consulta|diagn[oó]stico|plano de tratamento|dentista|especialista)\b/.test(text);
}

function countRepeatedAiResponses(conversations: VeraConversationHealthItem[]) {
  let repeated = 0;
  for (const conversation of conversations) {
    const seen = new Set<string>();
    for (const message of conversation.mensagens ?? []) {
      if (message.tipo !== "ai") continue;
      const normalized = normalizeAiText(message.conteudo);
      if (normalized.length < 40) continue;
      if (seen.has(normalized)) repeated += 1;
      seen.add(normalized);
    }
  }
  return repeated;
}

function countFallbackResponses(conversations: VeraConversationHealthItem[]) {
  return conversations.reduce(
    (total, conversation) =>
      total + (conversation.mensagens ?? []).filter((message) => message.tipo === "ai" && hasFallbackSignal(message.conteudo)).length,
    0,
  );
}

function countPoorlyHandledPriceResponses(conversations: VeraConversationHealthItem[]) {
  return conversations.reduce(
    (total, conversation) =>
      total + (conversation.mensagens ?? []).filter((message) => {
        if (message.tipo !== "ai") return false;
        if (!hasPriceMention(message.conteudo)) return false;
        return hasExplicitPriceValue(message.conteudo) || !hasEvaluationGuidance(message.conteudo);
      }).length,
    0,
  );
}

function countUnansweredConversations(conversations: VeraConversationHealthItem[], now: Date) {
  let count = 0;
  for (const conversation of conversations) {
    const orderedMessages = (conversation.mensagens ?? [])
      .slice()
      .sort((a, b) => (parseTime(a.timestamp) ?? 0) - (parseTime(b.timestamp) ?? 0));
    const last = orderedMessages[orderedMessages.length - 1];
    if (last?.tipo === "human" && isOlderThan(last.timestamp, now, 10 / 60)) count += 1;
  }
  return count;
}

function countPrematureDataRequests(conversations: VeraConversationHealthItem[]) {
  let count = 0;
  for (const conversation of conversations) {
    let humanTurns = 0;
    let conversionIntentSeen = false;

    const orderedMessages = (conversation.mensagens ?? []).slice().sort((a, b) => {
      const left = parseTime(a.timestamp) ?? 0;
      const right = parseTime(b.timestamp) ?? 0;
      return left - right;
    });

    for (const message of orderedMessages) {
      if (message.tipo === "human") {
        humanTurns += 1;
        if (hasScheduleMention(message.conteudo) || hasPriceMention(message.conteudo)) conversionIntentSeen = true;
      }

      if (message.tipo === "ai" && hasDataRequest(message.conteudo) && humanTurns <= 2 && !conversionIntentSeen) {
        count += 1;
      }
    }
  }
  return count;
}

function countPrematureScheduleMentions(conversations: VeraConversationHealthItem[]) {
  let count = 0;
  for (const conversation of conversations) {
    let humanTurns = 0;
    let conversionIntentSeen = false;

    const orderedMessages = (conversation.mensagens ?? []).slice().sort((a, b) => {
      const left = parseTime(a.timestamp) ?? 0;
      const right = parseTime(b.timestamp) ?? 0;
      return left - right;
    });

    for (const message of orderedMessages) {
      if (message.tipo === "human") {
        humanTurns += 1;
        if (hasScheduleMention(message.conteudo) || hasPriceMention(message.conteudo)) conversionIntentSeen = true;
      }

      if (message.tipo === "ai" && hasScheduleMention(message.conteudo) && humanTurns <= 1 && !conversionIntentSeen) {
        count += 1;
      }
    }
  }
  return count;
}

function countScheduleMentions(conversations: VeraConversationHealthItem[]) {
  return conversations.reduce(
    (total, conversation) =>
      total + (conversation.mensagens ?? []).filter((message) => message.tipo === "ai" && hasScheduleMention(message.conteudo)).length,
    0,
  );
}

function normalizeReason(value?: string | null) {
  const text = (value ?? "").trim().toLowerCase();
  if (!text) return "sem motivo";
  return text
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 80);
}

function topReasons(values: Array<string | null | undefined>, limit = 5): VeraReasonCount[] {
  const counts = new Map<string, number>();
  for (const value of values) {
    const key = normalizeReason(value);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

export function summarizeVeraHealth(input: VeraHealthInputs): VeraHealthSummary {
  const now = input.now ?? new Date();
  const actions = input.actions ?? [];
  const conversations = input.conversations ?? [];
  const audits = input.audits ?? [];
  const connectionLogs = input.connectionLogs ?? [];
  const n8nExecutions = input.n8nExecutions ?? [];
  const handoffs = input.handoffs ?? [];

  const openActions = actions.filter((a) => OPEN_ACTION_STATUSES.has(a.status ?? "")).length;
  const failedActions = actions.filter((a) => a.status === "failed").length;
  const staleActions = actions.filter(
    (a) => (a.status === "pending" || a.status === "failed") && isOlderThan(a.scheduled_at ?? a.created_at, now, 24),
  ).length;
  const highPriorityActions = actions.filter(
    (a) => OPEN_ACTION_STATUSES.has(a.status ?? "") && (a.priority ?? a.prioridade) === "alta",
  ).length;

  const activeConversations24h = conversations.filter((c) => {
    const latestMessage = c.mensagens?.map((m) => parseTime(m.timestamp)).filter(Boolean).sort((a, b) => b! - a!)[0];
    const latest = latestMessage ? new Date(latestMessage).toISOString() : c.updated_at;
    return isWithin(latest, now, 24);
  }).length;

  const recentAuditCount = audits.filter((a) => isWithin(a.criado_em, now, 24)).length;
  const repeatedAiResponses = countRepeatedAiResponses(conversations);
  const scheduleMentions = countScheduleMentions(conversations);
  const prematureDataRequests = countPrematureDataRequests(conversations);
  const prematureScheduleMentions = countPrematureScheduleMentions(conversations);
  const fallbackResponses = countFallbackResponses(conversations);
  const unansweredConversations = countUnansweredConversations(conversations, now);
  const poorlyHandledPriceResponses = countPoorlyHandledPriceResponses(conversations);
  const recentN8nExecutions = n8nExecutions.filter((execution) => isWithin(execution.startedAt, now, 24));
  const n8nFailedExecutions = recentN8nExecutions.filter(
    (execution) => execution.status === "error" || execution.status === "failed" || execution.finished === false && !!execution.stoppedAt,
  ).length;
  const n8nRunningExecutions = recentN8nExecutions.filter(
    (execution) => execution.status === "running" || execution.finished === false && !execution.stoppedAt,
  ).length;
  const pendingHandoffs = handoffs.filter((handoff) => handoff.status === "pendente").length;
  const topActionReasons = topReasons(
    actions
      .filter((action) => OPEN_ACTION_STATUSES.has(action.status ?? ""))
      .map((action) => action.reason ?? action.action_type),
  );
  const topHandoffReasons = topReasons(handoffs.map((handoff) => handoff.motivo));
  const latestConnection = connectionLogs
    .slice()
    .sort((a, b) => (parseTime(b.created_at) ?? 0) - (parseTime(a.created_at) ?? 0))[0];
  const whatsappStatus = latestConnection?.status ?? "unknown";

  const issues: string[] = [];
  if (!ONLINE_WHATSAPP_STATUSES.has(whatsappStatus)) issues.push("WhatsApp nao esta confirmado como online");
  if (failedActions > 0) issues.push("Ha actions com falha");
  if (staleActions > 0) issues.push("Ha actions abertas ha mais de 24h");
  if (conversations.length === 0) issues.push("Logs de conversa Vera nao retornaram contatos");
  if ((input.summariesCount ?? 0) === 0) issues.push("Nenhum resumo recente da Vera");
  if (repeatedAiResponses > 0) issues.push("Ha possivel repeticao de resposta da IA");
  if (prematureDataRequests > 0) issues.push("Vera pode estar pedindo dados cedo demais");
  if (prematureScheduleMentions > 0) issues.push("Vera pode estar conduzindo para agenda cedo demais");
  if (fallbackResponses > 0) issues.push("Ha respostas de fallback ou erro da Vera");
  if (unansweredConversations > 0) issues.push("Ha conversas possivelmente sem resposta da Vera");
  if (poorlyHandledPriceResponses > 0) issues.push("Vera pode estar conduzindo preco de forma ruim");
  if (n8nFailedExecutions > 0) issues.push("Ha execucoes n8n recentes com falha");
  if (pendingHandoffs > 0) issues.push("Ha handoffs pendentes para atendimento humano");

  const penalty =
    (ONLINE_WHATSAPP_STATUSES.has(whatsappStatus) ? 0 : 25) +
    Math.min(failedActions * 15, 30) +
    Math.min(staleActions * 10, 25) +
    Math.min(repeatedAiResponses * 8, 24) +
    Math.min(prematureDataRequests * 10, 30) +
    Math.min(prematureScheduleMentions * 10, 30) +
    Math.min(fallbackResponses * 8, 24) +
    Math.min(unansweredConversations * 12, 36) +
    Math.min(poorlyHandledPriceResponses * 12, 36) +
    Math.min(n8nFailedExecutions * 12, 36) +
    Math.min(pendingHandoffs * 8, 24) +
    (conversations.length === 0 ? 20 : 0) +
    ((input.summariesCount ?? 0) === 0 ? 10 : 0);

  const score = Math.max(0, 100 - penalty);
  const label = score >= 80 ? "ok" : score >= 55 ? "attention" : "critical";

  return {
    score,
    label,
    openActions,
    failedActions,
    staleActions,
    highPriorityActions,
    conversationCount: conversations.length,
    activeConversations24h,
    recentAuditCount,
    whatsappStatus,
    summariesCount: input.summariesCount ?? 0,
    statesCount: input.statesCount ?? 0,
    repeatedAiResponses,
    scheduleMentions,
    prematureDataRequests,
    prematureScheduleMentions,
    fallbackResponses,
    unansweredConversations,
    poorlyHandledPriceResponses,
    n8nExecutionsCount: recentN8nExecutions.length,
    n8nFailedExecutions,
    n8nRunningExecutions,
    pendingHandoffs,
    topActionReasons,
    topHandoffReasons,
    issues,
  };
}
