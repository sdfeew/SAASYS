-- ============================================================================
-- FIX RLS CIRCULAR DEPENDENCY - User Profile 500 Error
-- Date: 2026-02-08
-- ============================================================================
-- ISSUE: The previous current_tenant_id() function caused a circular reference
-- when trying to fetch user_profiles (RLS called function -> function queried RLS table)
-- SOLUTION: Use SECURITY DEFINER to bypass RLS in the function
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL POLICIES FIRST (before dropping the function they depend on)
-- ============================================================================

-- USER_PROFILES
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_tenant" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_delete_own" ON public.user_profiles;

-- SUB_MODULES
DROP POLICY IF EXISTS "sub_modules_select" ON public.sub_modules;
DROP POLICY IF EXISTS "sub_modules_insert" ON public.sub_modules;
DROP POLICY IF EXISTS "sub_modules_update" ON public.sub_modules;
DROP POLICY IF EXISTS "sub_modules_delete" ON public.sub_modules;

-- SUB_MODULE_FIELDS
DROP POLICY IF EXISTS "sub_module_fields_select" ON public.sub_module_fields;
DROP POLICY IF EXISTS "sub_module_fields_insert" ON public.sub_module_fields;
DROP POLICY IF EXISTS "sub_module_fields_update" ON public.sub_module_fields;
DROP POLICY IF EXISTS "sub_module_fields_delete" ON public.sub_module_fields;
DROP POLICY IF EXISTS "fields_select" ON public.sub_module_fields;
DROP POLICY IF EXISTS "fields_insert" ON public.sub_module_fields;
DROP POLICY IF EXISTS "fields_update" ON public.sub_module_fields;
DROP POLICY IF EXISTS "fields_delete" ON public.sub_module_fields;

-- SUB_MODULE_RECORDS
DROP POLICY IF EXISTS "sub_module_records_select" ON public.sub_module_records;
DROP POLICY IF EXISTS "sub_module_records_insert" ON public.sub_module_records;
DROP POLICY IF EXISTS "sub_module_records_update" ON public.sub_module_records;
DROP POLICY IF EXISTS "sub_module_records_delete" ON public.sub_module_records;
DROP POLICY IF EXISTS "records_select" ON public.sub_module_records;
DROP POLICY IF EXISTS "records_insert" ON public.sub_module_records;
DROP POLICY IF EXISTS "records_update" ON public.sub_module_records;
DROP POLICY IF EXISTS "records_delete" ON public.sub_module_records;

-- DASHBOARDS
DROP POLICY IF EXISTS "dashboards_select" ON public.dashboards;
DROP POLICY IF EXISTS "dashboards_insert" ON public.dashboards;
DROP POLICY IF EXISTS "dashboards_update" ON public.dashboards;
DROP POLICY IF EXISTS "dashboards_delete" ON public.dashboards;

-- DASHBOARD_WIDGETS
DROP POLICY IF EXISTS "dashboard_widgets_select" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "dashboard_widgets_insert" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "dashboard_widgets_update" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "dashboard_widgets_delete" ON public.dashboard_widgets;

-- ATTACHMENTS
DROP POLICY IF EXISTS "attachments_select" ON public.attachments;
DROP POLICY IF EXISTS "attachments_insert" ON public.attachments;
DROP POLICY IF EXISTS "attachments_update" ON public.attachments;
DROP POLICY IF EXISTS "attachments_delete" ON public.attachments;

-- COMMENTS
DROP POLICY IF EXISTS "comments_select" ON public.comments;
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
DROP POLICY IF EXISTS "comments_update" ON public.comments;
DROP POLICY IF EXISTS "comments_delete" ON public.comments;

-- RECORD_RELATIONSHIPS
DROP POLICY IF EXISTS "record_relationships_select" ON public.record_relationships;
DROP POLICY IF EXISTS "record_relationships_insert" ON public.record_relationships;
DROP POLICY IF EXISTS "record_relationships_update" ON public.record_relationships;
DROP POLICY IF EXISTS "record_relationships_delete" ON public.record_relationships;

