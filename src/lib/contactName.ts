// Utilitários para resolver o nome de contato a partir de múltiplas fontes
// e como fallback extrair do conteúdo das mensagens.

const STOP_WORDS = new Set([
  "voce", "você", "senhor", "senhora", "sr", "sra", "doutor", "doutora",
  "obrigado", "obrigada", "tudo", "bom", "boa", "ola", "olá", "oi",
  "perfeito", "claro", "entendi", "entendo", "certo", "sim", "nao", "não",
  "agradeço", "agradeco", "ate", "até", "amanha", "amanhã", "hoje", "logo",
  "deus", "favor", "tchau", "fica", "fique", "vamos", "querido", "querida",
  "amor", "amigo", "amiga", "doutor(a)", "ok", "okay", "show", "legal",
  "qualquer", "coisa", "ja", "já", "agora", "depois",
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
    if (v && !/^\+?\d[\d\s()-]*$/.test(v)) return v;
  }
  const fromMsg = extractNameFromMessage(opts.lastMessage);
  if (fromMsg) return fromMsg;
  return (opts.phone ?? "").trim() || "Sem nome";
}
