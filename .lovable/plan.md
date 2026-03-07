

## Plano: Atualizações gerais (TopBar, InfoStrip, endereço, horários)

### Horários corretos da clínica
- **Seg a Sex:** 9h – 19h
- **Sábado:** 9h – 17h
- **Domingo/Feriado:** Fechado

### 1. Atualizar dados no banco (`site_settings`)
Usar insert tool para atualizar:
- `address` → `Rua Jean Emile Favre, 1712 – Ipsep, Recife – PE, 51190-450`
- `hours_weekday` → `Seg a Sex: 9h – 19h`
- `hours_saturday` → `Sáb: 9h – 17h`
- `google_maps_embed_url` → embed URL do Google Maps para o endereço acima

### 2. TopBar (`src/components/medico/TopBar.tsx`)
- Remover "| EMERGÊNCIA: 24/7"
- Adicionar lógica de horário atual: exibir **"ABERTO"** (verde, maiúsculo) se dentro do horário (Seg-Sex 9-19, Sáb 9-17), ou **"FECHADO"** (vermelho) caso contrário
- Manter horário textual + indicador ao lado

### 3. InfoStrip (`src/components/medico/InfoStrip.tsx`)
- **Bloco 1:** Trocar `Ambulance` + "Emergência 24/7" por ícone da clínica (ex: `Smile` ou `HeartPulse`) com título "Odonto Excellence" e telefones de agendamento/contato (sem "Ambulância")
- **Bloco 2 (Horário):** Exibir "Segunda – Sexta: 9h – 19h" e "Sábado: 9h – 17h". Remover linha de domingos/feriados
- **Bloco 3 (Central):** Remover "Laboratório" e "Comercial", manter apenas "Agendamento" e "Contato"

### 4. Componentes que já usam `useSiteSettings`
HeaderInfo, FooterMedico, Location — esses vão refletir automaticamente as mudanças no banco (endereço, horários). Nenhuma edição de código necessária neles.

### Arquivos a editar
| Arquivo | Alteração |
|---|---|
| `src/components/medico/TopBar.tsx` | Indicador ABERTO/FECHADO, remover emergência |
| `src/components/medico/InfoStrip.tsx` | Trocar emergência, ajustar horários e telefones |
| BD `site_settings` | Atualizar address, hours_weekday, hours_saturday, google_maps_embed_url |

