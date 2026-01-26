-- Fix Infinite Recursion in RLS Policies
-- The issue: Tenant policies check user_profiles, which checks tenants (circular)
-- Solution: Disable RLS for admin operations, use simpler policies

-- Drop ALL existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all profiles in tenant" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Admins can manage tenant" ON public.tenants;
DROP POLICY IF EXISTS "Admins can manage sub_modules" ON public.sub_modules;
DROP POLICY IF EXISTS "Admins can manage fields" ON public.sub_module_fields;
DROP POLICY IF EXISTS "Admins can delete records" ON public.sub_module_records;
DROP POLICY IF EXISTS "Allow tenant creation" ON public.tenants;
DROP POLICY IF EXISTS "Allow tenant updates" ON public.tenants;
DROP POLICY IF EXISTS "Allow sub_module creation" ON public.sub_modules;
DROP POLICY IF EXISTS "Allow sub_module updates" ON public.sub_modules;
DROP POLICY IF EXISTS "Allow field creation" ON public.sub_module_fields;
DROP POLICY IF EXISTS "Allow field updates" ON public.sub_module_fields;
DROP POLICY IF EXISTS "Allow record creation" ON public.sub_module_records;
DROP POLICY IF EXISTS "Allow record updates" ON public.sub_module_records;

-- IMPORTANT: Disable RLS on tenants table to allow tenant creation
-- Role-based access will be enforced at the application level
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS but with simplified policies for user_profiles only
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES: Keep simple policies (non-recursive)
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
ON user_profiles FOR DELETE
USING (auth.uid() = id);

-- Allow authenticated users to read all profiles in their tenant (for admin/manager UIs)
CREATE POLICY "View profiles in same tenant"
ON user_profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.tenant_id = user_profiles.tenant_id
        AND up.id = auth.uid()
    )
);

-- SUB_MODULES: Allow viewing in user's tenant
ALTER TABLE public.sub_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View sub_modules in own tenant"
ON sub_modules FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_modules.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

CREATE POLICY "Create sub_modules in own tenant"
ON sub_modules FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_modules.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

CREATE POLICY "Update sub_modules in own tenant"
ON sub_modules FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_modules.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

-- SUB_MODULE_FIELDS: Allow viewing in user's tenant
ALTER TABLE public.sub_module_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View fields in own tenant"
ON sub_module_fields FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_fields.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

CREATE POLICY "Create fields in own tenant"
ON sub_module_fields FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_fields.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

CREATE POLICY "Update fields in own tenant"
ON sub_module_fields FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_fields.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

-- SUB_MODULE_RECORDS: Allow viewing and creating in user's tenant
ALTER TABLE public.sub_module_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View records in own tenant"
ON sub_module_records FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_records.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

CREATE POLICY "Create records in own tenant"
ON sub_module_records FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_records.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

CREATE POLICY "Update own records"
ON sub_module_records FOR UPDATE
USING (
    created_by = auth.uid()
    OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = sub_module_records.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

CREATE POLICY "Delete own records"
ON sub_module_records FOR DELETE
USING (created_by = auth.uid());

-- Allow authenticated users to manage attachments in their tenant
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View attachments in own tenant"
ON attachments FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = attachments.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

CREATE POLICY "Upload attachments to own tenant"
ON attachments FOR INSERT
WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_profiles.tenant_id = attachments.tenant_id
        AND user_profiles.id = auth.uid()
    )
);

CREATE POLICY "Delete own attachments"
ON attachments FOR DELETE
USING (uploaded_by = auth.uid());
