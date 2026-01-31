-- ============================================================================
-- NUCLEAR FIX: Drop ALL RLS Policies and Recreate Correctly
-- Run this if policies already exist
-- ============================================================================

-- Drop ALL policies from all tables first
-- This is safe - we're recreating them immediately after

-- USER_PROFILES
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "users_select_own" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "users_select_tenant" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "users_delete_own" ON public.user_profiles CASCADE;

-- SUB_MODULES
DROP POLICY IF EXISTS "sub_modules_select" ON public.sub_modules CASCADE;
DROP POLICY IF EXISTS "sub_modules_insert" ON public.sub_modules CASCADE;
DROP POLICY IF EXISTS "sub_modules_update" ON public.sub_modules CASCADE;
DROP POLICY IF EXISTS "sub_modules_delete" ON public.sub_modules CASCADE;

-- SUB_MODULE_FIELDS
DROP POLICY IF EXISTS "sub_module_fields_select" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "fields_select" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "sub_module_fields_insert" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "fields_insert" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "sub_module_fields_update" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "fields_update" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "sub_module_fields_delete" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "fields_delete" ON public.sub_module_fields CASCADE;

-- SUB_MODULE_RECORDS
DROP POLICY IF EXISTS "sub_module_records_select" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "records_select" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "sub_module_records_insert" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "records_insert" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "sub_module_records_update" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "records_update" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "sub_module_records_delete" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "records_delete" ON public.sub_module_records CASCADE;

-- DASHBOARDS
DROP POLICY IF EXISTS "dashboards_select" ON public.dashboards CASCADE;
DROP POLICY IF EXISTS "dashboards_insert" ON public.dashboards CASCADE;
DROP POLICY IF EXISTS "dashboards_update" ON public.dashboards CASCADE;
DROP POLICY IF EXISTS "dashboards_delete" ON public.dashboards CASCADE;

-- DASHBOARD_WIDGETS
DROP POLICY IF EXISTS "dashboard_widgets_select" ON public.dashboard_widgets CASCADE;
DROP POLICY IF EXISTS "dashboard_widgets_insert" ON public.dashboard_widgets CASCADE;
DROP POLICY IF EXISTS "dashboard_widgets_update" ON public.dashboard_widgets CASCADE;
DROP POLICY IF EXISTS "dashboard_widgets_delete" ON public.dashboard_widgets CASCADE;

-- ATTACHMENTS
DROP POLICY IF EXISTS "attachments_select" ON public.attachments CASCADE;
DROP POLICY IF EXISTS "attachments_insert" ON public.attachments CASCADE;
DROP POLICY IF EXISTS "attachments_update" ON public.attachments CASCADE;
DROP POLICY IF EXISTS "attachments_delete" ON public.attachments CASCADE;

-- COMMENTS
DROP POLICY IF EXISTS "comments_select" ON public.comments CASCADE;
DROP POLICY IF EXISTS "comments_insert" ON public.comments CASCADE;
DROP POLICY IF EXISTS "comments_update" ON public.comments CASCADE;
DROP POLICY IF EXISTS "comments_delete" ON public.comments CASCADE;

-- RECORD_RELATIONSHIPS
DROP POLICY IF EXISTS "record_relationships_select" ON public.record_relationships CASCADE;
DROP POLICY IF EXISTS "record_relationships_insert" ON public.record_relationships CASCADE;
DROP POLICY IF EXISTS "record_relationships_update" ON public.record_relationships CASCADE;
DROP POLICY IF EXISTS "record_relationships_delete" ON public.record_relationships CASCADE;

-- RECORD_ACTIVITY
DROP POLICY IF EXISTS "record_activity_select" ON public.record_activity CASCADE;
DROP POLICY IF EXISTS "record_activity_insert" ON public.record_activity CASCADE;

-- ============================================================================
-- Now recreate the helper function
-- ============================================================================

DROP FUNCTION IF EXISTS public.current_tenant_id();

CREATE OR REPLACE FUNCTION public.current_tenant_id() RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- 1. USER_PROFILES TABLE
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_profiles_select" ON public.user_profiles FOR SELECT
USING (auth.uid() = id OR tenant_id = current_tenant_id());

CREATE POLICY "user_profiles_update" ON public.user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_insert" ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "user_profiles_delete" ON public.user_profiles FOR DELETE
USING (auth.uid() = id);

-- ============================================================================
-- 2. SUB_MODULES TABLE
-- ============================================================================
ALTER TABLE public.sub_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sub_modules_select" ON public.sub_modules FOR SELECT
USING (tenant_id = current_tenant_id());

