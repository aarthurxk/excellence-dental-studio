

## Plano: Atualizações gerais (TopBar, InfoStrip, endereço, horários)

### 1. Atualizar dados no banco (`site_settings`)
Usar insert tool para:
- `address` → `Rua Jean Emile Favre, 1712 – Ipsep, Recife – PE, 51190-450`
- `hours_weekday` → `Seg a Sex: 9h – 19h`
- `hours_saturday` → `Sáb: 9h – 17h`
- `google_maps_embed_url` → embed URL do Google Maps para o endereço

### 2. TopBar (`src/components/medico/TopBar.tsx`)
- Remover "| EMERGÊNCIA: 24/7"
- Adicionar função `isClinicOpen()` que verifica dia da semana e hora atual:
  - Seg-Sex (1-5): 9h–19h → ABERTO
  - Sáb (6): 9h–17h → ABERTO
  - Caso contrário → FECHADO
- Exibir badge verde "ABERTO" ou vermelho "FECHADO" ao lado do horário

### 3. InfoStrip (`src/components/medico/InfoStrip.tsx`)
- **Bloco 1:** Trocar `Ambulance` → `Smile`, título "Odonto Excellence", telefones de agendamento/contato (sem "Ambulância")
- **Bloco 2:** Horário com apenas Seg-Sex e Sábado, sem domingos/feriados
- **Bloco 3:** Manter apenas "Agendamento" e "Contato", remover "Laboratório" e "Comercial"

### Arquivos
| Arquivo | Alteração |
|---|---|
| BD `site_settings` | UPDATE address, hours, maps URL |
| `src/components/medico/TopBar.tsx` | Indicador ABERTO/FECHADO dinâmico |
| `src/components/medico/InfoStrip.tsx` | Substituir emergência, ajustar conteúdo |

