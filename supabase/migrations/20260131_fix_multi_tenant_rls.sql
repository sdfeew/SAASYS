-- ============================================================================
-- FIX MULTI-TENANT DATA ISOLATION - RLS POLICIES
-- Date: 2026-01-31
-- ============================================================================
-- This migration fixes the critical issue where all tenants can see each
-- other's data. We implement proper Row Level Security policies.
-- ============================================================================

-- Drop old function if it exists
DROP FUNCTION IF EXISTS public.current_tenant_id();

-- Helper function to get current user's tenant_id (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.get_current_tenant_id() RETURNS UUID AS $$
  SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 1. USER_PROFILES TABLE - Allow users to see profiles in their tenant only
-- ============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_select_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_select_tenant" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own" ON public.user_profiles;
DROP POLICY IF EXISTS "users_delete_own" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles;

-- Users can view their own profile OR profiles in their tenant
CREATE POLICY "user_profiles_select" ON public.user_profiles FOR SELECT
USING (auth.uid() = id OR tenant_id = get_current_tenant_id());

-- Users can update their own profile
CREATE POLICY "user_profiles_update" ON public.user_profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- System can insert new profiles (via trigger from auth.users)
CREATE POLICY "user_profiles_insert" ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "user_profiles_delete" ON public.user_profiles FOR DELETE
USING (auth.uid() = id);

-- ============================================================================
-- 2. SUB_MODULES TABLE - Tenant isolation
-- ============================================================================
ALTER TABLE public.sub_modules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sub_modules_select" ON public.sub_modules;
DROP POLICY IF EXISTS "sub_modules_insert" ON public.sub_modules;
DROP POLICY IF EXISTS "sub_modules_update" ON public.sub_modules;
DROP POLICY IF EXISTS "sub_modules_delete" ON public.sub_modules;

-- Users can view sub_modules in their tenant only
CREATE POLICY "sub_modules_select" ON public.sub_modules FOR SELECT
USING (tenant_id = get_current_tenant_id());

-- Users can create sub_modules in their tenant
CREATE POLICY "sub_modules_insert" ON public.sub_modules FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

-- Users can update sub_modules in their tenant
CREATE POLICY "sub_modules_update" ON public.sub_modules FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

-- Users can delete sub_modules in their tenant
CREATE POLICY "sub_modules_delete" ON public.sub_modules FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- 3. SUB_MODULE_FIELDS TABLE - Tenant isolation
-- ============================================================================
ALTER TABLE public.sub_module_fields ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "fields_select" ON public.sub_module_fields;
DROP POLICY IF EXISTS "fields_insert" ON public.sub_module_fields;
DROP POLICY IF EXISTS "fields_update" ON public.sub_module_fields;
DROP POLICY IF EXISTS "fields_delete" ON public.sub_module_fields;

-- Users can view fields in their tenant only
CREATE POLICY "sub_module_fields_select" ON public.sub_module_fields FOR SELECT
USING (tenant_id = get_current_tenant_id());

-- Users can create fields in their tenant
CREATE POLICY "sub_module_fields_insert" ON public.sub_module_fields FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

-- Users can update fields in their tenant
CREATE POLICY "sub_module_fields_update" ON public.sub_module_fields FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

-- Users can delete fields in their tenant
CREATE POLICY "sub_module_fields_delete" ON public.sub_module_fields FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- 4. SUB_MODULE_RECORDS TABLE - Tenant isolation (CRITICAL)
-- ============================================================================
ALTER TABLE public.sub_module_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "records_select" ON public.sub_module_records;
DROP POLICY IF EXISTS "records_insert" ON public.sub_module_records;
DROP POLICY IF EXISTS "records_update" ON public.sub_module_records;
DROP POLICY IF EXISTS "records_delete" ON public.sub_module_records;

-- Users can view records only in their tenant
CREATE POLICY "sub_module_records_select" ON public.sub_module_records FOR SELECT
USING (tenant_id = get_current_tenant_id());

-- Users can create records only in their tenant
CREATE POLICY "sub_module_records_insert" ON public.sub_module_records FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

-- Users can update records only in their tenant
CREATE POLICY "sub_module_records_update" ON public.sub_module_records FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

