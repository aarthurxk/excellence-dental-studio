

## Plano: Legenda clicável para mostrar/ocultar linhas no gráfico de tendência

### O que será feito
Ao clicar em "Cliques WhatsApp" ou "Sessões" na legenda, a respectiva linha some do gráfico. Clicando de novo, ela reaparece.

### Etapas

1. **Adicionar estado local** — Um `useState` com um `Set` de dataKeys ocultos (ex: `hiddenLines`).

2. **Handler de clique na legenda** — Usar `onClick` do `<Legend>` para alternar a key clicada no set.

3. **Ocultar linhas** — Passar `hide={true}` nas `<Line>` cujo `dataKey` estiver no set.

4. **Estilo visual na legenda** — Renderizar legenda customizada: item oculto fica com opacidade reduzida e texto riscado (`line-through`), dando feedback visual.

### Detalhes técnicos
- Recharts `<Legend>` aceita `onClick` com payload contendo `dataKey`.
- `<Line hide={true}>` remove a linha do gráfico sem afetar os dados.
- Legenda customizada via `content` prop do `<Legend>`.

