-- =============================================================================
-- LideraSpace: dados extras (módulos, tarefas, ativos) + banners/URLs nos programas
-- Rode DEPOIS do seed_mock_data.sql. Usa os mesmos IDs de programas (b0000001-...).
-- Imagens: Unsplash (uso livre). Troque depois por URLs do seu storage.
-- =============================================================================

DO $$
DECLARE
  v_user_id uuid;
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
  v_t5 uuid := 'd0000001-0000-4000-8000-000000000005';
  v_t6 uuid := 'd0000001-0000-4000-8000-000000000006';
  v_t7 uuid := 'd0000001-0000-4000-8000-000000000007';
  v_t8 uuid := 'd0000001-0000-4000-8000-000000000008';
  v_t9 uuid := 'd0000001-0000-4000-8000-000000000009';
  v_t10 uuid := 'd0000001-0000-4000-8000-00000000000a';
  v_a5 uuid := 'e0000001-0000-4000-8000-000000000005';
  v_a6 uuid := 'e0000001-0000-4000-8000-000000000006';
  v_a7 uuid := 'e0000001-0000-4000-8000-000000000007';
  v_a8 uuid := 'e0000001-0000-4000-8000-000000000008';
  v_a9 uuid := 'e0000001-0000-4000-8000-000000000009';
  v_a10 uuid := 'e0000001-0000-4000-8000-00000000000a';
