# LideraSpace

Plataforma de gestão de programas de liderança com autenticação, organizações multitenant, programas, módulos hierárquicos e blocos dinâmicos estilo Notion. Desenvolvida com **Vite + React + TypeScript** e **Supabase** (Auth, Database, Storage).

---

## Estado atual do app (atualizado)

### Funcionalidades implementadas

| Área | Recurso | Status |
|------|---------|--------|
| **Auth** | Login email/senha | ✅ |
| **Auth** | Login com Google OAuth | ✅ |
| **Auth** | Proteção de rotas | ✅ |
| **Perfil** | Nome e avatar (upload Supabase Storage) | ✅ |
| **Organizações** | Multitenant por organização | ✅ |
| **Roles** | `lidera_admin`, `org_admin`, `aluno` | ✅ |
| **Super admin** | `profiles.is_super_admin` para ver todos os dados | ✅ |
| **Programas** | Listar, criar, editar, detalhe | ✅ |
| **Módulos** | Hierarquia (`parent_id`), subpáginas | ✅ |
| **Módulos** | Blocos dinâmicos (título, texto Markdown, link, vídeo, tarefa, subpágina) | ✅ |
| **Módulos** | Conteúdo Markdown (`content`) como fallback | ✅ |
| **Módulos** | Vídeo YouTube (URL → embed automático) | ✅ |
| **Estado do aluno** | Anotações e checklist por módulo (`student_module_states`) | ✅ |
| **Storage** | Bucket `avatars` (avatar do perfil) | ✅ |
| **Storage** | Bucket `programas` (banners, favicons) | ✅ |
| **UI** | Temas: Original (Deep Navy + Dourado), Dark, Light | ✅ |
| **UI** | Sidebar com árvore de programas e módulos | ✅ |
| **UI** | Layout responsivo (drawer em mobile) | ✅ |
| **RLS** | Políticas por organização e role | ✅ |

### Rotas

| Rota | Página | Descrição |
|------|--------|-----------|
| `/login` | Login | Autenticação |
| `/` | Inicio | Dashboard inicial |
| `/perfil` | Perfil | Nome e avatar |
| `/programas` | MeusProgramas | Lista de programas |
| `/programas/novo` | ProgramaNovo | Criar programa |
| `/programas/:id` | ProgramaDetalhe | Detalhe do programa |
| `/programas/:id/editar` | ProgramaEditar | Editar programa |
| `/programas/:programId/modulos/novo` | ModuloNovo | Novo módulo |
| `/programas/:programId/modulos/:moduleId` | ModuloDetalhe | Detalhe do módulo |
| `/programas/:programId/modulos/:moduleId/editar` | ModuloEditar | Editar módulo |
| `/tarefas` | MinhasTarefas | Tarefas (em construção) |
| `/ativos` | MeusAtivos | Ativos (em construção) |
| `/ajuda` | Ajuda | Documentação e guia do admin |

### Organograma e roles

- **lidera_admin** — Admin geral (Adventure Labs) ou admin da organização cliente. Acesso completo a programas e módulos da org.
- **org_admin** — Admin da organização. Pode criar/editar programas e módulos da org.
- **aluno** — Membro matriculado. Visualiza conteúdo e salva anotações/checklist.
- **Super admin** — `profiles.is_super_admin = true` vê todas as organizações (bypass RLS para SELECT).

### Stack técnico

- **Frontend:** React 19, Vite 7, TypeScript 5.9, React Router 7
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Editor:** @uiw/react-md-editor (Markdown com toolbar)
- **Markdown:** react-markdown, remark-gfm, rehype-sanitize

---

## Pré-requisitos

- Node.js 18+
- Conta [Supabase](https://supabase.com)

---

## Configuração

### 1. Variáveis de ambiente

```bash
cp .env.example .env
```

Edite `.env`:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

URL e Anon key em: Supabase Dashboard → **Settings** → **API**.

### 2. Banco de dados

Execute as migrações em ordem:

```bash
supabase db push
```

Ou, no SQL Editor do Supabase, rode manualmente os arquivos em `supabase/migrations/` (001 a 009).

### 3. Seed de organizações e admins

Após criar usuários em **Authentication > Users**, rode no SQL Editor:

```bash
# Ajuste os UUIDs conforme os IDs dos usuários no Auth
supabase/seed_orgs_and_admins.sql
```

Para super admin (ver todos os dados):

```sql
UPDATE public.profiles SET is_super_admin = true WHERE id = 'seu-user-uuid'::uuid;
```

### 4. Login com Google

1. Supabase: **Authentication** → **Providers** → **Google** → ative e preencha Client ID e Secret.
2. **URL Configuration:** Site URL e Redirect URLs (ex.: `http://localhost:5173/**`).

### 5. Instalação e execução

```bash
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173).

---

## Deploy no Vercel

1. Conecte o repositório ao Vercel.
2. Adicione `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em Environment Variables.
3. Configure Site URL e Redirect URLs no Supabase para a URL do Vercel.
4. Deploy automático a cada push.

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |

---

## Estrutura do projeto

```
src/
  pages/          # Páginas (Login, Inicio, MeusProgramas, ModuloDetalhe, etc.)
  components/     # Layout, BlockEditor, RichTextContent, ImageUrlOrUpload, etc.
  contexts/       # AuthContext, ThemeContext
  lib/            # supabase.ts, youtube.ts
docs/             # Documentação (MODULO_1.md, VERIFICACAO_SUPABASE_CODIGO.md)
supabase/
  migrations/     # 001–009 (schema, storage, RLS, super admin)
  seed_orgs_and_admins.sql
```

---

## Documentação adicional

- [Módulo 1 — Autenticação](docs/MODULO_1.md)
- [Módulo 2 — Modelo de dados](docs/MODULO_2.md)
- [Módulo 3 — UI/UX e admin](docs/MODULO_3.md)
- [Módulo 4 — Rich text e imagens](docs/MODULO_4.md)
- [Verificação Supabase ↔ Código](docs/VERIFICACAO_SUPABASE_CODIGO.md)

---

## Segurança

- Use apenas a **Anon key** no frontend.
- RLS ativo em `organizations`, `organization_members`, `programs`, `modules`, `tasks`, `assets`, `profiles`, `student_module_states`.
- Políticas baseadas em `user_in_organization()` e `user_can_admin_program()`.
