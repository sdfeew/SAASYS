-- Fix Infinite Recursion in RLS Policies
-- The issue: Tenant policies check user_profiles, which checks tenants (circular)
-- Solution: Disable RLS for admin operations, use simpler policies

-- Drop all problematic RLS policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles in tenant" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage tenant" ON public.tenants;
DROP POLICY IF EXISTS "Admins can manage sub_modules" ON public.sub_modules;
DROP POLICY IF EXISTS "Admins can manage fields" ON public.sub_module_fields;
DROP POLICY IF EXISTS "Admins can delete records" ON public.sub_module_records;

-- Keep the basic user policies (non-recursive)
-- user_profiles: Users can view own profile
-- (already exists from earlier migrations)

-- user_profiles: Users can update own profile  
-- (already exists from earlier migrations)

-- TENANTS: Simplified - Remove circular check
-- Drop the old one if it exists
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;

-- Create new tenant policy - just check if user belongs to tenant
CREATE POLICY "Users can view tenant" ON public.tenants
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.tenant_id = tenants.id 
        AND user_profiles.id = auth.uid()
    )
);

-- Allow authenticated users to insert new tenants (controlled at application level)
CREATE POLICY "Allow tenant creation" ON public.tenants
FOR INSERT
WITH CHECK (true);

-- Allow updates for tenant members (simplified, no role check in policy)
CREATE POLICY "Allow tenant updates" ON public.tenants
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.tenant_id = tenants.id 
        AND user_profiles.id = auth.uid()
    )
);

-- SUB_MODULES: Users can view sub_modules in their tenant
-- (already exists from earlier migrations)

-- Allow creation of sub_modules for tenant members
CREATE POLICY "Allow sub_module creation" ON public.sub_modules
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_modules.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

-- Allow updates for tenant members
CREATE POLICY "Allow sub_module updates" ON public.sub_modules
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_modules.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

-- SUB_MODULE_FIELDS: Users can view fields in their tenant
-- (already exists from earlier migrations)

-- Allow field creation for tenant members
CREATE POLICY "Allow field creation" ON public.sub_module_fields
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_fields.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

-- Allow field updates for tenant members
CREATE POLICY "Allow field updates" ON public.sub_module_fields
FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_fields.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

-- SUB_MODULE_RECORDS: Keep existing view policy
-- (already exists from earlier migrations)

-- Allow record creation for tenant members
CREATE POLICY "Allow record creation" ON public.sub_module_records
FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_records.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

-- Allow record updates for creator or admin
CREATE POLICY "Allow record updates" ON public.sub_module_records
FOR UPDATE
USING (
    created_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_records.tenant_id
        AND user_profiles.id = auth.uid()
        AND user_profiles.role_code = 'admin'
    )
);
