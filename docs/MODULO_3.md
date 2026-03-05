# Módulo 3 — UI/UX profissional, responsividade e área admin

Escopo do terceiro módulo: layout responsivo (sidebar como drawer em mobile), design tokens e componentes base de UI, telas de detalhe com dados reais e vídeo YouTube, e área admin para editar programa e criar/editar módulos (vídeo e materiais).

## Objetivos

1. **Responsividade** — Uso em celular e tablet com menu colapsável e grids adaptativos.
2. **UI/UX** — Tokens de design (tipografia, espaçamento, raios, sombras) e componentes base (botões, inputs, cards).
3. **Detalhe com dados reais** — Programa e Módulo carregados do Supabase, com exibição de vídeo e materiais.
4. **Área admin** — Editar programa e criar/editar módulos (incluindo URL do vídeo YouTube e lista de materiais/links).

---

## 1. Responsividade

### Layout e sidebar
- **Desktop:** Sidebar fixa à esquerda (240px), conteúdo à direita.
- **Mobile (&lt; 768px):**
  - Header fixo no topo com marca, botão hamburger e toggle de tema.
  - Sidebar vira **drawer**: oculta por padrão; ao clicar no hamburger, abre sobre o conteúdo com overlay.
  - Ao clicar em um link do menu ou no overlay, o drawer fecha.
  - Conteúdo principal ocupa 100% da largura, com padding reduzido (1rem).

Arquivos: `src/components/Layout.tsx`, `src/components/Layout.css`.

### Conteúdo
- **Início:** Grid de cards e scorecards em 1 coluna no mobile, 2 em tablet, 3 em desktop. Cabeçalhos de seção empilham no mobile.
- **Meus Programas:** Cabeçalho e botão empilham no mobile; botões com altura mínima 44px para toque.
- **Tabela de tarefas (Início):** Scroll horizontal em mobile; células com padding reduzido.

---

## 2. UI/UX: design tokens e componentes base

### Tokens (index.css)
- **Cores:** Mantidas as variáveis de tema claro/escuro; adicionadas `--shadow-sm`.
- **Raio:** `--radius-sm`, `--radius-md`, `--radius-lg`.
- **Espaçamento:** `--space-1` a `--space-8` (escala 4/8px).
- **Tipografia:** `--font-size-sm/base/lg/xl/2xl`, `--font-weight-medium/semibold/bold`.

### Componentes base (ui.css)
- **Botões:** `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost` (com foco acessível e min-height 44px).
- **Formulário:** `.input-label`, `.input`, `.input-textarea`, `.input-select` (estados de foco com anel).
- **Card:** `.card`, `.card--hover`, `.card--link` para uso consistente.

Importado em `src/main.tsx` após `index.css`.

---

## 3. Telas de detalhe com dados reais e vídeo

### ProgramaDetalhe
- Busca o programa por `id` e os módulos por `programa_id` no Supabase.
- Exibe: breadcrumb, banner (se houver), título, data de atualização.
- Lista de módulos com link para `/programas/:id/modulos/:moduloId`.
- Se o usuário estiver logado: botões **Editar programa** e **Novo módulo** (admin contextual).

Arquivos: `src/pages/ProgramaDetalhe.tsx`, `src/pages/ProgramaDetalhe.css`.

### ModuloDetalhe
- Busca o módulo por `programaId` + `moduloId` no Supabase.
- Exibe: breadcrumb, banner (opcional), título, ordem.
- **Vídeo:** se existir `video_youtube_embed_url`, renderiza `<iframe>` em wrapper responsivo (aspect-ratio 16/9).
- **Tópicos e subtópicos:** listas.
- **Materiais:** lista de links com ícone (planilha, docs, pdf, vídeo, link) conforme o campo `icon`.
- Se o usuário estiver logado: botão **Editar módulo**.

Arquivos: `src/pages/ModuloDetalhe.tsx`, `src/pages/ModuloDetalhe.css`.

