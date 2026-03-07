# Relatório crítico — Projeto Supabase LideraSpace

**Projeto:** `xiqlaxjtngwecidyoxbs` (lidera-space)  
**Data:** 06/03/2025  
**Fonte:** Migrações locais, código da aplicação e introspection remota (`supabase gen types typescript --linked`).

---

## 1. Resumo executivo

O banco remoto apresenta **duplicação de entidades** (tabelas em português e inglês), **falta de RLS (Row Level Security)** na maior parte das tabelas de negócio, **histórico de migrações dessincronizado** e **tabelas/colunas órfãs** de outro template. Isso gera risco de segurança, confusão de modelo de dados e possíveis gargalos de manutenção. As correções sugeridas estão ordenadas por prioridade ao final.

---

## 2. Estado atual do schema (remoto)

### 2.1 Tabelas existentes no `public`

| Tabela | Origem provável | Uso no app LideraSpace |
|--------|------------------|-------------------------|
| `organizations` | Migração 001 | ✅ Sim |
| `organization_members` | Migração 001/004 | ✅ Sim |
| `profiles` | Migração 004 | ✅ Sim |
| `programas` | Migração 001 | ✅ Sim (app usa esta) |
| `modulos` | Migração 001–005 | ✅ Sim (app usa esta) |
| `tarefas` / `tasks` | Migração 001 + 006 | ⚠️ Renomeada para `tasks`, FKs ainda referem `programas`/`modulos` |
| `ativos` / `assets` | Migração 001 + 006 | ⚠️ Tabela `assets`, FKs com nomes `ativos_*` |
| `aluno_modulo_state` / `student_module_states` | Migração 005 + 006 | ✅ App usa `aluno_modulo_state` |
| `programs` | Outro template | ❌ Não usada (schema diferente: title, description) |
| `modules` | Outro template | ❌ Não usada (campos mínimos) |
| `lessons` | Outro template | ❌ Não usada |
| `notes` | Outro template | ❌ Não usada |
| `progress` | Outro template | ❌ Não usada |
| `users` | Outro template | ❌ Não usada (diferente de `auth.users`) |

Conclusão: há **duplicação** (programas/programs, modulos/modules) e **tabelas órfãs** (lessons, notes, progress, users) que não fazem parte do fluxo LideraSpace e poluem o schema.

### 2.2 Funções RPC existentes

- `user_can_admin_program(p_programa_id uuid)` → boolean  
- `user_in_organization(p_organization_id uuid)` → boolean  

Nenhuma delas é usada no código atual; a aplicação faz checagem de papel apenas no cliente (consultando `organization_members` e comparando `role === 'lidera_admin'`). Ou seja, as funções poderiam ser usadas para centralizar e endurecer a autorização no backend.

---

## 3. Gargalos e problemas críticos

### 3.1 Segurança — RLS ausente nas tabelas de negócio

**Problema:** Row Level Security está habilitado apenas em:

- `profiles` (leitura pública; insert/update apenas do próprio usuário)
- `aluno_modulo_state` (acesso apenas ao próprio usuário)
- `storage.objects` (buckets avatars e programas)

As tabelas **organizations**, **organization_members**, **programas**, **modulos**, **tarefas**/ **tasks**, **ativos**/ **assets** **não têm RLS**. Com a chave `anon` (ou `authenticated`), qualquer usuário autenticado pode, em tese:

- Ler e alterar todas as organizações e membros.
- Ler, inserir, atualizar e apagar todos os programas e módulos.
- Idem para tarefas e ativos.

Isso é um **gargalo de segurança crítico**: o controle de acesso depende só do front-end.

**Correção recomendada:**

1. Habilitar RLS em todas as tabelas de negócio:
   - `organizations`
   - `organization_members`
   - `programas`
   - `modulos`
   - `tarefas` (ou `tasks`, conforme nome efetivo)
   - `ativos` (ou `assets`)

2. Definir políticas que:
   - Leitura: usuário só vê dados de organizações em que é membro (`organization_members`).
   - Escrita (insert/update/delete): restringir a papéis como `lidera_admin` ou `org_admin`, usando as funções `user_in_organization` e `user_can_admin_program` (ou equivalentes por programa/org).

3. Reutilizar as RPCs no backend (em políticas ou em APIs) em vez de confiar só em checagens no cliente.

---

### 3.2 Duplicação de tabelas e naming inconsistente

**Problema:** No remoto coexistem:

- `programas` (usada pelo app) e `programs` (outro schema).
- `modulos` (usada pelo app) e `modules` (outro schema).