-- Users can delete records only in their tenant
CREATE POLICY "sub_module_records_delete" ON public.sub_module_records FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- 5. DASHBOARDS TABLE - Tenant isolation
-- ============================================================================
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboards_select" ON public.dashboards;
DROP POLICY IF EXISTS "dashboards_insert" ON public.dashboards;
DROP POLICY IF EXISTS "dashboards_update" ON public.dashboards;
DROP POLICY IF EXISTS "dashboards_delete" ON public.dashboards;

CREATE POLICY "dashboards_select" ON public.dashboards FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "dashboards_insert" ON public.dashboards FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "dashboards_update" ON public.dashboards FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "dashboards_delete" ON public.dashboards FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- 6. DASHBOARD_WIDGETS TABLE - Tenant isolation
-- ============================================================================
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboard_widgets_select" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "dashboard_widgets_insert" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "dashboard_widgets_update" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "dashboard_widgets_delete" ON public.dashboard_widgets;

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

-- ============================================================================
-- 7. ATTACHMENTS TABLE - Tenant isolation
-- ============================================================================
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "attachments_select" ON public.attachments;
DROP POLICY IF EXISTS "attachments_insert" ON public.attachments;
DROP POLICY IF EXISTS "attachments_update" ON public.attachments;
DROP POLICY IF EXISTS "attachments_delete" ON public.attachments;

CREATE POLICY "attachments_select" ON public.attachments FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "attachments_insert" ON public.attachments FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "attachments_update" ON public.attachments FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "attachments_delete" ON public.attachments FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- 8. COMMENTS TABLE - Tenant isolation
-- ============================================================================
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "comments_select" ON public.comments;
DROP POLICY IF EXISTS "comments_insert" ON public.comments;
DROP POLICY IF EXISTS "comments_update" ON public.comments;
DROP POLICY IF EXISTS "comments_delete" ON public.comments;

CREATE POLICY "comments_select" ON public.comments FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "comments_insert" ON public.comments FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "comments_update" ON public.comments FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "comments_delete" ON public.comments FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- 9. RECORD_RELATIONSHIPS TABLE - Tenant isolation
-- ============================================================================
ALTER TABLE public.record_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "record_relationships_select" ON public.record_relationships;
DROP POLICY IF EXISTS "record_relationships_insert" ON public.record_relationships;
DROP POLICY IF EXISTS "record_relationships_update" ON public.record_relationships;
DROP POLICY IF EXISTS "record_relationships_delete" ON public.record_relationships;

CREATE POLICY "record_relationships_select" ON public.record_relationships FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "record_relationships_insert" ON public.record_relationships FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "record_relationships_update" ON public.record_relationships FOR UPDATE
USING (tenant_id = get_current_tenant_id())
WITH CHECK (tenant_id = get_current_tenant_id());

CREATE POLICY "record_relationships_delete" ON public.record_relationships FOR DELETE
USING (tenant_id = get_current_tenant_id());

-- ============================================================================
-- 10. RECORD_ACTIVITY TABLE - Tenant isolation
-- ============================================================================
ALTER TABLE public.record_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "record_activity_select" ON public.record_activity;
DROP POLICY IF EXISTS "record_activity_insert" ON public.record_activity;

CREATE POLICY "record_activity_select" ON public.record_activity FOR SELECT
USING (tenant_id = get_current_tenant_id());

CREATE POLICY "record_activity_insert" ON public.record_activity FOR INSERT
WITH CHECK (tenant_id = get_current_tenant_id());

-- NOTE: tables and notifications tables are not used in this schema
-- If you have these tables, please run the RLS setup for them separately

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the RLS is working correctly:

-- 1. Check that RLS is enabled on all tables:
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables 
-- WHERE schemaname = 'public' AND tablename NOT LIKE 'pg_%'
-- ORDER BY tablename;

-- 2. Check policies on a specific table:
-- SELECT policyname, permissive, roles, qual, with_check FROM pg_policies 
-- WHERE schemaname = 'public' AND tablename = 'sub_module_records';

-- 3. Test that users only see their tenant's data:
-- SELECT COUNT(*) FROM public.sub_module_records WHERE tenant_id = current_tenant_id();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