---

## 4. Área admin: editar programa e módulos

A admin é **contextual** (Opção A do plano): não há rota `/admin` única; as ações ficam nas telas de detalhe.

### Onde fica
- **ProgramaDetalhe:** botões "Editar programa" e "Novo módulo".
- **ModuloDetalhe:** botão "Editar módulo".

Por enquanto os botões são exibidos para qualquer usuário logado; em um módulo futuro, pode-se restringir a `organization_members.role = 'admin'` (via RLS ou checagem no front).

### Editar programa
- **Rota:** `/programas/:id/editar`
- **Página:** `ProgramaEditar.tsx`
- Campos: título, URL do banner, URLs dos favicons (programa e criador). Organização não editável.
- Submit: `update` em `programas`; redireciona para o detalhe do programa.

### Novo módulo
- **Rota:** `/programas/:id/modulos/novo`
- **Página:** `ModuloNovo.tsx` (usa `ModuloForm` com `programaId`).

### Editar módulo
- **Rota:** `/programas/:programaId/modulos/:moduloId/editar`
- **Página:** `ModuloEditar.tsx` (usa `ModuloForm` com `programaId` e `moduloId`).

### Formulário de módulo (ModuloForm)
- Campos: título, ordem, **URL do vídeo YouTube** (aceita URL normal ou embed; converte para formato embed ao salvar).
- **Tópicos** e **Subtópicos:** listas dinâmicas (adicionar/remover linhas).
- **Materiais:** lista de itens `{ url, label, icon }` (adicionar/remover); ícone: link, planilha, docs, pdf, video.
- Opcionais: URL do banner do módulo, URL do favicon do programa.
- Salvar: `insert` ou `update` em `modulos` com `video_youtube_embed_url` e `materiais` (JSONB).

**Anexos:** O schema usa `materiais` como JSONB de links. Anexos em arquivo (upload) exigiriam Supabase Storage e ficam para um passo futuro.

Arquivos: `src/pages/ModuloForm.tsx`, `src/pages/ModuloForm.css`, `src/pages/ModuloNovo.tsx`, `src/pages/ModuloEditar.tsx`, `src/pages/ProgramaEditar.tsx`.

---

## 5. Rotas adicionadas

| Rota | Componente |
|------|------------|
| `programas/:id/editar` | ProgramaEditar |
| `programas/:id/modulos/novo` | ModuloNovo |
| `programas/:programaId/modulos/:moduloId/editar` | ModuloEditar |

As rotas de edição e “novo módulo” devem vir **antes** das rotas de detalhe (`programas/:id` e `programas/:programaId/modulos/:moduloId`) no `App.tsx` para que não sejam interpretadas como IDs.

---

## 6. Arquivos principais

| Área | Arquivos |
|------|----------|
| Layout responsivo | `src/components/Layout.tsx`, `src/components/Layout.css` |
| Tokens e UI base | `src/index.css`, `src/components/ui.css` |
| Detalhe programa/módulo | `src/pages/ProgramaDetalhe.tsx`, `ProgramaDetalhe.css`, `ModuloDetalhe.tsx`, `ModuloDetalhe.css` |
| Admin programa | `src/pages/ProgramaEditar.tsx` |
| Admin módulo | `src/pages/ModuloForm.tsx`, `ModuloForm.css`, `ModuloNovo.tsx`, `ModuloEditar.tsx` |
| Rotas | `src/App.tsx` (rotas de editar e modulos/novo, modulos/:moduloId/editar) |

---

## Próximos passos (sugestão)
- Restringir botões de admin a usuários com role `admin` na organização do programa (quando RLS existir).
- Upload de anexos (Supabase Storage) além de links em materiais.
- Conectar a página **Início** aos dados reais do Supabase (programas, tarefas, ativos).
- Admin para tarefas e ativos (criar/editar).
