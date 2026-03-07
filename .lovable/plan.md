

# Diagnóstico do Site -- O que falta e Fases de Conclusão

Após analisar todo o código, aqui está o estado atual e o que falta organizado em fases.

---

## O que JA ESTA PRONTO

- Layout completo (TopBar, HeaderInfo, Navbar, Footer, WhatsApp button)
- Home page com todas as seções: Hero, InfoStrip, HighlightBanner, About, Departments/Services, Doctors, Testimonials, Blog, Location
- Sub-páginas: Sobre, Tratamentos, Equipe, Depoimentos, Vídeos, Eventos, Contato (com formulário funcional)
- Painel admin completo: Login, Dashboard, CRUD de Tratamentos, Dentistas, Depoimentos, Vídeos, Eventos, Diferenciais, Sobre, Mensagens, Configurações
- Banco de dados com tabelas e RLS configurados
- Hook `useSiteSettings` com cache global
- Todas as seções conectadas ao banco (dados dinâmicos)
- Endereço atualizado em todo o site
- Data dinâmica e status ABERTO/FECHADO na TopBar

---

## O QUE FALTA -- Organizado em Fases

### FASE 1 -- Conteúdo Real e Imagens (Prioridade Alta)
Substituir todos os placeholders por conteúdo real da clínica.

| Item | Status atual | O que fazer |
|---|---|---|
| Imagens (Hero, About, Dentistas) | Placeholders genéricos | Subir fotos reais via admin |
| Textos do About | Texto lorem ipsum | Preencher via admin (about_content) |
| Lista de Tratamentos | Possivelmente vazia no banco | Cadastrar via admin |
| Equipe de Dentistas | Possivelmente vazia | Cadastrar via admin com fotos |
| Depoimentos | Possivelmente vazios | Cadastrar via admin |
| Vídeos do YouTube | Possivelmente vazios | Cadastrar IDs dos vídeos via admin |
| Eventos | Possivelmente vazios | Cadastrar via admin |
| Redes sociais (URLs) | Vazias no banco | Preencher nas Configurações admin |

**Nenhuma alteração de código necessária** -- tudo via painel admin.

---

### FASE 2 -- Ajustes Funcionais (Prioridade Media)
Pequenas correções e melhorias no código.

| Item | Detalhe |
|---|---|
| BlogSection hardcoded | Seção "Novidades & Dicas" na Home usa dados estáticos. Opção: remover, ou criar tabela `blog_posts` |
| Busca (Search) no Navbar | Botão de busca existe mas não faz nada |
| Links de redes sociais dos dentistas | Ícones Facebook/X/LinkedIn nos cards da equipe apontam para `#` |
| Lista de tratamentos no Footer | Hardcoded ("Implantes", "Ortodontia"...) em vez de dinâmica |
| Horário do `isClinicOpen()` | Hardcoded 9h-19h / 9h-17h -- deveria ler do `site_settings` |
| SEO / meta tags | Sem title/description dinâmicos por página |

---

### FASE 3 -- Melhorias de UX (Prioridade Baixa)
Polimento visual e funcionalidades extras.

| Item | Detalhe |
|---|---|
| Página 404 personalizada | Verificar se `NotFound.tsx` tem visual adequado |
| Responsividade mobile | Testar e ajustar componentes em telas pequenas |
| Acessibilidade | Alt texts, contraste, navegação por teclado |
| Performance | Lazy loading de imagens, otimização de bundles |
| Cookie consent / LGPD | Banner de consentimento de cookies |
| Favicon personalizado | Substituir favicon padrão pelo logo da clínica |

---

### FASE 4 -- Funcionalidades Extras (Opcional)
Features que agregariam valor mas não são essenciais para lançamento.

| Item | Detalhe |
|---|---|
| Agendamento online | Formulário com escolha de data/dentista/tratamento |
| Blog funcional | Tabela + CRUD admin + página de listagem/detalhe |
| Galeria de fotos | Antes/depois de tratamentos |
| Área do paciente | Login para ver histórico de consultas |

---

## Recomendação de Próximos Passos

1. **Fase 1 primeiro**: Preencher todo o conteúdo real pelo painel admin -- isso já transforma o site em algo publicável
2. **Fase 2 em paralelo**: Posso começar corrigindo o BlogSection (remover ou tornar dinâmico), o footer dinâmico e o botão de busca
3. **Fase 3 antes de publicar**: SEO e responsividade são importantes para o lançamento
4. **Fase 4 pós-lançamento**: Funcionalidades extras podem ser adicionadas depois

