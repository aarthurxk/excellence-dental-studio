import { describe, expect, it } from "vitest";
import {
  normalizeWhatsappPhone,
  whatsappAdminChatUrl,
  whatsappRemoteJidFromVeraChatId,
} from "@/lib/veraActions";

describe("veraActions helpers", () => {
  it("normaliza telefone de WhatsApp mantendo apenas digitos", () => {
    expect(normalizeWhatsappPhone("+55 (81) 99149-5200")).toBe("5581991495200");
  });

  it("converte chat_id wa em remoteJid da Evolution", () => {
    expect(whatsappRemoteJidFromVeraChatId("wa:5581991495200")).toBe("5581991495200@s.whatsapp.net");
  });

  it("gera link para abrir a conversa WhatsApp no admin", () => {
    expect(whatsappAdminChatUrl("wa:5581991495200")).toBe("/admin/conversas?tab=whatsapp&chat=5581991495200");
  });

  it("nao gera link de WhatsApp para canal site", () => {
    expect(whatsappAdminChatUrl("site:999001420")).toBe("");
  });
});
