-- ============================================================================
-- COMPLETE RESET: Drop policies, drop function, recreate function, recreate policies
-- ============================================================================

-- STEP 1: Drop ALL policies from all tables (they depend on the function)
DROP POLICY IF EXISTS "user_profiles_select" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "user_profiles_update" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "user_profiles_insert" ON public.user_profiles CASCADE;
DROP POLICY IF EXISTS "user_profiles_delete" ON public.user_profiles CASCADE;

DROP POLICY IF EXISTS "sub_modules_select" ON public.sub_modules CASCADE;
DROP POLICY IF EXISTS "sub_modules_insert" ON public.sub_modules CASCADE;
DROP POLICY IF EXISTS "sub_modules_update" ON public.sub_modules CASCADE;
DROP POLICY IF EXISTS "sub_modules_delete" ON public.sub_modules CASCADE;

DROP POLICY IF EXISTS "sub_module_fields_select" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "sub_module_fields_insert" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "sub_module_fields_update" ON public.sub_module_fields CASCADE;
DROP POLICY IF EXISTS "sub_module_fields_delete" ON public.sub_module_fields CASCADE;

DROP POLICY IF EXISTS "sub_module_records_select" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "sub_module_records_insert" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "sub_module_records_update" ON public.sub_module_records CASCADE;
DROP POLICY IF EXISTS "sub_module_records_delete" ON public.sub_module_records CASCADE;

DROP POLICY IF EXISTS "dashboards_select" ON public.dashboards CASCADE;
DROP POLICY IF EXISTS "dashboards_insert" ON public.dashboards CASCADE;
DROP POLICY IF EXISTS "dashboards_update" ON public.dashboards CASCADE;
DROP POLICY IF EXISTS "dashboards_delete" ON public.dashboards CASCADE;

DROP POLICY IF EXISTS "dashboard_widgets_select" ON public.dashboard_widgets CASCADE;
DROP POLICY IF EXISTS "dashboard_widgets_insert" ON public.dashboard_widgets CASCADE;
DROP POLICY IF EXISTS "dashboard_widgets_update" ON public.dashboard_widgets CASCADE;
DROP POLICY IF EXISTS "dashboard_widgets_delete" ON public.dashboard_widgets CASCADE;

DROP POLICY IF EXISTS "attachments_select" ON public.attachments CASCADE;
DROP POLICY IF EXISTS "attachments_insert" ON public.attachments CASCADE;
DROP POLICY IF EXISTS "attachments_update" ON public.attachments CASCADE;
DROP POLICY IF EXISTS "attachments_delete" ON public.attachments CASCADE;

DROP POLICY IF EXISTS "comments_select" ON public.comments CASCADE;
DROP POLICY IF EXISTS "comments_insert" ON public.comments CASCADE;
DROP POLICY IF EXISTS "comments_update" ON public.comments CASCADE;
DROP POLICY IF EXISTS "comments_delete" ON public.comments CASCADE;

DROP POLICY IF EXISTS "record_relationships_select" ON public.record_relationships CASCADE;
DROP POLICY IF EXISTS "record_relationships_insert" ON public.record_relationships CASCADE;
DROP POLICY IF EXISTS "record_relationships_update" ON public.record_relationships CASCADE;
DROP POLICY IF EXISTS "record_relationships_delete" ON public.record_relationships CASCADE;

DROP POLICY IF EXISTS "record_activity_select" ON public.record_activity CASCADE;
DROP POLICY IF EXISTS "record_activity_insert" ON public.record_activity CASCADE;

-- STEP 2: Drop the function (now that policies are gone)
DROP FUNCTION IF EXISTS public.current_tenant_id() CASCADE;

-- STEP 3: Create the NEW function (PL/pgSQL with SECURITY DEFINER)
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_tenant_id() TO anon;

-- STEP 4: Test the new function BEFORE creating policies
SELECT 'Test current_tenant_id()' as test, current_tenant_id() as tenant_id;

-- ============================================================================
-- STEP 5: Recreate ALL RLS policies
-- ============================================================================

-- USER_PROFILES
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

-- SUB_MODULES
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

-- SUB_MODULE_FIELDS
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

-- SUB_MODULE_RECORDS
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

-- DASHBOARDS
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

-- DASHBOARD_WIDGETS
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

-- ATTACHMENTS
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

-- COMMENTS
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

-- RECORD_RELATIONSHIPS
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

-- RECORD_ACTIVITY
ALTER TABLE public.record_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "record_activity_select" ON public.record_activity FOR SELECT
USING (tenant_id = current_tenant_id());

CREATE POLICY "record_activity_insert" ON public.record_activity FOR INSERT
WITH CHECK (tenant_id = current_tenant_id());

-- ============================================================================
-- STEP 6: Test RLS is working
-- ============================================================================

SELECT 'Final test: User profile count' as test, COUNT(*) as count FROM public.user_profiles WHERE id = auth.uid();

SELECT 'Final test: Tenant records count' as test, COUNT(*) as count FROM public.sub_module_records WHERE tenant_id = current_tenant_id();
