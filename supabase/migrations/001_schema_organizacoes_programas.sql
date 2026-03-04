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
-- 6. Função auxiliar: usuário pode administrar o programa?
-- (admin da organização OU criador do programa)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_can_admin_program(p_programa_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.programas p
    LEFT JOIN public.organization_members om
      ON om.organization_id = p.organization_id
      AND om.user_id = auth.uid()
      AND om.role = 'admin'
    WHERE p.id = p_programa_id
      AND (p.created_by = auth.uid() OR om.id IS NOT NULL)
  );
$$;

-- -----------------------------------------------------------------------------
-- 7. Usuário pertence à organização (qualquer role)?
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.user_in_organization(p_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE organization_id = p_organization_id
      AND user_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- 8. RLS: habilitar em todas as tabelas
-- -----------------------------------------------------------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ativos ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Organizations: ver apenas orgs em que o usuário é membro
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "organizations_select_member" ON public.organizations;
CREATE POLICY "organizations_select_member"
  ON public.organizations FOR SELECT
  USING (public.user_in_organization(id));

-- Inserir/atualizar/deletar organizações: apenas se for admin em alguma org
-- (para criar nova org, pode usar policy mais permissiva ou service role)
DROP POLICY IF EXISTS "organizations_insert_authenticated" ON public.organizations;
CREATE POLICY "organizations_insert_authenticated"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "organizations_update_admin" ON public.organizations;
CREATE POLICY "organizations_update_admin"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "organizations_delete_admin" ON public.organizations;
CREATE POLICY "organizations_delete_admin"
  ON public.organizations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = organizations.id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- Organization members: ver membros da mesma org; alterar apenas admins da org
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "organization_members_select_same_org" ON public.organization_members;
CREATE POLICY "organization_members_select_same_org"
  ON public.organization_members FOR SELECT
  USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "organization_members_insert_admin" ON public.organization_members;
CREATE POLICY "organization_members_insert_admin"
  ON public.organization_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "organization_members_update_admin" ON public.organization_members;
CREATE POLICY "organization_members_update_admin"
  ON public.organization_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "organization_members_delete_admin" ON public.organization_members;
CREATE POLICY "organization_members_delete_admin"
  ON public.organization_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id
        AND om.user_id = auth.uid()
        AND om.role = 'admin'
    )
  );

-- -----------------------------------------------------------------------------
-- Programas: SELECT se membro da org; INSERT/UPDATE/DELETE se admin do programa
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "programas_select_member" ON public.programas;
CREATE POLICY "programas_select_member"
  ON public.programas FOR SELECT
  USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "programas_insert_admin" ON public.programas;
CREATE POLICY "programas_insert_admin"
  ON public.programas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = programas.organization_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "programas_update_admin" ON public.programas;
CREATE POLICY "programas_update_admin"
  ON public.programas FOR UPDATE
  USING (public.user_can_admin_program(id));

DROP POLICY IF EXISTS "programas_delete_admin" ON public.programas;
CREATE POLICY "programas_delete_admin"
  ON public.programas FOR DELETE
  USING (public.user_can_admin_program(id));

-- -----------------------------------------------------------------------------
-- Módulos: SELECT se tem acesso ao programa; INSERT/UPDATE/DELETE se admin
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "modulos_select_program_member" ON public.modulos;
CREATE POLICY "modulos_select_program_member"
  ON public.modulos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programas p
      WHERE p.id = modulos.programa_id
        AND public.user_in_organization(p.organization_id)
    )
  );

DROP POLICY IF EXISTS "modulos_insert_admin" ON public.modulos;
CREATE POLICY "modulos_insert_admin"
  ON public.modulos FOR INSERT
  WITH CHECK (public.user_can_admin_program(programa_id));

DROP POLICY IF EXISTS "modulos_update_admin" ON public.modulos;
CREATE POLICY "modulos_update_admin"
  ON public.modulos FOR UPDATE
  USING (public.user_can_admin_program(programa_id));

DROP POLICY IF EXISTS "modulos_delete_admin" ON public.modulos;
CREATE POLICY "modulos_delete_admin"
  ON public.modulos FOR DELETE
  USING (public.user_can_admin_program(programa_id));

-- -----------------------------------------------------------------------------
-- Tarefas: mesmo padrão (acesso pelo programa)
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "tarefas_select_program_member" ON public.tarefas;
CREATE POLICY "tarefas_select_program_member"
  ON public.tarefas FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programas p
      WHERE p.id = tarefas.programa_id
        AND public.user_in_organization(p.organization_id)
    )
  );

DROP POLICY IF EXISTS "tarefas_insert_admin" ON public.tarefas;
CREATE POLICY "tarefas_insert_admin"
  ON public.tarefas FOR INSERT
  WITH CHECK (public.user_can_admin_program(programa_id));

DROP POLICY IF EXISTS "tarefas_update_admin_or_assignee" ON public.tarefas;
CREATE POLICY "tarefas_update_admin_or_assignee"
  ON public.tarefas FOR UPDATE
  USING (
    public.user_can_admin_program(programa_id)
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "tarefas_delete_admin" ON public.tarefas;
CREATE POLICY "tarefas_delete_admin"
  ON public.tarefas FOR DELETE
  USING (public.user_can_admin_program(programa_id));

-- -----------------------------------------------------------------------------
-- Ativos: mesmo padrão
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "ativos_select_program_member" ON public.ativos;
CREATE POLICY "ativos_select_program_member"
  ON public.ativos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programas p
      WHERE p.id = ativos.programa_id
        AND public.user_in_organization(p.organization_id)
    )
  );

DROP POLICY IF EXISTS "ativos_insert_admin" ON public.ativos;
CREATE POLICY "ativos_insert_admin"
  ON public.ativos FOR INSERT
  WITH CHECK (public.user_can_admin_program(programa_id));

DROP POLICY IF EXISTS "ativos_update_admin" ON public.ativos;
CREATE POLICY "ativos_update_admin"
  ON public.ativos FOR UPDATE
  USING (public.user_can_admin_program(programa_id));

DROP POLICY IF EXISTS "ativos_delete_admin" ON public.ativos;
CREATE POLICY "ativos_delete_admin"
  ON public.ativos FOR DELETE
  USING (public.user_can_admin_program(programa_id));

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
