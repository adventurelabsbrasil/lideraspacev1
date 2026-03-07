-- =============================================================================
-- LideraSpace: Super admin - user can see all organizations and data
-- Run after 008
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Add is_super_admin column to profiles
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_super_admin boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_super_admin IS 'When true, user bypasses org membership for SELECT on organizations, programs, modules, etc.';

-- -----------------------------------------------------------------------------
-- 2. Helper: user is super admin
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_super_admin FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- -----------------------------------------------------------------------------
-- 3. Update RLS policies: super admin can SELECT all
-- -----------------------------------------------------------------------------

-- organizations
DROP POLICY IF EXISTS "Members can view their organizations" ON public.organizations;
CREATE POLICY "Members can view their organizations"
  ON public.organizations FOR SELECT
  USING (public.user_is_super_admin() OR public.user_in_organization(id));

-- organization_members
DROP POLICY IF EXISTS "Members can view same org" ON public.organization_members;
CREATE POLICY "Members can view same org"
  ON public.organization_members FOR SELECT
  USING (public.user_is_super_admin() OR public.user_in_organization(organization_id));

-- programs
DROP POLICY IF EXISTS "Members can view programs" ON public.programs;
CREATE POLICY "Members can view programs"
  ON public.programs FOR SELECT
  USING (public.user_is_super_admin() OR public.user_in_organization(organization_id));

-- modules
DROP POLICY IF EXISTS "Members can view modules" ON public.modules;
CREATE POLICY "Members can view modules"
  ON public.modules FOR SELECT
  USING (
    public.user_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = modules.program_id AND public.user_in_organization(p.organization_id)
    )
  );

-- tasks
DROP POLICY IF EXISTS "Members can view tasks" ON public.tasks;
CREATE POLICY "Members can view tasks"
  ON public.tasks FOR SELECT
  USING (
    public.user_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = tasks.program_id AND public.user_in_organization(p.organization_id)
    )
  );

-- assets
DROP POLICY IF EXISTS "Members can view assets" ON public.assets;
CREATE POLICY "Members can view assets"
  ON public.assets FOR SELECT
  USING (
    public.user_is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.programs p
      WHERE p.id = assets.program_id AND public.user_in_organization(p.organization_id)
    )
  );
