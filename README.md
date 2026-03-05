# LideraSpace

Aplicação para gestão de programas de liderança: autenticação (Supabase), dashboard inicial, programas por organização, módulos, tarefas e ativos. Desenvolvida com Vite + React.

## Visão geral

- **Módulo 1** — Autenticação (email/senha e Google), layout com menu lateral, tema claro/escuro, páginas base.
- **Módulo 2** — Página inicial (boas-vindas, cards de programas, tabela de tarefas, scorecards de ativos), modelo de dados no Supabase (organizações, programas, módulos, tarefas, ativos), telas de detalhe e fluxo “Novo programa”.
- **Módulo 3** — UI/UX (design tokens, componentes base), layout responsivo (sidebar drawer em mobile), telas de detalhe com dados reais e vídeo YouTube, área admin contextual (editar programa, novo/editar módulo com vídeo e materiais).
- **Módulo 4** — Rich text estilo Notion nos módulos (Markdown com editor de toolbar e renderização com links iconizados); banners e favicons com opção de URL ou upload no Supabase Storage.

A documentação de cada módulo fica em `docs/`:

- [Módulo 1 — Autenticação e estrutura base](docs/MODULO_1.md)
- [Módulo 2 — Página inicial, modelo de dados e fluxo de programas](docs/MODULO_2.md)
- [Módulo 3 — UI/UX, responsividade e área admin](docs/MODULO_3.md)
- [Módulo 4 — Rich text e imagens (URL + upload)](docs/MODULO_4.md)

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

### 2. Banco de dados

No **SQL Editor** do Supabase, execute em ordem:

1. `supabase/migrations/001_schema_organizacoes_programas.sql` — cria tabelas.
2. `supabase/migrations/002_modulo_conteudo_and_storage.sql` — coluna `conteudo` em modulos e bucket Storage para imagens (Módulo 4).
3. (Opcional) `supabase/seed_mock_data.sql` — popula dados de exemplo (é necessário ter pelo menos um usuário em Auth antes).

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

2. **Variáveis de ambiente (obrigatório para o app funcionar no Vercel)**
   - No Vercel: **Settings** → **Environment Variables** do projeto.
   - Adicione exatamente (nomes com VITE_):
     - `VITE_SUPABASE_URL` = URL do projeto (ex.: `https://xxxx.supabase.co`)
     - `VITE_SUPABASE_ANON_KEY` = Anon key (em Supabase: Settings → API → anon public).
   - Marque **Production** (e **Preview** se quiser em branches).
   - **Importante:** no Vite as variáveis são embutidas no build. Depois de criar/alterar as variáveis, é obrigatório **gerar um novo deploy** (Deployments → ⋮ no último deploy → Redeploy, ou dê um push no repositório). Sem isso, o app no Vercel continua sem URL/chave e programas e login não funcionam.

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
  pages/        # Login, Início, Programas, ProgramaNovo, ProgramaEditar, ProgramaDetalhe,
               # ModuloDetalhe, ModuloNovo, ModuloEditar, ModuloForm, Tarefas, Ativos, Ajuda, detalhes
  components/   # Layout, ProtectedRoute, ui.css (componentes base)
  contexts/     # AuthContext, ThemeContext
  lib/          # cliente Supabase
docs/           # Documentação por módulo (MODULO_1.md, MODULO_2.md, MODULO_3.md, …)
supabase/
  migrations/   # Schema (organizações, programas, módulos, tarefas, ativos)
  seed_mock_data.sql
```

## Segurança (multitenant)

Em produção, use apenas a **Anon key** no frontend. RLS (Row Level Security) e controle de acesso por organização estão previstos para um **módulo futuro**; até lá, o schema não aplica RLS nas tabelas.
