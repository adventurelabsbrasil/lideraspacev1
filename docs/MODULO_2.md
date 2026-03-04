# Módulo 2 — Página inicial, modelo de dados e fluxo de programas

Escopo do segundo módulo: dashboard visual, schema no Supabase (organizações, programas, módulos, tarefas, ativos) e fluxo para criar e ver programas.

## Entregas

### 1. Página inicial (Início)
- **Boas-vindas** com nome do usuário (derivado do e-mail)
- **Cards dos Programas** — grid de cards com nome, progresso e link para detalhe
- **Tabela resumo de tarefas** — tarefa, programa, status, prazo (com links para detalhe)
- **Scorecards de últimos ativos** — cards com tipo, título e data (links para detalhe)
- Botão **Novo programa** na seção de programas

### 2. Modelo de dados (Supabase)
Schema em `supabase/migrations/001_schema_organizacoes_programas.sql`:

| Tabela                 | Descrição |
|------------------------|-----------|
| `organizations`        | Organizações (nome, timestamps) |
| `organization_members` | Vínculo usuário–organização com `role` (`admin` \| `member`) |
| `programas`            | Programas: título, organização, criador, banner, favicons |
| `modulos`              | Módulos do programa: tópicos, subtópicos, vídeo YouTube, materiais (JSONB), banner |
| `tarefas`              | Tarefas: programa, módulo (opcional), título, status, criador, datas |
| `ativos`              | Ativos: programa, módulo (opcional), título, link, tipo de ícone (planilha, docs, pdf, video, link) |

**Acesso (RLS):**
- **Organização** define quem vê o conteúdo (membros da organização).
- **Admin** = usuário com `role = 'admin'` na organização **ou** criador do programa (`created_by`). Pode criar/editar programas, módulos, tarefas e ativos.
- **Cliente/aluno** = `role = 'member'`. Apenas leitura.

Funções auxiliares: `user_can_admin_program(programa_id)`, `user_in_organization(organization_id)`.

### 3. Telas de detalhe
- **Programa** — `/programas/:id` (`ProgramaDetalhe.tsx`)
- **Módulo** — `/programas/:programaId/modulos/:moduloId` (`ModuloDetalhe.tsx`)
- **Tarefa** — `/tarefas/:id` (`TarefaDetalhe.tsx`)
- **Ativo** — `/ativos/:id` (`AtivoDetalhe.tsx`)

Cada uma com breadcrumb e área de conteúdo (dados reais a conectar depois).

### 4. Fluxo “Novo programa”
- Botão **Novo programa** na **Início** e na lista **Meus Programas**
- Página **Novo programa** (`/programas/novo`): formulário com título, organização (select: só orgs em que o usuário é admin), URLs opcionais (banner, favicons)
- Criação no Supabase com `created_by` = usuário logado; redirecionamento para o programa criado

### 5. Listagem Meus Programas
- Lista de programas vinda do Supabase (título, data de atualização)
- Botão **Novo programa**
- Estado vazio com link “Criar o primeiro programa”
- Cards clicáveis para a tela de detalhe do programa

### 6. Seed de dados mock
- `supabase/seed_mock_data.sql`: popula 1 organização, 3 programas, 3 módulos, 4 tarefas, 4 ativos
- Usa o primeiro usuário de `auth.users` como admin e criador
- Rodar no SQL Editor do Supabase após ter pelo menos um usuário cadastrado

## Arquivos principais

| Área              | Arquivos |
|-------------------|----------|
| Página Início     | `src/pages/Inicio.tsx`, `src/pages/Inicio.css` |
| Programas         | `src/pages/MeusProgramas.tsx`, `src/pages/MeusProgramas.css`, `src/pages/ProgramaNovo.tsx`, `src/pages/ProgramaNovo.css`, `src/pages/ProgramaDetalhe.tsx` |
| Detalhes          | `src/pages/ModuloDetalhe.tsx`, `src/pages/TarefaDetalhe.tsx`, `src/pages/AtivoDetalhe.tsx`, `src/pages/Detalhe.css` |
| Schema + seed     | `supabase/migrations/001_schema_organizacoes_programas.sql`, `supabase/seed_mock_data.sql` |
| Rotas             | `src/App.tsx` (rotas de programas, programas/novo, programas/:id, módulo, tarefa, ativo) |

## Próximos passos (sugestão)
- Conectar a página **Início** aos dados reais do Supabase (programas, tarefas, ativos por organização).
- Preencher as telas de **detalhe** com dados do Supabase.
- Área **admin** para edição de programas, módulos, tarefas e ativos.
