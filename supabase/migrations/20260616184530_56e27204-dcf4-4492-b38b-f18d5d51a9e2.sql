
-- Add explicit policies for invitations and user_roles to prevent accidental exposure
-- via future permissive policies. These RESTRICTIVE policies block all access by
-- authenticated/anon roles; service_role bypasses RLS and the SECURITY DEFINER
-- trigger handle_new_user continues to work.

-- INVITATIONS: deny all client-side access explicitly
CREATE POLICY "Block client SELECT on invitations"
  ON public.invitations AS RESTRICTIVE FOR SELECT
  TO authenticated, anon USING (false);

CREATE POLICY "Block client INSERT on invitations"
  ON public.invitations AS RESTRICTIVE FOR INSERT
  TO authenticated, anon WITH CHECK (false);

CREATE POLICY "Block client UPDATE on invitations"
  ON public.invitations AS RESTRICTIVE FOR UPDATE
  TO authenticated, anon USING (false) WITH CHECK (false);

CREATE POLICY "Block client DELETE on invitations"
  ON public.invitations AS RESTRICTIVE FOR DELETE
  TO authenticated, anon USING (false);

-- USER_ROLES: explicitly deny client-side writes (SELECT policy already exists)
CREATE POLICY "Block client INSERT on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR INSERT
  TO authenticated, anon WITH CHECK (false);

CREATE POLICY "Block client UPDATE on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR UPDATE
  TO authenticated, anon USING (false) WITH CHECK (false);

CREATE POLICY "Block client DELETE on user_roles"
  ON public.user_roles AS RESTRICTIVE FOR DELETE
  TO authenticated, anon USING (false);

-- Lock down has_role() EXECUTE so it's only callable from server-side contexts
-- (RLS policies invoke functions as the table owner via SECURITY DEFINER chains;
-- service_role still has access). This addresses the SECURITY DEFINER finding.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
