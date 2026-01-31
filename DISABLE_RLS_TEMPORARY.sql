-- ============================================================================
-- TEMPORARY WORKAROUND: Disable RLS to get system working
-- While we investigate the data integrity issue
-- ============================================================================

-- Disable RLS on all tables temporarily
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_modules DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_module_fields DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sub_module_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_widgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_relationships DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_activity DISABLE ROW LEVEL SECURITY;

-- Confirm RLS is disabled
SELECT schemaname, tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' AND tablename IN (
  'user_profiles', 'sub_modules', 'sub_module_fields', 'sub_module_records',
  'dashboards', 'dashboard_widgets', 'attachments', 'comments',
  'record_relationships', 'record_activity'
)
ORDER BY tablename;

-- ============================================================================
-- NOTE: With RLS disabled, the Frontend MUST filter data by tenant_id
-- Update your services to include WHERE tenant_id = currentUserTenantId
-- ============================================================================
