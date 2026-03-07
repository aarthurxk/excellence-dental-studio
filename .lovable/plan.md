

## Plano: TopBar com data DD/MM/AA e status

### Alteração em `src/components/medico/TopBar.tsx`
- Substituir o texto de horário estático pela data atual no formato `DD/MM/AA` (ex: "07/03/26")
- Usar `date-fns`: `format(new Date(), "dd/MM/yy")`
- Exibir: `📅 07/03/26 - Sexta-feira  [ABERTO]`
- Manter o badge ABERTO/FECHADO com a lógica `isClinicOpen()` existente
- Capitalizar o dia da semana com `format` + locale `pt-BR`

| Arquivo | Alteração |
|---|---|
| `src/components/medico/TopBar.tsx` | Data DD/MM/AA + dia da semana + badge status |

