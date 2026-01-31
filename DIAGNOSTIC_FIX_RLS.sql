-- ============================================================================
-- DIAGNOSTIC & FIX: Check why current_tenant_id() returns NULL
-- ============================================================================

-- STEP 1: Check who is the current user
SELECT 
  'Current auth.uid()' as info,
  auth.uid() as value;

-- STEP 2: Check if user_profiles exist with this UUID
SELECT 
  'User profiles for current user' as info,
  COUNT(*) as count,
  STRING_AGG(id::text, ', ') as user_ids
FROM public.user_profiles 
WHERE id = auth.uid();

-- STEP 3: Get ALL user profiles
SELECT 
  'All user profiles' as info,
  COUNT(*) as total_profiles
FROM public.user_profiles;

-- STEP 4: Check current_tenant_id() function
SELECT 
  'Result of current_tenant_id()' as info,
  current_tenant_id() as tenant_id;

-- STEP 5: Get sample of all user_profiles to verify structure
SELECT 
  'Sample user profiles' as info,
  id,
  tenant_id,
  email,
  created_at
FROM public.user_profiles 
LIMIT 5;

-- ============================================================================
-- THE REAL PROBLEM: RLS functions need to use current_setting
-- Let's fix the function to work properly with RLS
-- ============================================================================

-- Drop the old function
DROP FUNCTION IF EXISTS public.current_tenant_id();

-- Create a NEW version that works with Supabase auth
CREATE OR REPLACE FUNCTION public.current_tenant_id() RETURNS UUID AS $$
DECLARE
  user_id UUID;
  tenant_id_result UUID;
BEGIN
  -- Get the current user ID from auth
  user_id := auth.uid();
  
  -- If no user, return NULL
  IF user_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Query user_profiles for tenant_id
  SELECT up.tenant_id INTO tenant_id_result
  FROM public.user_profiles up
  WHERE up.id = user_id
  LIMIT 1;
  
  RETURN tenant_id_result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- GRANT execute permission
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO anon;

-- ============================================================================
-- Now test the function again
-- ============================================================================

SELECT 'Test new function' as test, current_tenant_id() as tenant_id;

-- If tenant_id is NOT NULL, test the RLS policies
-- If still NULL, user doesn't have a profile yet - need to create one
