-- -------------------------------------------------------------------------
-- MIGRATION: 20260212000100_delete_user_account_rpc.sql
-- PURPOSE: SECURITY DEFINER RPC for atomic self-deletion of user account.
-- -------------------------------------------------------------------------

-- Drop existing function if any (idempotent)
DROP FUNCTION IF EXISTS public.delete_own_account();

CREATE OR REPLACE FUNCTION public.delete_own_account()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
    _uid UUID;
BEGIN
    -- 1. Identify the caller
    _uid := auth.uid();

    IF _uid IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- 2. Delete from profiles (cascades to user_sessions, user_devices, etc.)
    DELETE FROM public.profiles WHERE id = _uid;

    -- 3. Delete from auth.users (the actual auth record)
    DELETE FROM auth.users WHERE id = _uid;
END;
$$;

-- Only authenticated users can call this
REVOKE ALL ON FUNCTION public.delete_own_account() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.delete_own_account() TO authenticated;
