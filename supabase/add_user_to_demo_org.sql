-- =============================================================================
-- Adiciona QUALQUER usuário como admin da organização LideraSpace Demo.
-- Use quando entrar com Google (ou outro usuário) e não vir os programas.
--
-- 1. Pegue seu User ID: Supabase Dashboard > Authentication > Users > clique
--    no usuário > copie o UUID (ex: e9a67154-cefd-4730-ab12-4ce6eac14e8d).
-- 2. Substitua SEU_USER_ID_AQUI abaixo pelo UUID (com aspas).
-- 3. Rode no SQL Editor.
-- =============================================================================

INSERT INTO public.organizations (id, nome)
VALUES ('a0000001-0000-4000-8000-000000000001'::uuid, 'LideraSpace Demo')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES (
  'a0000001-0000-4000-8000-000000000001'::uuid,
  'SEU_USER_ID_AQUI'::uuid,
  'lidera_admin'
)
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'lidera_admin';
