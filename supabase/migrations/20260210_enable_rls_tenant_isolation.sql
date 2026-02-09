-- RLS for core tables with better initial setup
-- These policies are designed to work from first login

-- Enable RLS on tenants table (if not already enabled)
DO $$
BEGIN
  ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Authenticated users can see all tenants (for login/selection)
DO $$
BEGIN
  CREATE POLICY "Authenticated users see all tenants" ON public.tenants
    FOR SELECT USING (auth.role() = 'authenticated');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Users can update their own tenant if they're admin
DO $$
BEGIN
  CREATE POLICY "Admins update own tenant" ON public.tenants
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE user_profiles.id = auth.uid()
        AND user_profiles.tenant_id = public.tenants.id
        AND user_profiles.role_code = 'admin'
      )
    );
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on user_profiles table (if not already enabled)
DO $$
BEGIN
  ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Users can see their own profile
DO $$
BEGIN
  CREATE POLICY "Users see own profile" ON public.user_profiles
    FOR SELECT USING (id = auth.uid());
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Users can see other profiles in their tenant
DO $$
BEGIN
  CREATE POLICY "Users see tenant member profiles" ON public.user_profiles
    FOR SELECT USING (
      tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Users can insert their own profile (first login)
DO $$
BEGIN
  CREATE POLICY "Users insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Users can update their own profile
DO $$
BEGIN
  CREATE POLICY "Users update own profile" ON public.user_profiles
    FOR UPDATE USING (id = auth.uid());
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Admins can manage profiles in their tenant
DO $$
BEGIN
  CREATE POLICY "Admins manage tenant profiles" ON public.user_profiles
    FOR ALL USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid()
        AND up.tenant_id = public.user_profiles.tenant_id
        AND up.role_code = 'admin'
      )
    );
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- RLS for module tables (modify based on your actual schema)
-- Only apply if the columns exist

-- Enable RLS on main_modules table
DO $$ 
BEGIN
  ALTER TABLE public.main_modules ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users see tenant modules" ON public.main_modules
    FOR SELECT USING (
      tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
    );

  CREATE POLICY "Admins manage tenant modules" ON public.main_modules
    FOR ALL USING (
      tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
      AND (SELECT role_code FROM public.user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    );
EXCEPTION WHEN undefined_column THEN
  RAISE WARNING 'Column tenant_id not found in main_modules, skipping RLS setup';
WHEN undefined_table THEN
  RAISE WARNING 'Table main_modules not found, skipping RLS setup';
END $$;

-- Allow SELECT on main_modules for authenticated users
DO $$ 
BEGIN
  GRANT SELECT ON public.main_modules TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on sub_modules table (no tenant_id directly)
DO $$ 
BEGIN
  ALTER TABLE public.sub_modules ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see tenant sub_modules" ON public.sub_modules
    FOR SELECT USING (
      main_module_id IN (
        SELECT id FROM public.main_modules 
        WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
      )
    );

  CREATE POLICY "Users manage tenant sub_modules" ON public.sub_modules
    FOR ALL USING (
      main_module_id IN (
        SELECT id FROM public.main_modules 
        WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on sub_modules: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.sub_modules TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on module_fields table
DO $$ 
BEGIN
  ALTER TABLE public.module_fields ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see tenant module_fields" ON public.module_fields
    FOR SELECT USING (
      sub_module_id IN (
        SELECT id FROM public.sub_modules
        WHERE main_module_id IN (
          SELECT id FROM public.main_modules 
          WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        )
      )
    );

  CREATE POLICY "Users manage tenant module_fields" ON public.module_fields
    FOR ALL USING (
      sub_module_id IN (
        SELECT id FROM public.sub_modules
        WHERE main_module_id IN (
          SELECT id FROM public.main_modules 
          WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        )
      )
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on module_fields: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_fields TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on records table
DO $$ 
BEGIN
  ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see tenant records" ON public.records
    FOR SELECT USING (
      sub_module_id IN (
        SELECT id FROM public.sub_modules
        WHERE main_module_id IN (
          SELECT id FROM public.main_modules 
          WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        )
      )
    );

  CREATE POLICY "Users manage tenant records" ON public.records
    FOR ALL USING (
      sub_module_id IN (
        SELECT id FROM public.sub_modules
        WHERE main_module_id IN (
          SELECT id FROM public.main_modules 
          WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
        )
      )
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on records: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.records TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on dashboards table (if it exists and has tenant_id)
DO $$ 
BEGIN
  ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see tenant dashboards" ON public.dashboards
    FOR SELECT USING (
      tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
    );

  CREATE POLICY "Users manage tenant dashboards" ON public.dashboards
    FOR ALL USING (
      tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on dashboards: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON public.dashboards TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on widgets table
DO $$ 
BEGIN
  ALTER TABLE public.widgets ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see tenant widgets" ON public.widgets
    FOR SELECT USING (
      dashboard_id IN (
        SELECT id FROM public.dashboards
        WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
      )
    );

  CREATE POLICY "Users manage tenant widgets" ON public.widgets
    FOR ALL USING (
      dashboard_id IN (
        SELECT id FROM public.dashboards
        WHERE tenant_id = (SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on widgets: %', SQLERRM;
END $$;