Além disso, a migração `006_standardize_naming_to_english.sql` renomeia tabelas/colunas para inglês, mas:

- O app continua a usar **sempre** nomes em português: `programas`, `modulos`, `titulo`, `programa_id`, `ordem`, `aluno_modulo_state`, `anotacoes`, `checklist`, etc.
- No banco, parte das FKs ainda referencia `programas`/`modulos` (ex.: em `tasks`, `assets`), e existem tabelas já “em inglês” (`programs`, `modules`) com estrutura diferente.

Isso gera:

- Risco de aplicar 006 em ambiente onde o app não foi atualizado e quebrar a aplicação.
- Dúvida sobre qual tabela é a “fonte da verdade” (programas vs programs).

**Correção recomendada:**

1. Definir uma única convenção: **ou** tudo em português (alinhado ao app atual), **ou** tudo em inglês (exigindo migração de código + migração de dados).
2. Se manter português: não aplicar a migração 006 nas tabelas usadas pelo LideraSpace; considerar remover ou marcar como opcional a 006 até o app ser refatorado.
3. Remover tabelas órfãs (`programs`, `modules`, `lessons`, `notes`, `progress`, `users`) se confirmado que não são usadas por nenhum serviço (backup antes).

---

### 3.3 Histórico de migrações dessincronizado

**Problema:** Ao rodar `supabase db remote commit` (ou equivalente), o CLI informa que o histórico de migrações do banco remoto não bate com os arquivos locais em `supabase/migrations/` e sugere algo como:

```text
supabase migration repair --status applied 001
...
supabase migration repair --status applied 006
```

Isso indica que migrações foram aplicadas manualmente ou em ordem diferente no remoto, ou que há migrações locais que nunca foram aplicadas no projeto `xiqlaxjtngwecidyoxbs`.

**Correção recomendada:**

1. Listar no Supabase Dashboard (ou via CLI) quais migrações constam como aplicadas no remoto.
2. Comparar com a pasta `supabase/migrations/` (001 a 006).
3. Ajustar o histórico com `supabase migration repair` para refletir o estado real do banco (evitando rodar de novo migrações já aplicadas).
4. A partir daí, passar a aplicar todas as mudanças somente via novas migrações e CLI, para manter histórico alinhado.

---

### 3.4 Storage — políticas muito amplas

**Problema:** No bucket `programas`, qualquer usuário **autenticado** pode fazer insert/update/delete em qualquer objeto. Não há restrição por `organization_id` ou `program_id` no path, como comentado na migração 002.

**Correção recomendada:**

1. Adotar uma estrutura de path que inclua org ou programa (ex.: `programas/{organization_id}/{program_id}/...`).
2. Criar políticas de storage que:
   - Permitam escrita apenas se o usuário for admin da organização (ou tenha papel equivalente), usando `storage.foldername()` ou metadados e funções como `user_in_organization` / `user_can_admin_program`.

---

### 3.5 Índices e performance

**Situação:** As migrações já criam índices em:

- `organization_members(organization_id)`, `organization_members(user_id)`
- `programas(organization_id)`, `programas(created_by)`
- `modulos(programa_id)` (e `parent_id` na 005)
- `tarefas(programa_id)`, `tarefas(modulo_id)`, `tarefas(status)`
- `ativos(programa_id)`, `ativos(modulo_id)`

O **db-stats** remoto (inspect db) mostrou tamanho pequeno (ordem de 11 MB de DB, 392 KB de índices) e cache hit rate alto (index ~0.97, table ~1.00). Ou seja, por volume atual não há indício de gargalo de desempenho; o principal risco é **segurança e consistência do modelo**, não tamanho dos índices.

Recomendação: ao adicionar RLS e políticas, garantir que as condições das políticas usem colunas indexadas (ex.: `organization_id`, `user_id`) para não degradar performance quando o volume crescer.

---

### 3.6 Papéis (roles) em `organization_members`

**Situação:** A migração 004 define os papéis `lidera_admin`, `org_admin` e `aluno`. O app usa apenas `lidera_admin` para decidir se o usuário é “admin” (ex.: ProgramaDetalhe, ModuloDetalhe, ProgramaEditar). Não há uso explícito de `org_admin` no código encontrado.

**Recomendação:** Documentar a diferença entre `lidera_admin` e `org_admin` e usar `org_admin` onde fizer sentido (ex.: admin da organização mas não da plataforma), para que as políticas RLS e a UI reflitam o mesmo modelo de permissões.

---

## 4. Uso da aplicação no banco (referência)

A aplicação utiliza:

- **Auth:** `auth.users` (Supabase Auth).
- **Tabelas:** `profiles`, `organizations`, `organization_members`, `programas`, `modulos`, `aluno_modulo_state`.
- **Colunas em português:** `titulo`, `programa_id`, `ordem`, `emoji`, `descricao`, `blocos`, `topicos`, `subtopicos`, `materiais`, `imagem_banner_url`, `favicon_programa_url`, `anotacoes`, `checklist`, etc.
- **Storage:** buckets `avatars` e `programas`.
- **Tarefas/ativos:** não foi verificado uso direto no front-end nas amostras; se houver, provavelmente via `tarefas`/`tasks` e `ativos`/`assets` (nome efetivo a confirmar no remoto).

As funções `user_can_admin_program` e `user_in_organization` **não** são chamadas no código; a autorização é feita no cliente.

---

## 5. Plano de ação sugerido (prioridade)

| Prioridade | Ação | Impacto |
|------------|------|--------|
| P0 | Habilitar RLS em `organizations`, `organization_members`, `programas`, `modulos`, `tarefas`, `ativos` e criar políticas baseadas em “usuário membro da org” e “admin do programa/org”. | Reduz risco de acesso indevido a dados. |
| P0 | Revisar políticas de Storage do bucket `programas` (restrição por org/programa e papel). | Evita que qualquer autenticado altere arquivos de qualquer programa. |
| P1 | Alinhar histórico de migrações (repair) e garantir que apenas migrações versionadas alterem o remoto. | Evita drift e aplicação duplicada ou faltante de migrações. |
| P1 | Decidir convenção de nomes (PT vs EN); se manter PT, não aplicar 006 nas tabelas LideraSpace ou reverter renomeações já aplicadas no remoto. | Consistência entre app e banco. |
| P2 | Remover ou deprecar tabelas órfãs: `programs`, `modules`, `lessons`, `notes`, `progress`, `users` (com backup). | Schema mais limpo e sem confusão. |
| P2 | Usar `user_can_admin_program` e `user_in_organization` em políticas RLS ou em Edge Functions/API. | Autorização centralizada e mais segura. |
| P3 | Documentar e usar o papel `org_admin` na aplicação e nas políticas. | Modelo de permissões completo. |

---

## 6. Comandos úteis (Supabase CLI)

- Linkar projeto:  
  `supabase link --project-ref xiqlaxjtngwecidyoxbs`

- Gerar tipos a partir do remoto:  
  `supabase gen types typescript --linked`

- Ver estado do DB (ex.: tamanho, cache):  
  `supabase inspect db db-stats --linked`

- Reparar histórico de migrações (exemplo):  
  `supabase migration repair --status applied 001`  
  (repetir para 002… 006 conforme o estado real do banco)

- Aplicar novas migrações após alinhar histórico:  
  `supabase db push`

---

## Apêndice A — Exemplo de políticas RLS (rascunho)

As funções `user_in_organization(p_organization_id uuid)` e `user_can_admin_program(p_programa_id uuid)` devem existir e retornar true quando o usuário atual (`auth.uid()`) for membro da organização ou admin do programa. Exemplo de uso em políticas:

```sql
-- Exemplo: organizações — só membros veem a organização
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organizations.id AND om.user_id = auth.uid()
    )
  );

-- Exemplo: programas — leitura para membros da org; escrita para admins
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view programs of their org"
  ON public.programas FOR SELECT
  USING (public.user_in_organization(organization_id));

CREATE POLICY "Admins can manage programs"
  ON public.programas FOR ALL
  USING (public.user_can_admin_program(id))
  WITH CHECK (public.user_can_admin_program(id));
```

Repita a lógica para `modulos` (via `program_id` → programa → organization), `organization_members`, `tarefas` e `ativos`. Ajuste INSERT/UPDATE/DELETE conforme os papéis (ex.: apenas `lidera_admin` ou `org_admin` podem criar/editar).

---

## 7. Conclusão

Os principais gargalos do projeto Supabase **xiqlaxjtngwecidyoxbs** são:

1. **Segurança:** falta de RLS nas tabelas de negócio e políticas de storage muito amplas.  
2. **Consistência:** duplicação de tabelas (programas/programs, modulos/modules), naming misto PT/EN e tabelas órfãs.  
3. **Operação:** histórico de migrações dessincronizado entre local e remoto.

A correção deve começar por RLS e políticas de storage (P0), em seguida alinhar migrações e convenção de nomes (P1), e depois limpar schema e aproveitar as RPCs de autorização (P2–P3).
