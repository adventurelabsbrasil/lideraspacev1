# Verificação Supabase ↔ Código — LideraSpace

**Data:** 06/03/2025  
**Projeto:** xiqlaxjtngwecidyoxbs (LideraSpace)

---

## 1. Resumo executivo

| Item | Status | Observação |
|------|--------|------------|
| Tabelas e colunas | ✅ Alinhado | Código usa nomes em inglês compatíveis com o schema |
| RLS e políticas | ✅ OK | Políticas permitem as operações usadas pelo app |
| Storage buckets | ✅ OK | `avatars` e `programas` existem e têm políticas |
| Seeds | ⚠️ Verificar | UUIDs do seed devem corresponder aos usuários no Auth |
| `student_module_states` upsert | ✅ Corrigido | Adicionado `onConflict: 'user_id,module_id'` |

---

## 2. Tabelas e colunas — Código vs Schema

### 2.1 Tabelas usadas pelo app

| Tabela | Uso no código | Colunas usadas | Schema (migrations) |
|--------|---------------|----------------|----------------------|
| `profiles` | Layout, Perfil | `full_name`, `avatar_url` | ✅ `nome_completo` → `full_name` (006/007) |
| `programs` | MeusProgramas, ProgramaDetalhe, ProgramaNovo, ProgramaEditar, Layout | `id`, `title`, `organization_id`, `banner_image_url`, `program_favicon_url`, `creator_favicon_url`, `created_at`, `updated_at`, `created_by` | ✅ Todas existem |
| `modules` | Layout, ModuloForm, ModuloDetalhe, ProgramaDetalhe | `id`, `title`, `sort_order`, `emoji`, `program_id`, `parent_id`, `description`, `blocks`, `topics`, `subtopics`, `video_youtube_embed_url`, `materials`, `banner_image_url`, `program_favicon_url` | ✅ 005 adiciona `parent_id`, `descricao`, `blocos`; 006/007 renomeiam |
| `organization_members` | ProgramaDetalhe, ModuloForm, ModuloDetalhe, ProgramaNovo, ProgramaEditar | `organization_id`, `user_id`, `role`, `organizations(id, nome)` | ✅ `organizations.nome` mantido (não renomeado) |
| `student_module_states` | ModuloDetalhe | `user_id`, `module_id`, `notes`, `checklist` | ✅ 005 cria; 006/007 renomeiam colunas |

### 2.2 Colunas críticas

- **`programs.created_by`**: Usado em `ProgramaNovo.tsx` no INSERT. Schema 001 define a coluna. ✅
- **`modules.parent_id`**: Usado em `ModuloForm` e `ModuloDetalhe`. Migration 005 adiciona. ✅
- **`modules.description`**, **`modules.blocks`**: Usados em `ModuloForm`. 005 adiciona; 006/007 renomeiam. ✅
- **`profiles.full_name`**: Usado em Layout e Perfil. 006/007 renomeiam `nome_completo` → `full_name`. ✅

---

## 3. RLS e políticas de auth

### 3.1 Funções auxiliares (008)

- `user_in_organization(p_organization_id)` — verifica se o usuário é membro da organização
- `user_can_admin_program(p_programa_id)` — verifica se o usuário é `lidera_admin` ou `org_admin` na org do programa

### 3.2 Políticas por tabela

| Tabela | SELECT | INSERT | UPDATE | DELETE | Observação |
|--------|--------|--------|--------|--------|------------|
| `organizations` | Membros | Admins | Admins | Admins | OK |
| `organization_members` | Membros da org | Admins | Admins | Admins | OK |
| `programs` | Membros da org | Admins | Admins | Admins | OK |
| `modules` | Membros (via org do programa) | Admins | Admins | Admins | OK |
| `student_module_states` | Próprio usuário | Próprio | Próprio | Próprio | OK |
| `profiles` | Público | Próprio | Próprio | — | OK |

### 3.3 Fluxos do app

