-- =============================================================================
-- LideraSpace: seed DEMO completo — organização, admin, programas, módulos, tarefas, ativos
--
-- Pré-requisitos:
-- 1. Migrations 001, 002, 003 já aplicadas (tabelas existem).
-- 2. Pelo menos um usuário em auth.users (crie em Authentication > Users ou
--    faça signup no app). Para ser admin, use o primeiro usuário OU crie
--    admin@admin.com no Dashboard e este script dará role admin a ele.
--
-- Se der erro "relation public.organizations does not exist", use em vez deste
-- o arquivo seed_demo_full.sql (cria schema + seed em um único script).
--
-- Uso: copie e execute no SQL Editor do Supabase (Dashboard) ou rode via CLI.
-- =============================================================================

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
  v_mod4_id uuid := 'c0000001-0000-4000-8000-000000000004';
  v_mod5_id uuid := 'c0000001-0000-4000-8000-000000000005';
  v_mod6_id uuid := 'c0000001-0000-4000-8000-000000000006';
  v_mod7_id uuid := 'c0000001-0000-4000-8000-000000000007';
  v_mod8_id uuid := 'c0000001-0000-4000-8000-000000000008';
  v_mod9_id uuid := 'c0000001-0000-4000-8000-000000000009';
  v_tarefa_ids uuid[] := ARRAY[
    'd0000001-0000-4000-8000-000000000001'::uuid, 'd0000001-0000-4000-8000-000000000002'::uuid,
    'd0000001-0000-4000-8000-000000000003'::uuid, 'd0000001-0000-4000-8000-000000000004'::uuid,
    'd0000001-0000-4000-8000-000000000005'::uuid, 'd0000001-0000-4000-8000-000000000006'::uuid,
    'd0000001-0000-4000-8000-000000000007'::uuid, 'd0000001-0000-4000-8000-000000000008'::uuid,
    'd0000001-0000-4000-8000-000000000009'::uuid, 'd0000001-0000-4000-8000-00000000000a'::uuid
  ];
  v_ativo_ids uuid[] := ARRAY[
    'e0000001-0000-4000-8000-000000000001'::uuid, 'e0000001-0000-4000-8000-000000000002'::uuid,
    'e0000001-0000-4000-8000-000000000003'::uuid, 'e0000001-0000-4000-8000-000000000004'::uuid,
    'e0000001-0000-4000-8000-000000000005'::uuid, 'e0000001-0000-4000-8000-000000000006'::uuid,
    'e0000001-0000-4000-8000-000000000007'::uuid, 'e0000001-0000-4000-8000-000000000008'::uuid,
    'e0000001-0000-4000-8000-000000000009'::uuid, 'e0000001-0000-4000-8000-00000000000a'::uuid
  ];
