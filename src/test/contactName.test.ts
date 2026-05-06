import { describe, expect, it } from "vitest";
import { extractNameFromMessage, resolveContactName } from "@/lib/contactName";

describe("contactName", () => {
  it("ignora telefone como nome e usa telefone so como fallback final", () => {
    expect(resolveContactName({ leadPushName: "558192453424", phone: "558192453424" })).toBe("558192453424");
  });

  it("prioriza nome vindo dos logs da Vera", () => {
    expect(resolveContactName({ veraName: "Glauber", leadName: "558192453424", phone: "558192453424" })).toBe("Glauber");
  });

  it("extrai nome de uma resposta personalizada da Vera", () => {
    expect(extractNameFromMessage("Perfeito, Glauber! Vou agendar para as 09h30.")).toBe("Glauber");
  });

  it("usa a ultima mensagem quando lead e evolution nao tem nome util", () => {
    expect(
      resolveContactName({
        leadName: null,
        leadPushName: null,
        evoContactName: "558192453424",
        lastMessage: "Perfeito, Glauber! Pode me passar seu telefone?",
        phone: "558192453424",
      }),
    ).toBe("Glauber");
  });
});
