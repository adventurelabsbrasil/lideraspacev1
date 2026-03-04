-- =============================================================================
-- DIAGNÓSTICO: conteúdo das tabelas do LideraSpace
--
-- Passo 1: Rode só o primeiro SELECT (resumo). Envie o resultado.
-- Passo 2: Rode o segundo SELECT trocando o UUID pelo seu user_id (admin@admin.com).
--          Envie o resultado para checar se você está na org e se há programas.
--
-- (Se rodar vários SELECTs de uma vez, o Editor mostra só o último.)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Resumo: quantidade de linhas por tabela (rode primeiro e envie o resultado)
-- -----------------------------------------------------------------------------
SELECT 'organizations'       AS tabela, COUNT(*) AS total FROM public.organizations
UNION ALL
SELECT 'organization_members', COUNT(*)         FROM public.organization_members
UNION ALL
SELECT 'programas',            COUNT(*)         FROM public.programas
UNION ALL
SELECT 'modulos',              COUNT(*)         FROM public.modulos
UNION ALL
SELECT 'tarefas',              COUNT(*)         FROM public.tarefas
UNION ALL
SELECT 'ativos',               COUNT(*)         FROM public.ativos
ORDER BY tabela;

-- -----------------------------------------------------------------------------
-- 2) Checagem de vínculo: você na org e programas dessa org
--    Troque o UUID abaixo pelo seu user_id (ex: e9a67154-cefd-4730-ab12-4ce6eac14e8d)
--    Rode e envie o resultado.
-- -----------------------------------------------------------------------------
SELECT
  om.user_id,
  om.role,
  o.id AS org_id,
  o.nome AS org_nome,
  (SELECT COUNT(*) FROM public.programas p WHERE p.organization_id = om.organization_id) AS programas_na_org
FROM public.organization_members om
JOIN public.organizations o ON o.id = om.organization_id
WHERE om.user_id = 'e9a67154-cefd-4730-ab12-4ce6eac14e8d'::uuid;

-- -----------------------------------------------------------------------------
-- (Opcional) Conteúdo completo de cada tabela – rode um por vez e envie se precisar
-- -----------------------------------------------------------------------------
-- SELECT * FROM public.organizations ORDER BY created_at;
-- SELECT id, organization_id, user_id, role FROM public.organization_members ORDER BY organization_id, role;
-- SELECT id, organization_id, titulo, created_by FROM public.programas ORDER BY updated_at DESC;
-- SELECT id, programa_id, ordem, titulo FROM public.modulos ORDER BY programa_id, ordem;
-- SELECT id, programa_id, titulo, status FROM public.tarefas ORDER BY programa_id;
-- SELECT id, programa_id, titulo, tipo_icone FROM public.ativos ORDER BY programa_id;
