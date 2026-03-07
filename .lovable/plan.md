

# Etapas Pendentes para Finalizar o Site

Após análise completa do código, **a integração frontend-banco nunca foi efetivada** — todos os componentes continuam com dados hardcoded. Além disso, falta o painel admin.

---

## Status Atual vs Esperado

| Item | Status |
|---|---|
| Banco de dados (tabelas, RLS, dados) | ✅ Pronto |
| Frontend hardcoded (visual ok) | ✅ Pronto |
| Conexão frontend → banco | ❌ Não feito |
| Painel admin | ❌ Não existe |
| Link admin no Footer | ❌ Não feito |

---

## Etapas Restantes (em ordem de prioridade)

### Etapa 1 — Conectar frontend ao banco de dados
Substituir dados hardcoded por queries dinâmicas em **20 arquivos**:

- **Criar** `src/hooks/useSiteSettings.ts` e `src/lib/icon-map.ts`
- **Atualizar** 10 componentes home: Hero, Features, ServicesPreview, About, Team, Testimonials, Videos, Events, Location, CTABanner
- **Atualizar** 4 layout: Header, Footer, WhatsAppButton + Layout (sem mudança)
- **Atualizar** 6 páginas: ServicesPage, TeamPage, TestimonialsPage, VideosPage, EventsPage, About, ContactPage (com formulário funcional + Zod)
- Padrão: React Query + loading skeletons + fallback hardcoded

### Etapa 2 — Painel Administrativo
Criar sistema admin completo em `/admin`:

- **Login** (`/admin/login`) com autenticação via banco
- **Dashboard** com visão geral e menu lateral
- **CRUD** para cada tabela: Tratamentos, Dentistas, Depoimentos, Vídeos, Eventos, Diferenciais, Sobre, Mensagens de Contato, Configurações do site
- **Proteção de rotas** com verificação de role (admin/sócio)
- Componentes: formulários com validação, tabelas com paginação, confirmação de exclusão

### Etapa 3 — Link discreto no Footer
Adicionar link pequeno e discreto no rodapé apontando para `/admin/login`.

### Etapa 4 — Dados reais
Substituir os dados de exemplo no banco pelos dados reais da clínica (endereço, telefones, horários, URLs de redes sociais, Google Maps embed, fotos dos dentistas, vídeos do YouTube reais).

### Etapa 5 — Refinamentos finais
- SEO: meta tags dinâmicas por página (title, description, og:image)
- Responsividade: revisão final em mobile
- Performance: lazy loading de imagens, otimização de queries
- Publicação do site

---

## Recomendação

Sugiro começar pela **Etapa 1** (conectar frontend ao banco), pois é pré-requisito para que o admin funcione de ponta a ponta. Deseja que eu implemente?

