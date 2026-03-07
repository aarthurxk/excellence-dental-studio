

# O que falta para o site ficar 100% (com painel admin editável)

## Estado atual
O site tem toda a estrutura frontend pronta com dados hardcoded: Home (11 seções), 7 sub-páginas, Header, Footer e WhatsApp button. Não há banco de dados, autenticação, nem painel administrativo.

## O que falta

### 1. Backend — Banco de dados (Lovable Cloud / Supabase)
Criar tabelas para todo o conteúdo editável:

- **`site_settings`** — textos do Hero (título, subtítulo), telefone, e-mail, endereço, horários, links de redes sociais, URL do Google Maps, número do WhatsApp
- **`services`** — título, descrição, ícone, benefícios, ordem de exibição, ativo
- **`dentists`** — nome, especialidade, CRO, bio, foto, ordem, ativo
- **`testimonials`** — nome do paciente, texto, nota (estrelas), destaque, ativo
- **`videos`** — título, descrição, youtubeId, destaque, ordem, ativo
- **`events`** — título, descrição, data, local, imagem, ativo
- **`about_content`** — textos da seção Sobre (título, parágrafos, stats)
- **`features`** — diferenciais (ícone, título, descrição, ordem)

### 2. Autenticação — Login de administrador
- Criar sistema de login com email/senha via Supabase Auth
- Tabela `user_roles` com role `admin` (security definer function `has_role`)
- Rota `/admin/login` e proteção de rotas admin
- Sem necessidade de perfis de usuário público

### 3. Painel Administrativo — CRUD completo
Criar `/admin` com sidebar e páginas para gerenciar:

- **Dashboard** — visão geral com contadores
- **Configurações gerais** — editar textos do Hero, contatos, horários, redes sociais, WhatsApp
- **Tratamentos** — listar, adicionar, editar, remover, reordenar
- **Equipe** — listar, adicionar, editar, remover com upload de foto
- **Depoimentos** — listar, adicionar, editar, remover, marcar destaque
- **Vídeos** — listar, adicionar, editar, remover, marcar destaque
- **Eventos** — listar, adicionar, editar, remover
- **Sobre** — editar textos e stats da seção Sobre
- **Diferenciais** — listar, editar os 4 cards de Features

### 4. Storage — Upload de imagens
- Bucket para fotos da equipe, imagens de eventos e foto do Hero/Sobre
- Políticas RLS para upload apenas por admin

### 5. Conectar frontend ao banco
- Substituir todos os dados hardcoded por queries ao Supabase (React Query)
- Loading states e fallbacks para quando não há dados
- Home e sub-páginas puxando dados dinâmicos

### 6. Formulário de contato funcional
- Edge function para receber mensagens do formulário de contato
- Salvar no banco (tabela `contact_messages`) ou enviar por email
- Validação client-side com zod + server-side
- Listagem de mensagens no admin

### 7. Imagens reais nos placeholders
- Substituir todos os "Foto" / "Vídeo YouTube" por imagens e embeds reais
- Hero, Equipe, Sobre, Vídeos (YouTube embed real)

### 8. SEO e meta tags dinâmicas
- Meta tags corretas por página (title, description, og:image)
- Sitemap e robots.txt refinados

### 9. Dados reais da clínica
- Endereço real, telefones, e-mail, horários corretos
- URL correta do Google Maps embed
- Links reais de Instagram e Facebook
- IDs reais dos vídeos do YouTube

## Ordem sugerida de implementação
1. Ativar Lovable Cloud / Supabase
2. Criar tabelas + RLS + auth
3. Painel admin (login + CRUD)
4. Storage para uploads
5. Conectar frontend ao banco
6. Formulário de contato funcional
7. Inserir dados reais + imagens
8. SEO final

## Estimativa
Aproximadamente 15-25 mensagens para implementar tudo, dependendo da complexidade de cada etapa.