BEGIN
  SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;

  -- 1. Atualizar programas com banners e favicons (URLs reais de imagem)
  UPDATE public.programas SET
    imagem_banner_url = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80',
    favicon_programa_url = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=128&h=128&fit=crop',
    favicon_criador_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=128&h=128&fit=crop'
  WHERE id = v_prog1_id;

  UPDATE public.programas SET
    imagem_banner_url = 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80',
    favicon_programa_url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=128&h=128&fit=crop',
    favicon_criador_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop'
  WHERE id = v_prog2_id;

  UPDATE public.programas SET
    imagem_banner_url = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&q=80',
    favicon_programa_url = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=128&h=128&fit=crop',
    favicon_criador_url = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop'
  WHERE id = v_prog3_id;

  -- 2. Atualizar módulos existentes com banners e materiais
  UPDATE public.modulos SET
    imagem_banner_url = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&q=80',
    favicon_programa_url = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop',
    materiais = '[
      {"url": "https://docs.google.com/document/d/1", "label": "Material de apoio", "icon": "docs"},
      {"url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "label": "Vídeo complementar", "icon": "video"}
    ]'::jsonb
  WHERE id = v_mod1_id;

  UPDATE public.modulos SET
    imagem_banner_url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    favicon_programa_url = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop',
    video_youtube_embed_url = 'https://www.youtube.com/embed/jj2nVM6b9-w',
    materiais = '[{"url": "https://docs.google.com/spreadsheets/d/1", "label": "Planilha Feedback 360", "icon": "planilha"}]'::jsonb
  WHERE id = v_mod2_id;

  UPDATE public.modulos SET
    imagem_banner_url = 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80',
    favicon_programa_url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=64&h=64&fit=crop',
    materiais = '[{"url": "https://example.com/agenda-reunioes.pdf", "label": "Modelo de agenda", "icon": "pdf"}]'::jsonb
  WHERE id = v_mod3_id;

  -- 3. Novos módulos (Liderança em Ação - programa 1)
  INSERT INTO public.modulos (id, programa_id, ordem, titulo, topicos, subtopicos, video_youtube_embed_url, materiais, imagem_banner_url, favicon_programa_url)
  VALUES
    (v_mod4_id, v_prog1_id, 3, 'Delegação e empowerment',
     '["O que delegar", "Como dar autonomia", "Acompanhamento"]'::jsonb,
     '["Matriz de delegação", "Check-in semanal"]'::jsonb,
     'https://www.youtube.com/embed/jj2nVM6b9-w',
     '[{"url": "https://docs.google.com/presentation/d/1", "label": "Slides do módulo", "icon": "docs"}]'::jsonb,
     'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&q=80',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop'),
    (v_mod5_id, v_prog1_id, 4, 'Liderança situacional',
     '["Estilos de liderança", "Adaptação ao contexto"]'::jsonb,
     '["Diagnóstico de maturidade", "Prática em casos"]'::jsonb,
     NULL,
     '[]'::jsonb,
     'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
     'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop')
  ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, updated_at = now();

  -- 4. Novos módulos (Gestão de Equipes - programa 2)
  INSERT INTO public.modulos (id, programa_id, ordem, titulo, topicos, subtopicos, video_youtube_embed_url, materiais, imagem_banner_url, favicon_programa_url)
  VALUES
    (v_mod6_id, v_prog2_id, 2, 'Dinâmicas de grupo',
     '["Icebreakers", "Atividades de confiança", "Retrospectivas"]'::jsonb,
     '["Facilitação", "Tempo e formato"]'::jsonb,
     NULL,
     '[{"url": "https://example.com/dinamicas.pdf", "label": "Catálogo de dinâmicas", "icon": "pdf"}]'::jsonb,
     'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
     'https://images.unsplash.com/photo-1552664730-d307ca884978?w=64&h=64&fit=crop'),
    (v_mod7_id, v_prog2_id, 3, 'Conflitos e mediação',
     '["Tipos de conflito", "Escuta ativa", "Acordos"]'::jsonb,
     '["Role-play", "Casos reais"]'::jsonb,
     'https://www.youtube.com/embed/jj2nVM6b9-w',
     '[]'::jsonb,
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
     'https://images.unsplash.com/photo-1552664730-d307ca884978?w=64&h=64&fit=crop')
  ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, updated_at = now();

  -- 5. Novos módulos (Comunicação Eficaz - programa 3)
  INSERT INTO public.modulos (id, programa_id, ordem, titulo, topicos, subtopicos, video_youtube_embed_url, materiais, imagem_banner_url, favicon_programa_url)
  VALUES
    (v_mod8_id, v_prog3_id, 1, 'Escuta ativa e perguntas poderosas',
     '["Níveis de escuta", "Tipos de perguntas", "Silêncio produtivo"]'::jsonb,
     '["Exercícios em dupla", "Gravação e análise"]'::jsonb,
     NULL,
     '[{"url": "https://docs.google.com/document/d/1", "label": "Roteiro de prática", "icon": "docs"}]'::jsonb,
     'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
     'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop'),
    (v_mod9_id, v_prog3_id, 2, 'Apresentações e storytelling',
     '["Estrutura de história", "Voz e corpo", "Slides que apoiam"]'::jsonb,
     '["Pitch de 1 min", "Apresentação 5 min"]'::jsonb,
     'https://www.youtube.com/embed/jj2nVM6b9-w',
     '[]'::jsonb,
     'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
     'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=64&h=64&fit=crop')
  ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, updated_at = now();

  -- 6. Novas tarefas (vinculadas aos novos módulos)
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.tarefas (id, programa_id, modulo_id, titulo, status, created_by)
    VALUES
      (v_t5, v_prog1_id, v_mod4_id, 'Delegação e empowerment', 'pendente', v_user_id),
      (v_t6, v_prog1_id, v_mod5_id, 'Liderança situacional', 'pendente', v_user_id),
      (v_t7, v_prog2_id, v_mod6_id, 'Dinâmicas de grupo', 'em_andamento', v_user_id),
      (v_t8, v_prog2_id, v_mod7_id, 'Conflitos e mediação', 'pendente', v_user_id),
      (v_t9, v_prog3_id, v_mod8_id, 'Escuta ativa e perguntas poderosas', 'pendente', v_user_id),
      (v_t10, v_prog3_id, v_mod9_id, 'Apresentações e storytelling', 'pendente', v_user_id)
    ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, status = EXCLUDED.status, updated_at = now();
  END IF;

  -- 7. Novos ativos (links e ícones)
  INSERT INTO public.ativos (id, programa_id, modulo_id, titulo, link_url, tipo_icone)
  VALUES
    (v_a5, v_prog1_id, v_mod4_id, 'Slides - Delegação', 'https://docs.google.com/presentation/d/1', 'docs'),
    (v_a6, v_prog1_id, v_mod5_id, 'Quiz - Estilo de liderança', 'https://docs.google.com/forms/d/1', 'link'),
    (v_a7, v_prog2_id, v_mod6_id, 'Catálogo de dinâmicas (PDF)', 'https://example.com/dinamicas.pdf', 'pdf'),
    (v_a8, v_prog2_id, v_mod7_id, 'Roteiro de mediação', 'https://docs.google.com/document/d/1', 'docs'),
    (v_a9, v_prog3_id, v_mod8_id, 'Roteiro de prática - Escuta', 'https://docs.google.com/document/d/1', 'docs'),
    (v_a10, v_prog3_id, v_mod9_id, 'Vídeo - Storytelling', 'https://www.youtube.com/watch?v=jj2nVM6b9-w', 'video')
  ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, link_url = EXCLUDED.link_url, tipo_icone = EXCLUDED.tipo_icone, updated_at = now();

  RAISE NOTICE 'Seed extra: programas com banners, 6 novos módulos, 6 novas tarefas, 6 novos ativos.';
END;
$$;
