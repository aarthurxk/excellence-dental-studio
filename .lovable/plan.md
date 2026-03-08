

## Revisão Geral de Textos do Frontend

Encontrei os seguintes problemas de conteúdo incorreto ou em desacordo com as diretrizes do CRO e a realidade da clínica:

---

### Problemas encontrados

| # | Arquivo | Problema |
|---|---------|----------|
| 1 | `FAQ.tsx` (linha 8) | Diz "avaliação gratuita e sem compromisso" — viola CRO |
| 2 | `FAQ.tsx` (linha 9) | Diz que aceita planos odontológicos — **incorreto** |
| 3 | `FAQ.tsx` (linha 12) | Horário diz "8h às 19h" e "8h às 12h" — pode estar errado (settings diz "8h – 18h" como fallback) |
| 4 | `CTABanner.tsx` (linha 52) | "Avaliação gratuita" — viola CRO |
| 5 | `TimetableSection.tsx` | Tabela inteira com nomes fictícios de dentistas (Dr. Silva, Dra. Costa, etc.) e horários placeholder — informação falsa |
| 6 | `useSiteSettings.ts` fallback | `hours_weekday: "Seg a Sex: 8h – 18h"` — confirmar se correto |
| 7 | `InfoStrip.tsx` fallback | `"9h – 19h"` como fallback de horário semanal |

---

### Correções planejadas

**1. `src/components/home/FAQ.tsx`**
- FAQ 1 (avaliação): Trocar para texto neutro: *"Agende sua avaliação entrando em contato pelo WhatsApp ou telefone."* — sem mencionar gratuidade
- FAQ 2 (planos): Trocar para: *"Nosso atendimento é particular. Entre em contato para conhecer nossas condições de pagamento."*
- FAQ 5 (horário): Usar os horários do `useSiteSettings` dinamicamente em vez de hardcoded, ou alinhar com o fallback correto

**2. `src/components/home/CTABanner.tsx`**
- Remover "Avaliação gratuita", trocar por algo como: `✓ Sem compromisso · ✓ Resposta rápida · ✓ Atendimento humanizado`

**3. `src/components/medico/TimetableSection.tsx`**
- Remover esta seção inteira da página Index, pois contém dados completamente fictícios. Ou, se preferir manter, limpar os nomes placeholder

**4. `src/hooks/useSiteSettings.ts`**
- Alinhar os fallbacks de horário para serem consistentes (o banco de dados já deve ter os valores corretos, mas os fallbacks devem concordar)

**5. `src/components/medico/InfoStrip.tsx`**
- Ajustar fallback de `"9h – 19h"` para ser consistente com o horário real

---

### Resumo das alterações
- 4 arquivos editados (`FAQ.tsx`, `CTABanner.tsx`, `InfoStrip.tsx`, `useSiteSettings.ts`)
- 1 componente possivelmente removido do Index (`TimetableSection`)
- Nenhuma mudança de lógica ou estrutura, apenas conteúdo textual

