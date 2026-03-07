-- =============================================================================
-- LideraSpace: Fix programs INSERT - user_can_admin_program(id) fails for new rows
-- Run after 009
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Helper: user can admin an organization (lidera_admin or org_admin)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_can_admin_organization(p_organization_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_organization_id
      AND user_id = auth.uid()
      AND role IN ('lidera_admin', 'org_admin')
  );
$$;

-- -----------------------------------------------------------------------------
-- 2. Replace programs policy: INSERT uses org, UPDATE/DELETE use program
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can manage programs" ON public.programs;
DROP POLICY IF EXISTS "Admins can insert programs" ON public.programs;
DROP POLICY IF EXISTS "Admins can update programs" ON public.programs;
DROP POLICY IF EXISTS "Admins can delete programs" ON public.programs;

-- INSERT: check organization_id (program doesn't exist yet)
CREATE POLICY "Admins can insert programs"
  ON public.programs FOR INSERT
  WITH CHECK (public.user_can_admin_organization(organization_id));

-- UPDATE and DELETE: check program exists and user can admin it
CREATE POLICY "Admins can update programs"
  ON public.programs FOR UPDATE
  USING (public.user_can_admin_program(id));

CREATE POLICY "Admins can delete programs"
  ON public.programs FOR DELETE
  USING (public.user_can_admin_program(id));
