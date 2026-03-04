-- =============================================================================
-- LideraSpace: schema organizações, programas, módulos, tarefas e ativos
-- Rodar no SQL Editor do Supabase (ou via Supabase CLI)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Organizações e vínculo usuário–organização
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 2. Programas
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 3. Módulos
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 4. Tarefas (status: pendente | em_andamento | concluida)
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- 5. Ativos (tipo_icone: planilha | docs | pdf | video | link)
-- -----------------------------------------------------------------------------

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

-- -----------------------------------------------------------------------------
-- Trigger: updated_at
-- -----------------------------------------------------------------------------

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
