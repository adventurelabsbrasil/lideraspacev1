-- =============================================================================
-- LideraSpace: RLS and auth policies (run after 007)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Helper: user is member of organization
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_in_organization(p_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_organization_id AND user_id = auth.uid()
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. Helper: user can admin a program (lidera_admin or org_admin for that org)
--    Parameter name p_programa_id kept for CREATE OR REPLACE compatibility.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_can_admin_program(p_programa_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.programs p
    JOIN public.organization_members om ON om.organization_id = p.organization_id AND om.user_id = auth.uid()
    WHERE p.id = p_programa_id AND om.role IN ('lidera_admin', 'org_admin')
  );
$$;

-- -----------------------------------------------------------------------------
-- 3. organizations: RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;
CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  USING (public.user_in_organization(id));

DROP POLICY IF EXISTS "Admins can insert organizations" ON public.organizations;
CREATE POLICY "Admins can insert organizations"
  ON public.organizations FOR INSERT
  TO authenticated
  WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.organizations)
    OR EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = auth.uid() AND role = 'lidera_admin')
  );

DROP POLICY IF EXISTS "Admins can update organizations" ON public.organizations;
CREATE POLICY "Admins can update organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organizations.id AND om.user_id = auth.uid() AND om.role IN ('lidera_admin', 'org_admin')
    )
  );

DROP POLICY IF EXISTS "Admins can delete organizations" ON public.organizations;
CREATE POLICY "Admins can delete organizations"
  ON public.organizations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organizations.id AND om.user_id = auth.uid() AND om.role IN ('lidera_admin', 'org_admin')
    )
  );

-- -----------------------------------------------------------------------------
-- 4. organization_members: RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view same org" ON public.organization_members;
CREATE POLICY "Members can view same org"
  ON public.organization_members FOR SELECT
  USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Admins can manage members" ON public.organization_members;
CREATE POLICY "Admins can manage members"
  ON public.organization_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid() AND om.role IN ('lidera_admin', 'org_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.organization_id = organization_members.organization_id AND om.user_id = auth.uid() AND om.role IN ('lidera_admin', 'org_admin')
    )
  );

-- -----------------------------------------------------------------------------
-- 5. programs: RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view programs" ON public.programs;
CREATE POLICY "Members can view programs"
  ON public.programs FOR SELECT
  USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
CREATE POLICY "Admins can manage programs"
  ON public.programs FOR ALL
  USING (public.user_can_admin_program(id))
  WITH CHECK (public.user_can_admin_program(id));

-- -----------------------------------------------------------------------------
-- 6. modules: RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view modules" ON public.modules;
CREATE POLICY "Members can view modules"
  ON public.modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = modules.program_id AND public.user_in_organization(p.organization_id)
    )
  );

DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
CREATE POLICY "Admins can manage modules"
  ON public.modules FOR ALL
  USING (public.user_can_admin_program(program_id))
  WITH CHECK (public.user_can_admin_program(program_id));

-- -----------------------------------------------------------------------------
-- 7. tasks: RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view tasks" ON public.tasks;
CREATE POLICY "Members can view tasks"
  ON public.tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = tasks.program_id AND public.user_in_organization(p.organization_id)
    )
  );

DROP POLICY IF EXISTS "Admins can manage tasks" ON public.tasks;
CREATE POLICY "Admins can manage tasks"
  ON public.tasks FOR ALL
  USING (public.user_can_admin_program(program_id))
  WITH CHECK (public.user_can_admin_program(program_id));

-- -----------------------------------------------------------------------------
-- 8. assets: RLS
-- -----------------------------------------------------------------------------
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view assets" ON public.assets;
CREATE POLICY "Members can view assets"
  ON public.assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = assets.program_id AND public.user_in_organization(p.organization_id)
    )
  );

DROP POLICY IF EXISTS "Admins can manage assets" ON public.assets;
CREATE POLICY "Admins can manage assets"
  ON public.assets FOR ALL
  USING (public.user_can_admin_program(program_id))
  WITH CHECK (public.user_can_admin_program(program_id));

-- -----------------------------------------------------------------------------
-- 9. Storage: programas bucket - left unchanged (policies from 002 remain).
--    Path-based restriction by org/program can be added when the app uses
--    path structure like programas/{organization_id}/{program_id}/...
-- -----------------------------------------------------------------------------
