-- =============================================================================
-- LideraSpace: Admin can look up user_id by email (to add members to org)
-- Run after 010
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id uuid;
  v_caller_is_admin boolean;
BEGIN
  -- Only admins (lidera_admin or org_admin) can look up users
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = auth.uid() AND role IN ('lidera_admin', 'org_admin')
  ) INTO v_caller_is_admin;

  IF NOT v_caller_is_admin THEN
    RETURN NULL;
  END IF;

  SELECT id FROM auth.users
  WHERE email = lower(trim(p_email))
  LIMIT 1
  INTO v_user_id;

  RETURN v_user_id;
END;
$$;

COMMENT ON FUNCTION public.get_user_id_by_email(text) IS 'Returns user id for email. Only callable by org admins. Used when adding members to organization.';
