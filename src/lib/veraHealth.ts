export type VeraActionHealthItem = {
  status?: string | null;
  scheduled_at?: string | null;
  created_at?: string | null;
  priority?: string | null;
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

export type VeraHealthInputs = {
  actions?: VeraActionHealthItem[];
  conversations?: VeraConversationHealthItem[];
  audits?: VeraAuditHealthItem[];
  connectionLogs?: VeraConnectionLogHealthItem[];
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

function countPrematureDataRequests(conversations: VeraConversationHealthItem[]) {
  let count = 0;
  for (const conversation of conversations) {
    let humanTurns = 0;
    let scheduleIntentSeen = false;

    const orderedMessages = (conversation.mensagens ?? []).slice().sort((a, b) => {
      const left = parseTime(a.timestamp) ?? 0;
      const right = parseTime(b.timestamp) ?? 0;
      return left - right;
    });

    for (const message of orderedMessages) {
      if (message.tipo === "human") {
        humanTurns += 1;
        if (hasScheduleMention(message.conteudo)) scheduleIntentSeen = true;
      }

      if (message.tipo === "ai" && hasDataRequest(message.conteudo) && humanTurns <= 2 && !scheduleIntentSeen) {
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
    let scheduleIntentSeen = false;

    const orderedMessages = (conversation.mensagens ?? []).slice().sort((a, b) => {
      const left = parseTime(a.timestamp) ?? 0;
      const right = parseTime(b.timestamp) ?? 0;
      return left - right;
    });

    for (const message of orderedMessages) {
      if (message.tipo === "human") {
        humanTurns += 1;
        if (hasScheduleMention(message.conteudo)) scheduleIntentSeen = true;
      }

      if (message.tipo === "ai" && hasScheduleMention(message.conteudo) && humanTurns <= 1 && !scheduleIntentSeen) {
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

export function summarizeVeraHealth(input: VeraHealthInputs): VeraHealthSummary {
  const now = input.now ?? new Date();
  const actions = input.actions ?? [];
  const conversations = input.conversations ?? [];
  const audits = input.audits ?? [];
  const connectionLogs = input.connectionLogs ?? [];

  const openActions = actions.filter((a) => OPEN_ACTION_STATUSES.has(a.status ?? "")).length;
  const failedActions = actions.filter((a) => a.status === "failed").length;
  const staleActions = actions.filter(
    (a) => (a.status === "pending" || a.status === "failed") && isOlderThan(a.scheduled_at ?? a.created_at, now, 24),
  ).length;
  const highPriorityActions = actions.filter(
    (a) => OPEN_ACTION_STATUSES.has(a.status ?? "") && a.priority === "alta",
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

  const penalty =
    (ONLINE_WHATSAPP_STATUSES.has(whatsappStatus) ? 0 : 25) +
    Math.min(failedActions * 15, 30) +
    Math.min(staleActions * 10, 25) +
    Math.min(repeatedAiResponses * 8, 24) +
    Math.min(prematureDataRequests * 10, 30) +
    Math.min(prematureScheduleMentions * 10, 30) +
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
    issues,
  };
}
