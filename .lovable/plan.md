
Diagnóstico

- O problema não é o Google Ads em si. O problema é que o site atual não rastreia todos os caminhos que levam ao WhatsApp.
- Hoje o contador só sobe quando o clique passa por `trackWhatsAppClick()`.
- Só que, no site que está no ar, vários botões/links de WhatsApp ainda abrem o `wa.me` diretamente, sem passar por essa função.
- Resultado: o usuário pode vir do Google Ads, clicar no WhatsApp, virar atendimento real, e mesmo assim o painel não registrar esse clique.

Evidências encontradas

- O site principal usa `src/components/layout/Layout.tsx` com os componentes da pasta `src/components/medico/*`.
- Existem pontos com tracking correto, como:
  - `src/components/medico/HeroSection.tsx`
  - `src/components/home/CTABanner.tsx`
  - `src/components/home/FAQ.tsx`
  - `src/components/home/BeforeAfter.tsx`
  - `src/components/layout/WhatsAppButton.tsx`
- Mas há vários pontos ativos sem tracking:
  - `src/components/medico/Navbar.tsx` — botão AGENDAR e CTA mobile
  - `src/components/medico/AboutSection.tsx` — botão AGENDAR
  - `src/components/medico/DepartmentsSection.tsx` — link dos cards e botão AGENDAR AVALIAÇÃO
  - `src/pages/ServicesPage.tsx` — botão “Saiba mais”
  - `src/pages/ContactPage.tsx` — botão WhatsApp
  - `src/pages/About.tsx` — botão “Fale Conosco”
- Além disso, `DepartmentsSection.tsx` tem links hardcoded de `wa.me`, fora do padrão centralizado do projeto.
- Há um segundo problema: mesmo nos botões já instrumentados, `trackWhatsAppClick()` usa timeout de 500ms. Em mobile ou tráfego pago isso pode abortar antes do registro concluir, então o WhatsApp abre mas o clique se perde.

Conclusão objetiva

- Sim, é perfeitamente possível vocês terem recebido um lead real vindo do botão do WhatsApp do site e o contador não ter subido.
- Isso acontece porque “receber mensagem no WhatsApp” e “gravar clique em `whatsapp_leads`” hoje não são a mesma coisa no sistema.
- O site está subcontando cliques porque a instrumentação está incompleta e frágil.

Plano de correção

1. Centralizar o rastreamento
- Criar uma abstração única para WhatsApp no frontend, por exemplo um `TrackedWhatsAppLink` ou helper `openTrackedWhatsApp`.
- Todo CTA de WhatsApp passará por essa camada única.

2. Corrigir todos os CTAs ativos
- Substituir os links diretos/`wa.me` dos componentes e páginas ativas:
  - `Navbar.tsx`
  - `AboutSection.tsx`
  - `DepartmentsSection.tsx`
  - `ServicesPage.tsx`
  - `ContactPage.tsx`
  - `About.tsx`
- Revisar também componentes antigos para não deixar caminhos paralelos sem tracking.

3. Padronizar URLs e IDs
- Remover hardcodes de `wa.me`.
- Usar sempre `getWhatsAppUrl(...)`.
- Definir `button_id` consistente para cada CTA.
- Atualizar o gráfico “Cliques por Botão” para exibir corretamente os novos IDs.

4. Melhorar a confiabilidade do envio
- Tornar `trackWhatsAppClick()` mais robusto:
  - usar `navigator.sendBeacon` quando disponível
  - manter `fetch(..., keepalive: true)` como fallback
  - reduzir a chance de perda por timeout curto
- Objetivo: o clique continuar não bloqueando a navegação, mas com bem menos perda de registro.

5. Validar ponta a ponta
- Testar home, páginas internas e menu mobile.
- Testar com parâmetros de campanha (`utm_source=google`, `utm_medium=cpc`, `gclid`).
- Confirmar:
  - nova linha em `whatsapp_leads`
  - `button_id` correto
  - sessão com `utm_source/gclid`
  - atualização no dashboard

Detalhes técnicos

- Não parece necessária migração de banco para essa correção.
- O problema está principalmente na camada de frontend e no método de envio do tracking.
- Depois dessa correção, o contador passará a refletir muito melhor os cliques reais no WhatsApp vindos do Google Ads e dos demais pontos do site.
