-- ============================================================================
-- COMPLETE DATA DIAGNOSTIC
-- Check the actual state of your data
-- ============================================================================

-- 1. Check current user
SELECT 'Current User ID' as check_name, auth.uid() as value;

-- 2. Check if user_profiles table is empty
SELECT 'Total user_profiles' as check_name, COUNT(*) as count FROM public.user_profiles;

-- 3. Check user_profiles for current user
SELECT 'User profiles for auth.uid()' as check_name, COUNT(*) as count FROM public.user_profiles WHERE id = auth.uid();

-- 4. Show ALL user_profiles (first 5)
SELECT 'All user profiles (sample)' as check_name, id, tenant_id, email FROM public.user_profiles LIMIT 5;

-- 5. Check tenants table
SELECT 'Total tenants' as check_name, COUNT(*) as count FROM public.tenants;

-- 6. Show sample tenants
SELECT 'Tenants (sample)' as check_name, id, name FROM public.tenants LIMIT 5;

-- 7. Check sub_module_records
SELECT 'Total sub_module_records' as check_name, COUNT(*) as count FROM public.sub_module_records;

-- 8. Check how many records have each tenant_id
SELECT 'Records per tenant' as check_name, tenant_id, COUNT(*) as count FROM public.sub_module_records GROUP BY tenant_id ORDER BY count DESC;

-- 9. Check if records match your tenant
SELECT 'Records in your tenant' as check_name, COUNT(*) as count 
FROM public.sub_module_records 
WHERE tenant_id IN (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid());

-- 10. Test function directly
SELECT 'current_tenant_id() result' as check_name, current_tenant_id() as value;

-- ============================================================================
-- VERDICT: Based on above, we'll decide next steps
-- If all is empty or mismatched, we may need to:
-- 1. Disable RLS temporarily to get working
-- 2. Seed proper test data with correct tenant_id
-- 3. Re-enable RLS with correct function
-- ============================================================================
