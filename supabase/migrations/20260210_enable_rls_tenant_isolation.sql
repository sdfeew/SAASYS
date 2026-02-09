-- Enable RLS for proper tenant data isolation
-- This ensures users only see data from their own tenant

-- 1. Enable RLS on tenants table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- Tenants: Users can only see their own tenant
CREATE POLICY "Users see own tenant" ON tenants
  FOR SELECT USING (
    id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

-- Admins can update their own tenant
CREATE POLICY "Admins update own tenant" ON tenants
  FOR UPDATE USING (
    id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role_code FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- 2. Enable RLS on user_profiles table
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can see profiles in their tenant
CREATE POLICY "Users see tenant profiles" ON user_profiles
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (
    id = auth.uid()
  );

-- Admins can update profiles in their tenant
CREATE POLICY "Admins update tenant profiles" ON user_profiles
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role_code FROM user_profiles WHERE id = auth.uid()) = 'admin'
  );

-- 3. Enable RLS on main_modules table
ALTER TABLE main_modules ENABLE ROW LEVEL SECURITY;

-- Users can only see modules in their tenant
CREATE POLICY "Users see tenant modules" ON main_modules
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

-- Admins can manage modules in their tenant
CREATE POLICY "Admins manage tenant modules" ON main_modules
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    AND (SELECT role_code FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
  );

-- 4. Enable RLS on sub_modules table
ALTER TABLE sub_modules ENABLE ROW LEVEL SECURITY;

-- Users can only see sub-modules for their tenant (through main_module)
CREATE POLICY "Users see tenant sub_modules" ON sub_modules
  FOR SELECT USING (
    main_module_id IN (
      SELECT id FROM main_modules 
      WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Admins can manage sub-modules in their tenant
CREATE POLICY "Admins manage tenant sub_modules" ON sub_modules
  FOR ALL USING (
    main_module_id IN (
      SELECT id FROM main_modules 
      WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
      AND (SELECT role_code FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    )
  );

-- 5. Enable RLS on module_fields table
ALTER TABLE module_fields ENABLE ROW LEVEL SECURITY;

-- Users can only see fields for their tenant's modules
CREATE POLICY "Users see tenant module_fields" ON module_fields
  FOR SELECT USING (
    sub_module_id IN (
      SELECT id FROM sub_modules
      WHERE main_module_id IN (
        SELECT id FROM main_modules 
        WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
      )
    )
  );

-- Admins can manage fields in their tenant
CREATE POLICY "Admins manage tenant module_fields" ON module_fields
  FOR ALL USING (
    sub_module_id IN (
      SELECT id FROM sub_modules
      WHERE main_module_id IN (
        SELECT id FROM main_modules 
        WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
        AND (SELECT role_code FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
      )
    )
  );

-- 6. Enable RLS on records table
ALTER TABLE records ENABLE ROW LEVEL SECURITY;

-- Users can only see records for their tenant (through module)
CREATE POLICY "Users see tenant records" ON records
  FOR SELECT USING (
    sub_module_id IN (
      SELECT id FROM sub_modules
      WHERE main_module_id IN (
        SELECT id FROM main_modules 
        WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
      )
    )
  );

-- Users can manage records in their tenant
CREATE POLICY "Users manage tenant records" ON records
  FOR ALL USING (
    sub_module_id IN (
      SELECT id FROM sub_modules
      WHERE main_module_id IN (
        SELECT id FROM main_modules 
        WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
      )
    )
  );

-- 7. Enable RLS on dashboards table (if it exists)
ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

-- Users can only see dashboards in their tenant
CREATE POLICY "Users see tenant dashboards" ON dashboards
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

-- Users can manage dashboards in their tenant
CREATE POLICY "Users manage tenant dashboards" ON dashboards
  FOR ALL USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  );

-- 8. Enable RLS on widgets table (if it exists)
ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

-- Users can only see widgets for dashboards in their tenant
CREATE POLICY "Users see tenant widgets" ON widgets
  FOR SELECT USING (
    dashboard_id IN (
      SELECT id FROM dashboards
      WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Users can manage widgets in their tenant
CREATE POLICY "Users manage tenant widgets" ON widgets
  FOR ALL USING (
    dashboard_id IN (
      SELECT id FROM dashboards
      WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    )
  );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.tenants TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.main_modules TO authenticated;
GRANT ALL ON public.sub_modules TO authenticated;
GRANT ALL ON public.module_fields TO authenticated;
GRANT ALL ON public.records TO authenticated;
GRANT ALL ON public.dashboards TO authenticated;
GRANT ALL ON public.widgets TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE tenants IS 'Multi-tenant table - RLS enforces isolation';
COMMENT ON TABLE user_profiles IS 'User profiles - RLS prevents cross-tenant access';
