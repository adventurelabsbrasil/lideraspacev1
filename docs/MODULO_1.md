# Módulo 1 — Autenticação e estrutura base

Escopo do primeiro módulo: app autenticado com layout e navegação.

## Entregas

### Autenticação (Supabase Auth)
- **Login** com email e senha
- **Login social** com Google (opcional, via configuração no Supabase)
- Contexto de autenticação (`AuthContext`) com `user`, `session`, `signIn`, `signOut`
- Rota pública `/login` e rotas protegidas com `ProtectedRoute`

### Layout pós-login
- **Menu lateral** (sidebar) com:
  - Início
  - Meus Programas
  - Minhas Tarefas
  - Meus Ativos
  - Ajuda
- **Toggle tema** claro/escuro (persistido em `localStorage`)
- Exibição do usuário logado e botão **Sair**

### Páginas (estrutura inicial)
- **Início** (`/`) — placeholder
- **Meus Programas** (`/programas`) — placeholder
- **Minhas Tarefas** (`/tarefas`) — placeholder
- **Meus Ativos** (`/ativos`) — placeholder
- **Ajuda** (`/ajuda`) — placeholder

### Stack e configuração
- **Vite** + **React** + **React Router**
- Cliente **Supabase** em `src/lib/supabase.ts`
- Variáveis de ambiente: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Tema via variáveis CSS (`:root` e `[data-theme="dark"]`) em `src/index.css`

## Arquivos principais

| Área           | Arquivos |
|----------------|----------|
| Auth           | `src/contexts/AuthContext.tsx`, `src/pages/Login.tsx`, `src/components/ProtectedRoute.tsx` |
| Layout         | `src/components/Layout.tsx`, `src/components/Layout.css` |
| Tema           | `src/contexts/ThemeContext.tsx`, `src/index.css` |
| Supabase       | `src/lib/supabase.ts` |
| Rotas          | `src/App.tsx`, `src/main.tsx` |

## Como rodar

Ver [README.md](../README.md) — seção Configuração e Scripts.
