-- =============================================================================
-- LideraSpace: dados mock para visualização
--
-- 1. Tenha a migration 001_schema_... já aplicada.
-- 2. Tenha pelo menos 1 usuário em auth.users (faça login no app ou crie em
--    Authentication > Users no dashboard do Supabase).
-- 3. Cole este script no SQL Editor do Supabase e execute.
--
-- Será criado: 1 organização, você como admin, 3 programas, 3 módulos,
-- 4 tarefas e 4 ativos. Acesse /programas e /programas/:id para ver os dados.
-- =============================================================================

-- Primeiro usuário cadastrado será admin da organização e criador dos programas
DO $$
DECLARE
  v_user_id uuid;
  v_org_id uuid := 'a0000001-0000-4000-8000-000000000001';
  v_prog1_id uuid := 'b0000001-0000-4000-8000-000000000001';
  v_prog2_id uuid := 'b0000001-0000-4000-8000-000000000002';
  v_prog3_id uuid := 'b0000001-0000-4000-8000-000000000003';
  v_mod1_id uuid := 'c0000001-0000-4000-8000-000000000001';
  v_mod2_id uuid := 'c0000001-0000-4000-8000-000000000002';
  v_mod3_id uuid := 'c0000001-0000-4000-8000-000000000003';
  v_tarefa1_id uuid := 'd0000001-0000-4000-8000-000000000001';
  v_tarefa2_id uuid := 'd0000001-0000-4000-8000-000000000002';
  v_tarefa3_id uuid := 'd0000001-0000-4000-8000-000000000003';
  v_tarefa4_id uuid := 'd0000001-0000-4000-8000-000000000004';
  v_ativo1_id uuid := 'e0000001-0000-4000-8000-000000000001';
  v_ativo2_id uuid := 'e0000001-0000-4000-8000-000000000002';
  v_ativo3_id uuid := 'e0000001-0000-4000-8000-000000000003';
  v_ativo4_id uuid := 'e0000001-0000-4000-8000-000000000004';
BEGIN
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário em auth.users. Crie uma conta no app antes de rodar o seed.';
  END IF;

  -- 1. Organização
  INSERT INTO public.organizations (id, nome)
  VALUES (v_org_id, 'LideraSpace Demo')
  ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

  -- 2. Usuário como admin da organização
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, v_user_id, 'admin')
  ON CONFLICT (organization_id, user_id) DO NOTHING;

  -- 3. Programas
  INSERT INTO public.programas (id, organization_id, titulo, created_by, imagem_banner_url, favicon_programa_url, favicon_criador_url)
  VALUES
    (v_prog1_id, v_org_id, 'Liderança em Ação', v_user_id, NULL, NULL, NULL),
    (v_prog2_id, v_org_id, 'Gestão de Equipes', v_user_id, NULL, NULL, NULL),
    (v_prog3_id, v_org_id, 'Comunicação Eficaz', v_user_id, NULL, NULL, NULL)
  ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    updated_at = now();

  -- 4. Módulos (do programa 1 e 2)
  INSERT INTO public.modulos (id, programa_id, ordem, titulo, topicos, subtopicos, video_youtube_embed_url, materiais, imagem_banner_url, favicon_programa_url)
  VALUES
    (v_mod1_id, v_prog1_id, 1, 'Módulo 1 - Introdução',
     '["O que é liderança", "Estilos de liderança"]'::jsonb,
     '["Autoconhecimento", "Feedback"]'::jsonb,
     'https://www.youtube.com/embed/dQw4w9WgXcQ',
     '[{"url": "https://docs.google.com/document/d/1", "label": "Material de apoio", "icon": "docs"}]'::jsonb,
     NULL, NULL),
    (v_mod2_id, v_prog1_id, 2, 'Feedback 360°',
     '["Preparação", "Aplicação"]'::jsonb,
     '["Roda de feedback"]'::jsonb,
     NULL,
     '[]'::jsonb,
     NULL, NULL),
    (v_mod3_id, v_prog2_id, 1, 'Planejamento de reuniões',
     '["Agenda", "Papéis"]'::jsonb,
     '[]'::jsonb,
     NULL,
     '[]'::jsonb,
     NULL, NULL)
  ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    updated_at = now();

  -- 5. Tarefas
  INSERT INTO public.tarefas (id, programa_id, modulo_id, titulo, status, created_by)
  VALUES
    (v_tarefa1_id, v_prog1_id, v_mod1_id, 'Módulo 1 - Introdução', 'concluida', v_user_id),
    (v_tarefa2_id, v_prog1_id, v_mod2_id, 'Feedback 360°', 'em_andamento', v_user_id),
    (v_tarefa3_id, v_prog2_id, v_mod3_id, 'Planejamento de reuniões', 'pendente', v_user_id),
    (v_tarefa4_id, v_prog3_id, NULL, 'Escuta ativa', 'pendente', v_user_id)
  ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, status = EXCLUDED.status, updated_at = now();

  -- 6. Ativos
  INSERT INTO public.ativos (id, programa_id, modulo_id, titulo, link_url, tipo_icone)
  VALUES
    (v_ativo1_id, v_prog1_id, v_mod1_id, 'Material de apoio - Introdução', 'https://docs.google.com/document/d/1', 'docs'),
    (v_ativo2_id, v_prog1_id, v_mod2_id, 'Planilha Feedback', 'https://docs.google.com/spreadsheets/d/1', 'planilha'),
    (v_ativo3_id, v_prog2_id, NULL, 'PDF - Gestão de Equipes', 'https://example.com/gestao.pdf', 'pdf'),
    (v_ativo4_id, v_prog3_id, NULL, 'Vídeo - Comunicação', 'https://www.youtube.com/watch?v=abc', 'video')
  ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, link_url = EXCLUDED.link_url, tipo_icone = EXCLUDED.tipo_icone, updated_at = now();

  RAISE NOTICE 'Seed concluído. Organização: %, 3 programas, 3 módulos, 4 tarefas, 4 ativos.', v_org_id;
END;
$$;
