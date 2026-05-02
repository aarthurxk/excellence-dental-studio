export function normalizeWhatsappPhone(value: string | null | undefined) {
  return String(value ?? "").replace(/\D/g, "");
}

export function whatsappRemoteJidFromVeraChatId(chatId: string | null | undefined) {
  const raw = String(chatId ?? "").trim();
  const phone = normalizeWhatsappPhone(raw.startsWith("wa:") ? raw.slice(3) : raw);
  return phone ? `${phone}@s.whatsapp.net` : "";
}

export function whatsappAdminChatUrl(chatId: string | null | undefined) {
  const raw = String(chatId ?? "").trim();
  if (!raw.startsWith("wa:")) return "";
  const phone = normalizeWhatsappPhone(raw.slice(3));
  return phone ? `/admin/conversas?tab=whatsapp&chat=${phone}` : "";
}