- **Login**: Auth Supabase (Google ou email/senha)
- **Listar programas**: `programs` → política "Members can view programs" (usa `user_in_organization`)
- **Criar programa**: `programs` INSERT → "Admins can manage programs" (usa `user_can_admin_program`)
- **Editar módulo**: `modules` UPDATE → mesma política
- **Perfil**: `profiles` SELECT/UPDATE → políticas públicas e próprias

---

## 4. Storage

| Bucket | Uso | Políticas |
|--------|-----|-----------|
| `avatars` | Perfil (avatar do usuário) | Upload/update/delete: autenticados; SELECT: público |
| `programas` | ProgramaEditar, ModuloForm (banners, favicons) | Upload/update/delete: autenticados; SELECT: público |

---

## 5. Seeds e usuários

### 5.1 `seed_orgs_and_admins.sql`

Cria organizações e vínculos:

- **Adventure Labs**: `contato@adventurelabs.com.br`, `admin@admin.com` → `lidera_admin`
- **Lidera**: `contato@somoslidera.com.br` → `lidera_admin`; `org@admin.com` → `org_admin`
- Admins gerais também na Lidera

### 5.2 Super admin (ver todos os dados)

Para garantir que um usuário veja **todos** os dados (todas as organizações, programas, módulos):

1. Execute a migration `009_super_admin.sql`.
2. No SQL Editor, rode:
   ```sql
   UPDATE public.profiles SET is_super_admin = true WHERE id = 'seu-user-uuid'::uuid;
   ```
   Substitua `seu-user-uuid` pelo ID do usuário em **Authentication > Users**.

### 5.3 Verificação necessária

Os UUIDs no seed precisam corresponder aos usuários em **Authentication > Users**:

- `ee9dcba1-add1-4a6d-9a0b-a675e0997b08` → contato@adventurelabs.com.br
- `e9a67154-cefd-4730-ab12-4ce6eac14e8d` → admin@admin.com
- `3eccb8d3-8067-4184-830c-8fc1b74aab6a` → contato@somoslidera.com.br
- `aa7ef25c-53e7-4a35-9a62-1d53f5e08fd8` → org@admin.com

**Ação:** Se o seed não foi executado ou os UUIDs divergem, rodar o seed no SQL Editor e conferir os IDs no Auth.

---

## 6. Correções aplicadas

### 6.1 `student_module_states` upsert

O upsert em `ModuloDetalhe.tsx` não especificava `onConflict`, o que poderia gerar erro de constraint única ao salvar notas ou checklist.

**Correção:** Adicionado `{ onConflict: 'user_id,module_id' }` nos dois `upsert`:

```ts
await supabase.from('student_module_states').upsert(
  { user_id: user.id, module_id: moduloId, checklist: newChecklist },
  { onConflict: 'user_id,module_id' }
);
```

---

## 7. Checklist de validação manual

1. [ ] Rodar `seed_orgs_and_admins.sql` no SQL Editor (se ainda não rodou)
2. [ ] Conferir UUIDs dos usuários no Auth vs seed
3. [ ] Login com um dos e-mails admin e acessar "Novo programa"
4. [ ] Criar um programa e verificar se aparece em "Meus Programas"
5. [ ] Editar um módulo e salvar (incluindo `description`, `blocks`, `parent_id`)
6. [ ] Abrir um módulo como aluno e salvar notas/checklist
7. [ ] Atualizar perfil (nome e avatar)
8. [ ] Fazer upload de imagem em ProgramaEditar ou ModuloForm (bucket `programas`)

---

## 8. Migrações — ordem e observações

Ordem atual: 001 → 002 → 003 → 004 → 005 → 006 → 007 → 008

- **007** faz `DROP TABLE` de `modules` e `programs` antes de renomear `modulos`/`programas`. Se 006 já tiver rodado (renomeando para `modules`/`programs`), 007 apagaria essas tabelas. O comentário indica que 007 é "idempotent after 006"; na prática, a ordem esperada é que 007 rode **antes** de 006 ou que 006 não tenha sido aplicada antes de 007. Se o schema remoto está correto, a sequência aplicada está coerente.
