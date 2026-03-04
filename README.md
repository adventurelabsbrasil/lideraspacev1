# LideraSpace

Aplicação Vite + React com autenticação Supabase (email/senha e Google), layout com menu lateral e tema claro/escuro.

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

### 2. Login com Google (opcional)

Para usar "Entrar com Google":

1. No Supabase: **Authentication** → **Providers** → **Google** → ative e preencha **Client ID** e **Client Secret** do [Google Cloud Console](https://console.cloud.google.com/).
2. Em **Authentication** → **URL Configuration**, defina **Site URL** (ex.: `http://localhost:5173` para dev) e em **Redirect URLs** adicione `http://localhost:5173/**` (e a URL de produção quando houver).

### 3. Instalação e execução

```bash
npm install
npm run dev
```

Acesse [http://localhost:5173](http://localhost:5173). Use **Login** para entrar com email/senha ou com Google (se configurado).

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção
- `npm run preview` — preview do build
- `npm run lint` — ESLint

## Estrutura

- `src/pages/` — Login e páginas do app (Início, Meus Programas, etc.)
- `src/components/` — Layout, Sidebar, ProtectedRoute
- `src/contexts/` — AuthContext (Supabase), ThemeContext (claro/escuro)
- `src/lib/` — cliente Supabase

## Segurança (multitenant)

Em produção, use apenas a **Anon key** no frontend. Para dados por cliente, configure RLS no Supabase e sempre filtre por `tenant_id` ou `client_id`.
