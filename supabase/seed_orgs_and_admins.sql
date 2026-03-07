-- =============================================================================
-- LideraSpace: Organizações e admins (organograma)
--
-- Organograma:
-- - Adventure Labs (desenvolve o app, acesso completo, dá acesso a clientes)
--   - contato@adventurelabs.com.br = admin geral
--   - admin@admin.com = admin geral
--
-- - Lidera (cliente da Adventure; inclui e edita páginas pelo frontend)
--   - contato@somoslidera.com.br = admin da organização Lidera
--   - org@admin.com = admin da organização
--
-- Rode no SQL Editor do Supabase após ter os usuários em Authentication > Users.
-- =============================================================================

-- 1. Organização Adventure Labs (plataforma / desenvolvedor)
INSERT INTO public.organizations (id, nome)
VALUES ('b0000001-0000-4000-8000-000000000001'::uuid, 'Adventure Labs')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

-- 2. Organização Lidera
INSERT INTO public.organizations (id, nome)
VALUES ('b0000002-0000-4000-8000-000000000002'::uuid, 'Lidera')
ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

-- 3. Admins gerais do app (Adventure Labs) → lidera_admin
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES
  ('b0000001-0000-4000-8000-000000000001'::uuid, 'ee9dcba1-add1-4a6d-9a0b-a675e0997b08'::uuid, 'lidera_admin'),
  ('b0000001-0000-4000-8000-000000000001'::uuid, 'e9a67154-cefd-4730-ab12-4ce6eac14e8d'::uuid, 'lidera_admin')
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'lidera_admin';

-- 4. Admin da organização Lidera → lidera_admin
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES ('b0000002-0000-4000-8000-000000000002'::uuid, '3eccb8d3-8067-4184-830c-8fc1b74aab6a'::uuid, 'lidera_admin')
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'lidera_admin';

-- 5. Admin da organização (Lidera) → org_admin
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES ('b0000002-0000-4000-8000-000000000002'::uuid, 'aa7ef25c-53e7-4a35-9a62-1d53f5e08fd8'::uuid, 'org_admin')
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'org_admin';

-- 6. Admins gerais também na Lidera (acesso completo ao conteúdo do cliente)
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES
  ('b0000002-0000-4000-8000-000000000002'::uuid, 'ee9dcba1-add1-4a6d-9a0b-a675e0997b08'::uuid, 'lidera_admin'),
  ('b0000002-0000-4000-8000-000000000002'::uuid, 'e9a67154-cefd-4730-ab12-4ce6eac14e8d'::uuid, 'lidera_admin')
ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'lidera_admin';

-- -----------------------------------------------------------------------------
-- 7. Super admin (opcional): marque um usuário para ver TODOS os dados.
--    Substitua o UUID pelo id do usuário em Authentication > Users.
--    Exemplo: UPDATE public.profiles SET is_super_admin = true WHERE id = 'seu-uuid-aqui'::uuid;
-- -----------------------------------------------------------------------------
-- UPDATE public.profiles SET is_super_admin = true WHERE id = 'ee9dcba1-add1-4a6d-9a0b-a675e0997b08'::uuid;
