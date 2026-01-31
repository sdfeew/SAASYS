-- ============================================================================
-- QUICK FIX: Drop old RLS policies and recreate them correctly
-- Run this INSTEAD of the full migration if you've already applied it
-- ============================================================================

-- Drop ALL old policies from user_profiles first
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_tenant" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_delete_own" ON public.user_profiles;

-- Make sure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- NEW CORRECT POLICIES - Allow user to read their own profile
CREATE POLICY "user_profiles_select" ON public.user_profiles FOR SELECT
USING (auth.uid() = id OR tenant_id = current_tenant_id());

CREATE POLICY "user_profiles_update" ON public.user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_insert" ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_delete" ON public.user_profiles FOR DELETE
USING (auth.uid() = id);

-- Test: This should return your profile
SELECT * FROM public.user_profiles WHERE id = auth.uid();
