import { describe, expect, it } from "vitest";
import { summarizeVeraHealth } from "@/lib/veraHealth";

const now = new Date("2026-05-02T12:00:00.000Z");

describe("summarizeVeraHealth", () => {
  it("marks a healthy Vera when core signals are present", () => {
    const summary = summarizeVeraHealth({
      now,
      actions: [{ status: "pending", priority: "media", scheduled_at: "2026-05-02T10:00:00.000Z" }],
      conversations: [{ session_id: "site:1", updated_at: "2026-05-02T11:00:00.000Z", mensagens: [] }],
      audits: [{ acao: "vera_lead_actions:list", criado_em: "2026-05-02T11:30:00.000Z" }],
      connectionLogs: [{ status: "open", created_at: "2026-05-02T11:50:00.000Z" }],
      summariesCount: 3,
      statesCount: 5,
    });

    expect(summary.label).toBe("ok");
    expect(summary.score).toBe(100);
    expect(summary.openActions).toBe(1);
    expect(summary.activeConversations24h).toBe(1);
    expect(summary.issues).toEqual([]);
  });

  it("flags failed and stale actions", () => {
    const summary = summarizeVeraHealth({
      now,
      actions: [
        { status: "failed", priority: "alta", scheduled_at: "2026-05-01T10:00:00.000Z" },
        { status: "pending", priority: "baixa", scheduled_at: "2026-05-02T11:00:00.000Z" },
      ],
      conversations: [{ session_id: "wa:1", updated_at: "2026-05-02T11:00:00.000Z" }],
      connectionLogs: [{ status: "connected", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 1,
    });

    expect(summary.failedActions).toBe(1);
    expect(summary.staleActions).toBe(1);
    expect(summary.highPriorityActions).toBe(1);
    expect(summary.label).toBe("attention");
    expect(summary.issues).toContain("Ha actions com falha");
    expect(summary.issues).toContain("Ha actions abertas ha mais de 24h");
  });

  it("marks critical when WhatsApp and logs are unhealthy", () => {
    const summary = summarizeVeraHealth({
      now,
      actions: [],
      conversations: [],
      connectionLogs: [{ status: "close", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 0,
    });

    expect(summary.label).toBe("critical");
    expect(summary.score).toBeLessThan(55);
    expect(summary.issues).toContain("WhatsApp nao esta confirmado como online");
    expect(summary.issues).toContain("Logs de conversa Vera nao retornaram contatos");
    expect(summary.issues).toContain("Nenhum resumo recente da Vera");
  });

  it("detects repeated AI responses and schedule mentions from conversation logs", () => {
    const repeatedText = "Olhei aqui na agenda e tenho horarios disponiveis para avaliacao. Qual desses fica melhor para voce?";
    const summary = summarizeVeraHealth({
      now,
      actions: [],
      conversations: [
        {
          session_id: "wa:1",
          updated_at: "2026-05-02T11:00:00.000Z",
          mensagens: [
            { tipo: "human", conteudo: "Quero agendar uma avaliacao", timestamp: "2026-05-02T10:00:00.000Z" },
            { tipo: "ai", conteudo: `<resposta>${repeatedText}</resposta>`, timestamp: "2026-05-02T10:01:00.000Z" },
            { tipo: "ai", conteudo: repeatedText, timestamp: "2026-05-02T10:02:00.000Z" },
          ],
        },
      ],
      connectionLogs: [{ status: "open", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 1,
    });

    expect(summary.repeatedAiResponses).toBe(1);
    expect(summary.scheduleMentions).toBe(2);
    expect(summary.issues).toContain("Ha possivel repeticao de resposta da IA");
    expect(summary.score).toBe(92);
  });

  it("detects when Vera asks for contact data too early", () => {
    const summary = summarizeVeraHealth({
      now,
      actions: [],
      conversations: [
        {
          session_id: "site:early",
          updated_at: "2026-05-02T11:00:00.000Z",
          mensagens: [
            { tipo: "human", conteudo: "Oi", timestamp: "2026-05-02T10:00:00.000Z" },
            { tipo: "ai", conteudo: "Oi! Pode me passar seu nome e telefone para confirmar?", timestamp: "2026-05-02T10:00:05.000Z" },
          ],
        },
        {
          session_id: "site:ok",
          updated_at: "2026-05-02T11:00:00.000Z",
          mensagens: [
            { tipo: "human", conteudo: "Quero agendar uma avaliacao", timestamp: "2026-05-02T10:10:00.000Z" },
            { tipo: "ai", conteudo: "Perfeito, posso confirmar seu telefone para o agendamento?", timestamp: "2026-05-02T10:10:05.000Z" },
          ],
        },
      ],
      connectionLogs: [{ status: "open", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 1,
    });

    expect(summary.prematureDataRequests).toBe(1);
    expect(summary.issues).toContain("Vera pode estar pedindo dados cedo demais");
    expect(summary.score).toBe(90);
  });

  it("detects when Vera pushes scheduling too early", () => {
    const summary = summarizeVeraHealth({
      now,
      actions: [],
      conversations: [
        {
          session_id: "site:schedule-too-soon",
          updated_at: "2026-05-02T11:00:00.000Z",
          mensagens: [
            { tipo: "human", conteudo: "Oi, boa tarde", timestamp: "2026-05-02T10:00:00.000Z" },
            { tipo: "ai", conteudo: "Boa tarde! Tenho horarios para avaliacao hoje. Quer agendar?", timestamp: "2026-05-02T10:00:05.000Z" },
          ],
        },
        {
          session_id: "site:schedule-ok",
          updated_at: "2026-05-02T11:00:00.000Z",
          mensagens: [
            { tipo: "human", conteudo: "Quero agendar uma avaliacao", timestamp: "2026-05-02T10:10:00.000Z" },
            { tipo: "ai", conteudo: "Perfeito, vou olhar a agenda para avaliacao.", timestamp: "2026-05-02T10:10:05.000Z" },
          ],
        },
      ],
      connectionLogs: [{ status: "open", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 1,
    });

    expect(summary.prematureScheduleMentions).toBe(1);
    expect(summary.scheduleMentions).toBe(2);
    expect(summary.issues).toContain("Vera pode estar conduzindo para agenda cedo demais");
    expect(summary.score).toBe(90);
  });

  it("detects fallback or error-like AI responses", () => {
    const summary = summarizeVeraHealth({
      now,
      actions: [],
      conversations: [
        {
          session_id: "wa:fallback",
          updated_at: "2026-05-02T11:00:00.000Z",
          mensagens: [
            { tipo: "human", conteudo: "Esse horario serve?", timestamp: "2026-05-02T10:00:00.000Z" },
            { tipo: "ai", conteudo: "Desculpe pela confusao, vou corrigir isso para voce.", timestamp: "2026-05-02T10:00:05.000Z" },
          ],
        },
      ],
      connectionLogs: [{ status: "open", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 1,
    });

    expect(summary.fallbackResponses).toBe(1);
    expect(summary.issues).toContain("Ha respostas de fallback ou erro da Vera");
    expect(summary.score).toBe(92);
  });

  it("detects conversations waiting for an AI response", () => {
    const summary = summarizeVeraHealth({
      now,
      actions: [],
      conversations: [
        {
          session_id: "wa:waiting",
          updated_at: "2026-05-02T11:40:00.000Z",
          mensagens: [
            { tipo: "ai", conteudo: "Oi, como posso ajudar?", timestamp: "2026-05-02T11:00:00.000Z" },
            { tipo: "human", conteudo: "Quero saber sobre implante", timestamp: "2026-05-02T11:40:00.000Z" },
          ],
        },
        {
          session_id: "wa:answered",
          updated_at: "2026-05-02T11:55:00.000Z",
          mensagens: [
            { tipo: "human", conteudo: "Quero agendar", timestamp: "2026-05-02T11:50:00.000Z" },
            { tipo: "ai", conteudo: "Claro, vou te ajudar.", timestamp: "2026-05-02T11:55:00.000Z" },
          ],
        },
      ],
      connectionLogs: [{ status: "open", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 1,
    });

    expect(summary.unansweredConversations).toBe(1);
    expect(summary.issues).toContain("Ha conversas possivelmente sem resposta da Vera");
    expect(summary.score).toBe(88);
  });

  it("detects recent n8n execution failures", () => {
    const summary = summarizeVeraHealth({
      now,
      conversations: [{ session_id: "wa:ok", updated_at: "2026-05-02T11:45:00.000Z" }],
      connectionLogs: [{ status: "open", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 1,
      n8nExecutions: [
        { id: 1, workflowId: "core", status: "success", finished: true, startedAt: "2026-05-02T11:00:00.000Z" },
        { id: 2, workflowId: "adapter", status: "error", finished: true, startedAt: "2026-05-02T11:10:00.000Z" },
        { id: 3, workflowId: "logs", status: "running", finished: false, startedAt: "2026-05-02T11:55:00.000Z" },
      ],
    });

    expect(summary.n8nExecutionsCount).toBe(3);
    expect(summary.n8nFailedExecutions).toBe(1);
    expect(summary.n8nRunningExecutions).toBe(1);
    expect(summary.issues).toContain("Ha execucoes n8n recentes com falha");
    expect(summary.score).toBe(88);
  });

  it("summarizes action and handoff reasons", () => {
    const summary = summarizeVeraHealth({
      now,
      actions: [
        { status: "pending", action_type: "follow_up", reason: "objecao_preco_pagamento", prioridade: "alta" },
        { status: "failed", action_type: "follow_up", reason: "objecao_preco_pagamento", prioridade: "media" },
        { status: "ignored", action_type: "handoff", reason: "fora_escopo", prioridade: "alta" },
      ],
      handoffs: [
        { status: "pendente", motivo: "duvida_clinica", criado_em: "2026-05-02T11:00:00.000Z" },
        { status: "pendente", motivo: "duvida_clinica", criado_em: "2026-05-02T11:10:00.000Z" },
        { status: "resolvido", motivo: "agenda", criado_em: "2026-05-02T11:20:00.000Z" },
      ],
      conversations: [{ session_id: "wa:ok", updated_at: "2026-05-02T11:45:00.000Z" }],
      connectionLogs: [{ status: "open", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 1,
    });

    expect(summary.highPriorityActions).toBe(1);
    expect(summary.pendingHandoffs).toBe(2);
    expect(summary.topActionReasons[0]).toEqual({ label: "objecao preco pagamento", count: 2 });
    expect(summary.topHandoffReasons[0]).toEqual({ label: "duvida clinica", count: 2 });
    expect(summary.issues).toContain("Ha handoffs pendentes para atendimento humano");
  });

  it("detects poorly handled price responses", () => {
    const summary = summarizeVeraHealth({
      now,
      conversations: [
        {
          session_id: "wa:price",
          updated_at: "2026-05-02T11:00:00.000Z",
          mensagens: [
            { tipo: "human", conteudo: "Quanto custa implante?", timestamp: "2026-05-02T10:00:00.000Z" },
            { tipo: "ai", conteudo: "Implante fica R$ 2500 e pode parcelar no cartao.", timestamp: "2026-05-02T10:00:05.000Z" },
            { tipo: "ai", conteudo: "As formas de pagamento sao pix, cartao, dinheiro e carne da clinica. O ideal e fazer uma avaliacao para o dentista montar seu plano.", timestamp: "2026-05-02T10:01:05.000Z" },
          ],
        },
      ],
      connectionLogs: [{ status: "open", created_at: "2026-05-02T11:45:00.000Z" }],
      summariesCount: 1,
    });

    expect(summary.poorlyHandledPriceResponses).toBe(1);
    expect(summary.issues).toContain("Vera pode estar conduzindo preco de forma ruim");
    expect(summary.score).toBe(88);
  });
});
