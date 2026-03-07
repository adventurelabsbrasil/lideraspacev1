-- =============================================================================
-- LideraSpace: SCHEMA + SEED DEMO em um único script (schema em português)
-- Cria tabelas (se não existirem), aplica alterações e popula dados de demonstração.
--
-- NOTA: Para o schema padronizado em inglês (após migrations 007/008), use
-- as migrations 001-008 e depois rode seed_demo.sql.
--
-- Pré-requisito: pelo menos 1 usuário em auth.users (Authentication > Users ou
-- signup no app). O primeiro usuário ou admin@admin.com receberá role admin.
--
-- Uso: copie TODO o conteúdo e execute no SQL Editor do Supabase.
-- =============================================================================

-- ==================== PARTE 1: SCHEMA (migrations 001, 002, 003) ====================

-- 1. Organizações e vínculo usuário–organização
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('admin', 'member')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_organization_members_org ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON public.organization_members(user_id);

-- 2. Programas
CREATE TABLE IF NOT EXISTS public.programas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  imagem_banner_url text,
  favicon_programa_url text,
  favicon_criador_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_programas_organization ON public.programas(organization_id);
CREATE INDEX IF NOT EXISTS idx_programas_created_by ON public.programas(created_by);

-- 3. Módulos
CREATE TABLE IF NOT EXISTS public.modulos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id uuid NOT NULL REFERENCES public.programas(id) ON DELETE CASCADE,
  ordem int NOT NULL DEFAULT 0,
  titulo text NOT NULL,
  topicos jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtopicos jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_youtube_embed_url text,
  materiais jsonb NOT NULL DEFAULT '[]'::jsonb,
  imagem_banner_url text,
  favicon_programa_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON COLUMN public.modulos.topicos IS 'Array de strings, ex: ["Tópico 1", "Tópico 2"]';
COMMENT ON COLUMN public.modulos.subtopicos IS 'Array de strings';
COMMENT ON COLUMN public.modulos.materiais IS 'Array de objetos: [{ "url": "...", "label": "...", "icon": "..." }]';

CREATE INDEX IF NOT EXISTS idx_modulos_programa ON public.modulos(programa_id);

-- 4. Tarefas
CREATE TABLE IF NOT EXISTS public.tarefas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id uuid NOT NULL REFERENCES public.programas(id) ON DELETE CASCADE,
  modulo_id uuid REFERENCES public.modulos(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida')),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tarefas_programa ON public.tarefas(programa_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_modulo ON public.tarefas(modulo_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON public.tarefas(status);

-- 5. Ativos
CREATE TABLE IF NOT EXISTS public.ativos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  programa_id uuid NOT NULL REFERENCES public.programas(id) ON DELETE CASCADE,
  modulo_id uuid REFERENCES public.modulos(id) ON DELETE SET NULL,
  titulo text NOT NULL,
  link_url text NOT NULL,
  tipo_icone text NOT NULL DEFAULT 'link' CHECK (tipo_icone IN ('planilha', 'docs', 'pdf', 'video', 'link')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ativos_programa ON public.ativos(programa_id);
CREATE INDEX IF NOT EXISTS idx_ativos_modulo ON public.ativos(modulo_id);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['organizations', 'programas', 'modulos', 'tarefas', 'ativos']
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS set_updated_at ON public.%I;
       CREATE TRIGGER set_updated_at
         BEFORE UPDATE ON public.%I
         FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- Coluna conteudo em modulos (migration 002)
ALTER TABLE public.modulos
  ADD COLUMN IF NOT EXISTS conteudo text;

COMMENT ON COLUMN public.modulos.conteudo IS 'Conteúdo formatado do módulo em Markdown (rich text estilo Notion).';

-- Bucket Storage (migration 002)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'programas',
  'programas',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users can upload program assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload program assets"
  ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'programas');

DROP POLICY IF EXISTS "Authenticated users can update program assets" ON storage.objects;
CREATE POLICY "Authenticated users can update program assets"
  ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'programas');

DROP POLICY IF EXISTS "Authenticated users can delete program assets" ON storage.objects;
CREATE POLICY "Authenticated users can delete program assets"
  ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'programas');

DROP POLICY IF EXISTS "Public read for program assets" ON storage.objects;
CREATE POLICY "Public read for program assets"
  ON storage.objects FOR SELECT TO public USING (bucket_id = 'programas');

-- Coluna emoji em modulos (migration 003)
ALTER TABLE public.modulos
  ADD COLUMN IF NOT EXISTS emoji text;

COMMENT ON COLUMN public.modulos.emoji IS 'Emoji ou ícone exibido ao lado do título do módulo (ex: 📖, 🎯).';

-- ==================== PARTE 2: SEED DEMO ====================

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
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@admin.com' LIMIT 1;
  IF v_user_id IS NULL THEN
    SELECT id INTO v_user_id FROM auth.users ORDER BY created_at LIMIT 1;
  END IF;
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum usuário em auth.users. Crie um usuário em Authentication > Users (ex: admin@admin.com) ou faça signup no app.';
  END IF;

  INSERT INTO public.organizations (id, nome)
  VALUES (v_org_id, 'LideraSpace Demo')
  ON CONFLICT (id) DO UPDATE SET nome = EXCLUDED.nome;

  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (v_org_id, v_user_id, 'admin')
  ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';

  INSERT INTO public.programas (id, organization_id, titulo, created_by, imagem_banner_url, favicon_programa_url, favicon_criador_url)
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
    titulo = EXCLUDED.titulo,
    imagem_banner_url = EXCLUDED.imagem_banner_url,
    favicon_programa_url = EXCLUDED.favicon_programa_url,
    favicon_criador_url = EXCLUDED.favicon_criador_url,
    updated_at = now();

  INSERT INTO public.modulos (id, programa_id, ordem, titulo, emoji, topicos, subtopicos, video_youtube_embed_url, materiais, imagem_banner_url, favicon_programa_url, conteudo)
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
    titulo = EXCLUDED.titulo,
    emoji = COALESCE(EXCLUDED.emoji, modulos.emoji),
    topicos = EXCLUDED.topicos,
    subtopicos = EXCLUDED.subtopicos,
    video_youtube_embed_url = EXCLUDED.video_youtube_embed_url,
    materiais = EXCLUDED.materiais,
    imagem_banner_url = EXCLUDED.imagem_banner_url,
    favicon_programa_url = EXCLUDED.favicon_programa_url,
    ordem = EXCLUDED.ordem,
    updated_at = now();

  INSERT INTO public.tarefas (id, programa_id, modulo_id, titulo, status, created_by)
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
  ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, status = EXCLUDED.status, modulo_id = EXCLUDED.modulo_id, updated_at = now();

  INSERT INTO public.ativos (id, programa_id, modulo_id, titulo, link_url, tipo_icone)
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
  ON CONFLICT (id) DO UPDATE SET titulo = EXCLUDED.titulo, link_url = EXCLUDED.link_url, tipo_icone = EXCLUDED.tipo_icone, updated_at = now();

  RAISE NOTICE 'Seed DEMO concluído. Usuário admin: % (role admin). Organização: %. 3 programas, 9 módulos, 10 tarefas, 10 ativos.', v_user_id, v_org_id;
END;
$$;
