-- =============================================================================
-- Adiciona o usuário admin@admin.com como admin da organização LideraSpace Demo.
-- Rode no SQL Editor do Supabase DEPOIS da migration 001.
-- Útil se você criou esse usuário depois do seed ou quer garantir que ele seja admin.
--
-- User ID: e9a67154-cefd-4730-ab12-4ce6eac14e8d
-- Login: admin@admin.com / (sua senha)
-- =============================================================================

-- Organização usada pelo seed (mesmo id para manter consistência)
INSERT INTO public.organizations (id, nome)
VALUES ('a0000001-0000-4000-8000-000000000001'::uuid, 'LideraSpace Demo')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

-- Este usuário como admin da organização
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES (
  'a0000001-0000-4000-8000-000000000001'::uuid,
  'e9a67154-cefd-4730-ab12-4ce6eac14e8d'::uuid,
  'admin'
)
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';