-- RECORD_ACTIVITY
DROP POLICY IF EXISTS "record_activity_select" ON public.record_activity;
DROP POLICY IF EXISTS "record_activity_insert" ON public.record_activity;

-- ============================================================================
-- STEP 2: NOW drop the old broken function (all policies are removed)
-- ============================================================================
DROP FUNCTION IF EXISTS public.current_tenant_id();

-- ============================================================================
-- STEP 3: Create fixed function with SECURITY DEFINER (bypasses RLS)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_current_tenant_id() 
RETURNS UUID 
LANGUAGE SQL 
STABLE 
SECURITY DEFINER 
SET search_path = public
AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_current_tenant_id() TO authenticated;

-- ============================================================================
-- STEP 4: RECREATE ALL RLS POLICIES WITH FIXED FUNCTION
-- ============================================================================

-- USER_PROFILES
CREATE POLICY "user_profiles_select" ON public.user_profiles FOR SELECT
USING (auth.uid() = id OR tenant_id = get_current_tenant_id());

CREATE POLICY "user_profiles_update" ON public.user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_insert" ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_delete" ON public.user_profiles FOR DELETE
USING (auth.uid() = id);

-- ============================================================================
-- RECREATE ALL OTHER RLS POLICIES TO USE NEW FUNCTION NAME
-- ============================================================================

-- SUB_MODULES
CREATE POLICY "sub_modules_select" ON public.sub_modules FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "sub_modules_insert" ON public.sub_modules FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "sub_modules_update" ON public.sub_modules FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "sub_modules_delete" ON public.sub_modules FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- SUB_MODULE_FIELDS
CREATE POLICY "sub_module_fields_select" ON public.sub_module_fields FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "sub_module_fields_insert" ON public.sub_module_fields FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "sub_module_fields_update" ON public.sub_module_fields FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "sub_module_fields_delete" ON public.sub_module_fields FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- SUB_MODULE_RECORDS
CREATE POLICY "sub_module_records_select" ON public.sub_module_records FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "sub_module_records_insert" ON public.sub_module_records FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "sub_module_records_update" ON public.sub_module_records FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "sub_module_records_delete" ON public.sub_module_records FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- DASHBOARDS
CREATE POLICY "dashboards_select" ON public.dashboards FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "dashboards_insert" ON public.dashboards FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "dashboards_update" ON public.dashboards FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "dashboards_delete" ON public.dashboards FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- DASHBOARD_WIDGETS
CREATE POLICY "dashboard_widgets_select" ON public.dashboard_widgets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = get_current_tenant_id()
    )
);

CREATE POLICY "dashboard_widgets_insert" ON public.dashboard_widgets FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = get_current_tenant_id()
    )
);

CREATE POLICY "dashboard_widgets_update" ON public.dashboard_widgets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = get_current_tenant_id()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = get_current_tenant_id()
    )
);

CREATE POLICY "dashboard_widgets_delete" ON public.dashboard_widgets FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = get_current_tenant_id()
    )
);

-- ATTACHMENTS
CREATE POLICY "attachments_select" ON public.attachments FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "attachments_insert" ON public.attachments FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "attachments_update" ON public.attachments FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "attachments_delete" ON public.attachments FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- COMMENTS
CREATE POLICY "comments_select" ON public.comments FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "comments_insert" ON public.comments FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "comments_update" ON public.comments FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "comments_delete" ON public.comments FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- RECORD_RELATIONSHIPS
CREATE POLICY "record_relationships_select" ON public.record_relationships FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "record_relationships_insert" ON public.record_relationships FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "record_relationships_update" ON public.record_relationships FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "record_relationships_delete" ON public.record_relationships FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- RECORD_ACTIVITY
CREATE POLICY "record_activity_select" ON public.record_activity FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "record_activity_insert" ON public.record_activity FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

-- ============================================================================
-- VERIFICATION
-- ============================================================================
-- After running this migration, test:
-- SELECT * FROM public.user_profiles WHERE id = auth.uid();
-- Should return your profile without 500 error
-- ============================================================================
