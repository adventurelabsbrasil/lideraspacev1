# LideraSpace

Aplicação para gestão de programas de liderança: autenticação (Supabase), dashboard inicial, programas por organização, módulos, tarefas e ativos. Desenvolvida com Vite + React.

## Visão geral

- **Módulo 1** — Autenticação (email/senha e Google), layout com menu lateral, tema claro/escuro, páginas base.
- **Módulo 2** — Página inicial (boas-vindas, cards de programas, tabela de tarefas, scorecards de ativos), modelo de dados no Supabase (organizações, programas, módulos, tarefas, ativos), RLS por organização, telas de detalhe e fluxo “Novo programa”.

A documentação de cada módulo fica em `docs/`:

- [Módulo 1 — Autenticação e estrutura base](docs/MODULO_1.md)
- [Módulo 2 — Página inicial, modelo de dados e fluxo de programas](docs/MODULO_2.md)

Conforme o app evoluir, novos módulos e documentação podem ser adicionados em `docs/` (ex.: `MODULO_3.md`).

---

## Pré-requisitos

- Node.js 18+
- Conta [Supabase](https://supabase.com)

## Configuração

### 1. Variáveis de ambiente

Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Supabase:

```bash
cp .env.example .env
```

Edite `.env`:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

A **URL** e a **Anon key** ficam em: [Supabase Dashboard](https://app.supabase.com) → seu projeto → **Settings** → **API**.

### 2. Banco de dados (Módulo 2)

No **SQL Editor** do Supabase, execute em ordem:

1. `supabase/migrations/001_schema_organizacoes_programas.sql` — cria tabelas e RLS.
2. (Opcional) `supabase/seed_mock_data.sql` — popula dados de exemplo (é necessário ter pelo menos um usuário em Auth antes).

### 3. Login com Google (opcional)

Para usar “Entrar com Google”:

1. No Supabase: **Authentication** → **Providers** → **Google** → ative e preencha **Client ID** e **Client Secret** do [Google Cloud Console](https://console.cloud.google.com/).
2. Em **Authentication** → **URL Configuration**, defina **Site URL** (ex.: `http://localhost:5173` para dev) e em **Redirect URLs** adicione `http://localhost:5173/**` (e a URL de produção quando houver).

### 4. Instalação e execução

```bash
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173). Faça login e use o menu para navegar (Início, Meus Programas, etc.).

## Deploy no Vercel

1. **Conectar o repositório**
   - Acesse [vercel.com](https://vercel.com) e faça login (GitHub recomendado).
   - **Add New** → **Project** e importe o repositório do LideraSpace (conecte o GitHub se ainda não estiver conectado).
   - O Vercel detecta Vite automaticamente; o `vercel.json` já define build e rewrites para SPA.

2. **Variáveis de ambiente**
   - Em **Settings** → **Environment Variables** do projeto, adicione:
     - `VITE_SUPABASE_URL` = URL do seu projeto Supabase
     - `VITE_SUPABASE_ANON_KEY` = Anon key do Supabase
   - Marque **Production**, **Preview** e **Development** se quiser usar em todos os ambientes.
   - Faça um novo deploy após salvar (ou dispare um deploy manual).

3. **Supabase (produção)**
   - No [Supabase](https://app.supabase.com): **Authentication** → **URL Configuration**.
   - Em **Site URL** use a URL do Vercel (ex.: `https://seu-projeto.vercel.app`).
   - Em **Redirect URLs** adicione `https://seu-projeto.vercel.app/**` (e `https://*.vercel.app/**` se usar previews).
   - Se usar login com Google, o redirect pós-login funcionará após essa configuração.

4. **Deploy**
   - Cada push na branch conectada (ex.: `main`) gera um deploy automático. O primeiro deploy roda após você clicar em **Deploy** na importação.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run lint` — ESLint

## Estrutura do projeto

```
src/
  pages/        # Páginas: Login, Início, Programas, Tarefas, Ativos, Ajuda, detalhes, ProgramaNovo
  components/   # Layout, ProtectedRoute
  contexts/     # AuthContext, ThemeContext
  lib/          # cliente Supabase
docs/           # Documentação por módulo (MODULO_1.md, MODULO_2.md, …)
supabase/
  migrations/   # Schema (organizações, programas, módulos, tarefas, ativos)
  seed_mock_data.sql
```

## Segurança (multitenant)

Em produção, use apenas a **Anon key** no frontend. O acesso aos dados é controlado por **organização**: configure RLS no Supabase e sempre filtre por organização (ou por programa/entidade ligada à organização). Admin da organização e criador do programa têm permissão de escrita; membros têm apenas leitura. Ver [Módulo 2](docs/MODULO_2.md).
