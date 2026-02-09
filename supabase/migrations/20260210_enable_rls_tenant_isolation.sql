-- RLS for module tables (modify based on your actual schema)
-- Only apply if the columns exist

-- Enable RLS on main_modules table
DO $$ 
BEGIN
  ALTER TABLE main_modules ENABLE ROW LEVEL SECURITY;
  
  CREATE POLICY "Users see tenant modules" ON main_modules
    FOR SELECT USING (
      tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    );

  CREATE POLICY "Admins manage tenant modules" ON main_modules
    FOR ALL USING (
      tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
      AND (SELECT role_code FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    );
EXCEPTION WHEN undefined_column THEN
  RAISE WARNING 'Column tenant_id not found in main_modules, skipping RLS setup';
WHEN undefined_table THEN
  RAISE WARNING 'Table main_modules not found, skipping RLS setup';
END $$;

-- Allow SELECT on main_modules for authenticated users
DO $$ 
BEGIN
  GRANT SELECT ON main_modules TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on sub_modules table (no tenant_id directly)
DO $$ 
BEGIN
  ALTER TABLE sub_modules ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see tenant sub_modules" ON sub_modules
    FOR SELECT USING (
      main_module_id IN (
        SELECT id FROM main_modules 
        WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
      )
    );

  CREATE POLICY "Users manage tenant sub_modules" ON sub_modules
    FOR ALL USING (
      main_module_id IN (
        SELECT id FROM main_modules 
        WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on sub_modules: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON sub_modules TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on module_fields table
DO $$ 
BEGIN
  ALTER TABLE module_fields ENABLE ROW LEVEL SECURITY;

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

  CREATE POLICY "Users manage tenant module_fields" ON module_fields
    FOR ALL USING (
      sub_module_id IN (
        SELECT id FROM sub_modules
        WHERE main_module_id IN (
          SELECT id FROM main_modules 
          WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
        )
      )
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on module_fields: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON module_fields TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on records table
DO $$ 
BEGIN
  ALTER TABLE records ENABLE ROW LEVEL SECURITY;

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
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on records: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON records TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on dashboards table (if it exists and has tenant_id)
DO $$ 
BEGIN
  ALTER TABLE dashboards ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see tenant dashboards" ON dashboards
    FOR SELECT USING (
      tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    );

  CREATE POLICY "Users manage tenant dashboards" ON dashboards
    FOR ALL USING (
      tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on dashboards: %', SQLERRM;
END $$;

DO $$ 
BEGIN
  GRANT SELECT, INSERT, UPDATE, DELETE ON dashboards TO authenticated;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Enable RLS on widgets table
DO $$ 
BEGIN
  ALTER TABLE widgets ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Users see tenant widgets" ON widgets
    FOR SELECT USING (
      dashboard_id IN (
        SELECT id FROM dashboards
        WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
      )
    );

  CREATE POLICY "Users manage tenant widgets" ON widgets
    FOR ALL USING (
      dashboard_id IN (
        SELECT id FROM dashboards
        WHERE tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
      )
    );
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Error setting RLS on widgets: %', SQLERRM;
END $$;