BEGIN
  -- Admin: preferir usuário com email admin@admin.com, senão o primeiro usuário
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@admin.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  END IF;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário em auth.users. Crie um usuário em Authentication > Users (ex: admin@admin.com) ou faça signup no app.';
  END IF;

  -- 1. Organização
  INSERT INTO public.organizations (id, nome)
  VALUES (v_org_id, 'LideraSpace Demo')
  ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

  -- 2. Usuário como ADMIN da organização
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, v_user_id, 'lidera_admin')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'lidera_admin';

  -- 3. Programas (com banners e favicons)
  INSERT INTO public.programs (id, organization_id, title, created_by, banner_image_url, program_favicon_url, creator_favicon_url)
  VALUES
    (v_prog1_id, v_org_id, 'Liderança em Ação', v_user_id,
     'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=128&h=128&fit=crop',
     'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop'),
    (v_prog2_id, v_org_id, 'Gestão de Equipes', v_user_id,
     'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80',
     'https://images.unsplash.com/photo-1552664730-d307ca884978?w=128&h=128&fit=crop',
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop'),
    (v_prog3_id, v_org_id, 'Comunicação Eficaz', v_user_id,
     'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
     'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop',
     'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop')
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    banner_image_url = EXCLUDED.banner_image_url,
    program_favicon_url = EXCLUDED.program_favicon_url,
    creator_favicon_url = EXCLUDED.creator_favicon_url,
    updated_at = now();

  -- 4. Módulos (todos os 9, com emoji, topics, materials, banners)
  INSERT INTO public.modules (id, program_id, sort_order, title, emoji, topics, subtopics, video_youtube_embed_url, materials, banner_image_url, program_favicon_url, content)
  VALUES
    (v_mod1_id, v_prog1_id, 1, 'Introdução à Liderança', '📖',
     '["O que é liderança", "Estilos de liderança"]'::jsonb,
     '["Autoconhecimento", "Feedback"]'::jsonb,
     'https://www.youtube.com/embed/dQw4w9WgXcQ',
     '[{"url": "https://docs.google.com/document/d/1", "label": "Material de apoio", "icon": "docs"}, {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "label": "Vídeo complementar", "icon": "video"}]'::jsonb,
     'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop',
     NULL),
    (v_mod2_id, v_prog1_id, 2, 'Feedback 360°', '🔄',
     '["Preparação", "Aplicação"]'::jsonb,
     '["Roda de feedback"]'::jsonb,
     'https://www.youtube.com/embed/jj2nVM6b9-w',
     '[{"url": "https://docs.google.com/spreadsheets/d/1", "label": "Planilha Feedback 360", "icon": "planilha"}]'::jsonb,
     'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop',
     NULL),
    (v_mod3_id, v_prog2_id, 1, 'Planejamento de reuniões', '📅',
     '["Agenda", "Papéis"]'::jsonb,
     '[]'::jsonb,
     NULL,
     '[{"url": "https://example.com/agenda-reunioes.pdf", "label": "Modelo de agenda", "icon": "pdf"}]'::jsonb,
     'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80',
     'https://images.unsplash.com/photo-1552664730-d307ca884978?w=64&h=64&fit=crop',
     NULL),
    (v_mod4_id, v_prog1_id, 3, 'Delegação e empowerment', '🎯',
     '["O que delegar", "Como dar autonomia", "Acompanhamento"]'::jsonb,
     '["Matriz de delegação", "Check-in semanal"]'::jsonb,
     'https://www.youtube.com/embed/jj2nVM6b9-w',
     '[{"url": "https://docs.google.com/presentation/d/1", "label": "Slides do módulo", "icon": "docs"}]'::jsonb,
     'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop',
     NULL),
    (v_mod5_id, v_prog1_id, 4, 'Liderança situacional', '🧭',
     '["Estilos de liderança", "Adaptação ao contexto"]'::jsonb,
     '["Diagnóstico de maturidade", "Prática em casos"]'::jsonb,
     NULL,
     '[]'::jsonb,
     'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop',
     NULL),
    (v_mod6_id, v_prog2_id, 2, 'Dinâmicas de grupo', '👥',
     '["Icebreakers", "Atividades de confiança", "Retrospectivas"]'::jsonb,
     '["Facilitação", "Tempo e formato"]'::jsonb,
     NULL,
     '[{"url": "https://example.com/dinamicas.pdf", "label": "Catálogo de dinâmicas", "icon": "pdf"}]'::jsonb,
     'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
     'https://images.unsplash.com/photo-1552664730-d307ca884978?w=64&h=64&fit=crop',
     NULL),
    (v_mod7_id, v_prog2_id, 3, 'Conflitos e mediação', '🤝',
     '["Tipos de conflito", "Escuta ativa", "Acordos"]'::jsonb,
     '["Role-play", "Casos reais"]'::jsonb,
     'https://www.youtube.com/embed/jj2nVM6b9-w',
     '[]'::jsonb,
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
     'https://images.unsplash.com/photo-1552664730-d307ca884978?w=64&h=64&fit=crop',
     NULL),
    (v_mod8_id, v_prog3_id, 1, 'Escuta ativa e perguntas poderosas', '👂',
     '["Níveis de escuta", "Tipos de perguntas", "Silêncio produtivo"]'::jsonb,
     '["Exercícios em dupla", "Gravação e análise"]'::jsonb,
     NULL,
     '[{"url": "https://docs.google.com/document/d/1", "label": "Roteiro de prática", "icon": "docs"}]'::jsonb,
     'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
     'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop',
     NULL),
    (v_mod9_id, v_prog3_id, 2, 'Apresentações e storytelling', '🎤',
     '["Estrutura de história", "Voz e corpo", "Slides que apoiam"]'::jsonb,
     '["Pitch de 1 min", "Apresentação 5 min"]'::jsonb,
     'https://www.youtube.com/embed/jj2nVM6b9-w',
     '[]'::jsonb,
     'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
     'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop',
     NULL)
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    emoji = COALESCE(EXCLUDED.emoji, modules.emoji),
    topics = EXCLUDED.topics,
    subtopics = EXCLUDED.subtopics,
    video_youtube_embed_url = EXCLUDED.video_youtube_embed_url,
    materials = EXCLUDED.materials,
    banner_image_url = EXCLUDED.banner_image_url,
    program_favicon_url = EXCLUDED.program_favicon_url,
    sort_order = EXCLUDED.sort_order,
    updated_at = now();

  -- 5. Tarefas (10 tarefas, variados status)
  INSERT INTO public.tasks (id, program_id, module_id, title, status, created_by)
  VALUES
    (v_tarefa_ids[1], v_prog1_id, v_mod1_id, 'Introdução à Liderança', 'concluida', v_user_id),
    (v_tarefa_ids[2], v_prog1_id, v_mod2_id, 'Feedback 360°', 'em_andamento', v_user_id),
    (v_tarefa_ids[3], v_prog2_id, v_mod3_id, 'Planejamento de reuniões', 'pendente', v_user_id),
    (v_tarefa_ids[4], v_prog3_id, NULL, 'Escuta ativa', 'pendente', v_user_id),
    (v_tarefa_ids[5], v_prog1_id, v_mod4_id, 'Delegação e empowerment', 'pendente', v_user_id),
    (v_tarefa_ids[6], v_prog1_id, v_mod5_id, 'Liderança situacional', 'pendente', v_user_id),
    (v_tarefa_ids[7], v_prog2_id, v_mod6_id, 'Dinâmicas de grupo', 'em_andamento', v_user_id),
    (v_tarefa_ids[8], v_prog2_id, v_mod7_id, 'Conflitos e mediação', 'pendente', v_user_id),
    (v_tarefa_ids[9], v_prog3_id, v_mod8_id, 'Escuta ativa e perguntas poderosas', 'pendente', v_user_id),
    (v_tarefa_ids[10], v_prog3_id, v_mod9_id, 'Apresentações e storytelling', 'pendente', v_user_id)
  ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, status = EXCLUDED.status, module_id = EXCLUDED.module_id, updated_at = now();

  -- 6. Ativos (10 ativos)
  INSERT INTO public.assets (id, program_id, module_id, title, link_url, icon_type)
  VALUES
    (v_ativo_ids[1], v_prog1_id, v_mod1_id, 'Material de apoio - Introdução', 'https://docs.google.com/document/d/1', 'docs'),
    (v_ativo_ids[2], v_prog1_id, v_mod2_id, 'Planilha Feedback', 'https://docs.google.com/spreadsheets/d/1', 'planilha'),
    (v_ativo_ids[3], v_prog2_id, NULL, 'PDF - Gestão de Equipes', 'https://example.com/gestao.pdf', 'pdf'),
    (v_ativo_ids[4], v_prog3_id, NULL, 'Vídeo - Comunicação', 'https://www.youtube.com/watch?v=abc', 'video'),
    (v_ativo_ids[5], v_prog1_id, v_mod4_id, 'Slides - Delegação', 'https://docs.google.com/presentation/d/1', 'docs'),
    (v_ativo_ids[6], v_prog1_id, v_mod5_id, 'Quiz - Estilo de liderança', 'https://docs.google.com/forms/d/1', 'link'),
    (v_ativo_ids[7], v_prog2_id, v_mod6_id, 'Catálogo de dinâmicas (PDF)', 'https://example.com/dinamicas.pdf', 'pdf'),
    (v_ativo_ids[8], v_prog2_id, v_mod7_id, 'Roteiro de mediação', 'https://docs.google.com/document/d/1', 'docs'),
    (v_ativo_ids[9], v_prog3_id, v_mod8_id, 'Roteiro de prática - Escuta', 'https://docs.google.com/document/d/1', 'docs'),
    (v_ativo_ids[10], v_prog3_id, v_mod9_id, 'Vídeo - Storytelling', 'https://www.youtube.com/watch?v=jj2nVM6b9-w', 'video')
  ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, link_url = EXCLUDED.link_url, icon_type = EXCLUDED.icon_type, updated_at = now();

  RAISE NOTICE 'Seed DEMO concluído. Usuário admin: % (role admin). Organização: %. 3 programas, 9 módulos, 10 tarefas, 10 ativos.', v_user_id, v_org_id;
END;
$$;
