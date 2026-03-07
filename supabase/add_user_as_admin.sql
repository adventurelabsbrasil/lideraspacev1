-- =============================================================================
-- Adiciona SEU usuário como admin (lidera_admin) nas organizações Adventure Labs e Lidera.
-- Use quando entrar no app e não conseguir criar programas.
--
-- 1. Pegue seu User ID: Supabase Dashboard > Authentication > Users > clique
--    no seu usuário > copie o UUID (ex: a1b2c3d4-e5f6-7890-abcd-ef1234567890)
-- 2. Substitua SEU_USER_ID_AQUI abaixo pelo seu UUID (mantenha as aspas)
-- 3. Rode no SQL Editor do Supabase
-- =============================================================================

-- Garante que as organizações existem
INSERT INTO public.organizations (id, nome)
VALUES
  ('b0000001-0000-4000-8000-000000000001'::uuid, 'Adventure Labs'),
  ('b0000002-0000-4000-8000-000000000002'::uuid, 'Lidera')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

-- Adiciona você como lidera_admin em ambas as organizações
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES
  ('b0000001-0000-4000-8000-000000000001'::uuid, 'SEU_USER_ID_AQUI'::uuid, 'lidera_admin'),
  ('b0000002-0000-4000-8000-000000000002'::uuid, 'SEU_USER_ID_AQUI'::uuid, 'lidera_admin')
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'lidera_admin';