CREATE POLICY "sub_modules_insert" ON public.sub_modules FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "sub_modules_update" ON public.sub_modules FOR UPDATE
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "sub_modules_delete" ON public.sub_modules FOR DELETE
USING (tenant_id = current_tenant_id());

-- ============================================================================
-- 3. SUB_MODULE_FIELDS TABLE
-- ============================================================================
ALTER TABLE public.sub_module_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sub_module_fields_select" ON public.sub_module_fields FOR SELECT
USING (tenant_id = current_tenant_id());

CREATE POLICY "sub_module_fields_insert" ON public.sub_module_fields FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "sub_module_fields_update" ON public.sub_module_fields FOR UPDATE
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "sub_module_fields_delete" ON public.sub_module_fields FOR DELETE
USING (tenant_id = current_tenant_id());

-- ============================================================================
-- 4. SUB_MODULE_RECORDS TABLE
-- ============================================================================
ALTER TABLE public.sub_module_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sub_module_records_select" ON public.sub_module_records FOR SELECT
USING (tenant_id = current_tenant_id());

CREATE POLICY "sub_module_records_insert" ON public.sub_module_records FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "sub_module_records_update" ON public.sub_module_records FOR UPDATE
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "sub_module_records_delete" ON public.sub_module_records FOR DELETE
USING (tenant_id = current_tenant_id());

-- ============================================================================
-- 5. DASHBOARDS TABLE
-- ============================================================================
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboards_select" ON public.dashboards FOR SELECT
USING (tenant_id = current_tenant_id());

CREATE POLICY "dashboards_insert" ON public.dashboards FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "dashboards_update" ON public.dashboards FOR UPDATE
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "dashboards_delete" ON public.dashboards FOR DELETE
USING (tenant_id = current_tenant_id());

-- ============================================================================
-- 6. DASHBOARD_WIDGETS TABLE
-- ============================================================================
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_widgets_select" ON public.dashboard_widgets FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = current_tenant_id()
    )
);

CREATE POLICY "dashboard_widgets_insert" ON public.dashboard_widgets FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = current_tenant_id()
    )
);

CREATE POLICY "dashboard_widgets_update" ON public.dashboard_widgets FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = current_tenant_id()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = current_tenant_id()
    )
);

CREATE POLICY "dashboard_widgets_delete" ON public.dashboard_widgets FOR DELETE
USING (
    EXISTS (
        SELECT 1 FROM public.dashboards d
        WHERE d.id = dashboard_widgets.dashboard_id
        AND d.tenant_id = current_tenant_id()
    )
);

-- ============================================================================
-- 7. ATTACHMENTS TABLE
-- ============================================================================
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attachments_select" ON public.attachments FOR SELECT
USING (tenant_id = current_tenant_id());

CREATE POLICY "attachments_insert" ON public.attachments FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "attachments_update" ON public.attachments FOR UPDATE
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "attachments_delete" ON public.attachments FOR DELETE
USING (tenant_id = current_tenant_id());

-- ============================================================================
-- 8. COMMENTS TABLE
-- ============================================================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments_select" ON public.comments FOR SELECT
USING (tenant_id = current_tenant_id());

CREATE POLICY "comments_insert" ON public.comments FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "comments_update" ON public.comments FOR UPDATE
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "comments_delete" ON public.comments FOR DELETE
USING (tenant_id = current_tenant_id());

-- ============================================================================
-- 9. RECORD_RELATIONSHIPS TABLE
-- ============================================================================
ALTER TABLE public.record_relationships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "record_relationships_select" ON public.record_relationships FOR SELECT
USING (tenant_id = current_tenant_id());

CREATE POLICY "record_relationships_insert" ON public.record_relationships FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "record_relationships_update" ON public.record_relationships FOR UPDATE
USING (tenant_id = current_tenant_id())
WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY "record_relationships_delete" ON public.record_relationships FOR DELETE
USING (tenant_id = current_tenant_id());

-- ============================================================================
-- 10. RECORD_ACTIVITY TABLE
-- ============================================================================
ALTER TABLE public.record_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "record_activity_select" ON public.record_activity FOR SELECT
USING (tenant_id = current_tenant_id());

CREATE POLICY "record_activity_insert" ON public.record_activity FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Should return your profile
SELECT 'Test 1: User can read own profile' as test, COUNT(*) as count FROM public.user_profiles WHERE id = auth.uid();

-- Should return records from your tenant only
SELECT 'Test 2: User can read tenant records' as test, COUNT(*) as count FROM public.sub_module_records WHERE tenant_id = current_tenant_id();
