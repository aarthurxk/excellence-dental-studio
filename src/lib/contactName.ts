// Utilitários para resolver o nome de contato a partir de múltiplas fontes
// e como fallback extrair do conteúdo das mensagens.

const STOP_WORDS = new Set([
  "voce", "você", "senhor", "senhora", "sr", "sra", "doutor", "doutora",
  "obrigado", "obrigada", "tudo", "bom", "boa", "ola", "olá", "oi",
  "perfeito", "claro", "entendi", "entendo", "certo", "sim", "nao", "não",
  "agradeço", "agradeco", "ate", "até", "amanha", "amanhã", "hoje", "logo",
  "deus", "favor", "tchau", "fica", "fique", "vamos", "querido", "querida",
  "amor", "amigo", "amiga", "doutor(a)", "ok", "okay", "show", "legal",
  "qualquer", "coisa", "ja", "já", "agora", "depois", "vera", "odonto",
]);

function looksLikeName(word: string): boolean {
  if (!word) return false;
  const clean = word.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  if (clean.length < 3 || clean.length > 20) return false;
  // Primeira letra maiúscula e resto minúsculo (formato "Glauber", "Maria")
  if (!/^[A-ZÀ-Ý][a-zà-ÿ]+$/.test(clean)) return false;
  if (STOP_WORDS.has(clean.toLowerCase())) return false;
  return true;
}

function cleanPhoneFallback(phone?: string | null): string {
  const raw = (phone ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  return digits || raw;
}

function looksLikePhoneLabel(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^(wa|whatsapp|phone|tel|telefone)\s*:/i.test(v)) {
    return v.replace(/\D/g, "").length >= 8;
  }
  return /^\+?\d[\d\s()-]*$/.test(v);
}

function looksLikeInvalidContactName(value: string): boolean {
  return looksLikePhoneLabel(value) || STOP_WORDS.has(value.trim().toLowerCase());
}

/**
 * Tenta extrair o primeiro nome do destinatário a partir de uma mensagem
 * enviada pela IA/atendente. Procura padrões como:
 *  - "Perfeito, Glauber!"
 *  - "Entendo, Diogo."
 *  - "De nada, Glauber!"
 *  - "Oi Maria,"
 *  - "Olá João,"
 */
export function extractNameFromMessage(text?: string | null): string | null {
  if (!text) return null;
  const t = String(text).trim();
  if (!t) return null;

  const patterns: RegExp[] = [
    // "meu nome e Glauber" / "meu nome é Glauber"
    /\bmeu\s+nome\s+(?:e|é|eh)\s+([A-ZÀ-Ý][a-zà-ÿ]{2,19})\b/i,
    // "me chamo Arthur" / "eu me chamo Arthur"
    /\b(?:eu\s+)?me\s+chamo\s+([A-ZÀ-Ý][a-zà-ÿ]{2,19})\b/i,
    // "sou Glauber" / "aqui e Arthur"
    /\b(?:sou|aqui\s+(?:e|é|eh))\s+([A-ZÀ-Ý][a-zà-ÿ]{2,19})\b/i,
    // ", Nome!" ou ", Nome." ou ", Nome,"
    /,\s*([A-ZÀ-Ý][a-zà-ÿ]{2,19})\s*[!.,?]/,
    // "Oi Nome," / "Olá Nome," / "Ola Nome,"
    /\b(?:oi|ol[áa]|ola)\s+([A-ZÀ-Ý][a-zà-ÿ]{2,19})\b/i,
    // "Nome," no início
    /^([A-ZÀ-Ý][a-zà-ÿ]{2,19}),/,
  ];

  for (const re of patterns) {
    const m = t.match(re);
    if (m && looksLikeName(m[1])) {
      // Capitaliza primeira letra (Glauber)
      return m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
    }
  }
  return null;
}

/**
 * Resolve o melhor nome possível para um contato dado as fontes.
 * Ordem de prioridade:
 *  1. veraName (Vera/n8n logs)
 *  2. leadPushName / leadName (banco de leads)
 *  3. evoContactName (pushName ou name vindo da Evolution API)
 *  4. nome extraído da última mensagem
 *  5. telefone como fallback final
 */
export function resolveContactName(opts: {
  veraName?: string | null;
  leadPushName?: string | null;
  leadName?: string | null;
  evoContactName?: string | null;
  lastMessage?: string | null;
  messageHints?: Array<string | null | undefined>;
  phone?: string | null;
}): string {
  const candidates = [
    opts.veraName,
    opts.leadPushName,
    opts.leadName,
    opts.evoContactName,
  ];
  for (const c of candidates) {
    const v = (c ?? "").trim();
    if (v && !looksLikeInvalidContactName(v)) return v;
  }
  const messages = [opts.lastMessage, ...(opts.messageHints ?? [])];
  for (const message of messages) {
    const fromMsg = extractNameFromMessage(message);
    if (fromMsg) return fromMsg;
  }
  return cleanPhoneFallback(opts.phone) || "Sem nome";
}
