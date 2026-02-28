/*
 * COMPREHENSIVE ZERO-TRUST SECURITY POLICY
 * -------------------------------------------------------------
 * TARGET TABLES: profiles, majors, wilayas
 * OBJECTIVE: Reset all permissions and enforce strict isolation.
 * AUTHOR: Senior Database Security Architect
 * -------------------------------------------------------------
 */

-- -------------------------------------------------------------------------
-- STEP 1: CLEAN SLATE PROTOCOL (DROP ALL EXISTING POLICIES)
-- -------------------------------------------------------------------------
-- We use a DO block to dynamically drop all policies on the target tables
-- to ensure a completely fresh start without needing to know specific names.

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename IN ('profiles', 'majors', 'wilayas')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
    END LOOP;
END $$;


-- -------------------------------------------------------------------------
-- STEP 2: ENFORCE ISOLATION (ENABLE RLS)
-- -------------------------------------------------------------------------
-- Ensure RLS is active on all tables. This mandates that a policy must exist
-- for any operation to succeed (Deny by Default).

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;


-- -------------------------------------------------------------------------
-- STEP 3: DEFINE STRICT RULES (ZERO-TRUST POLICIES)
-- -------------------------------------------------------------------------

-- === TABLE: PROFILES ===
-- Rule: STRICT OWNERSHIP. Only the owner can see or touch their data.

-- SELECT: Users can ONLY view their own profile.
CREATE POLICY "Strict: Users can only view own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING ( auth.uid() = id );

-- UPDATE: Users can ONLY update their own profile.
CREATE POLICY "Strict: Users can only update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING ( auth.uid() = id );

-- INSERT: Permit insertion if ID matches. 
-- Note: Often handled by triggers, but this ensures client-side safety if used.
CREATE POLICY "Strict: Users can only insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK ( auth.uid() = id );


-- === TABLE: MAJORS ===
-- Rule: PUBLIC REFERENCE. Read-only for everyone. No mutations by standard users.

-- SELECT: All authenticated users can read.
CREATE POLICY "Reference: Authenticated users can view majors"
ON public.majors
FOR SELECT
TO authenticated
USING ( true );

-- MUTATION (Insert/Update/Delete): 
-- NO POLICIES DEFINED implies DENY for 'authenticated' role.
-- Only service_role or admin-specific roles would be able to write (if added later).


-- === TABLE: WILAYAS ===
-- Rule: PUBLIC REFERENCE. Read-only for everyone. No mutations by standard users.

-- SELECT: All authenticated users can read.
CREATE POLICY "Reference: Authenticated users can view wilayas"
ON public.wilayas
FOR SELECT
TO authenticated
USING ( true );


-- End of Script
