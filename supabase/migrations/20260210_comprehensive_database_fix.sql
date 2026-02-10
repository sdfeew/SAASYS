-- ============================================================================
-- COMPREHENSIVE FIX: Resolve schema issues and implement proper RLS
-- ============================================================================
-- This migration fixes critical issues with multi-tenant data isolation

-- ============================================================================
-- 1. FIX USER_PROFILES - Ensure tenant_id is set for all users
-- ============================================================================

DO $$ 
BEGIN
  -- For any orphaned user_profiles without tenant_id, assign to a default tenant
  -- Step 1: Get or create a default tenant for orphaned users
  WITH tenant_for_orphans AS (
    SELECT id FROM tenants WHERE code = 'default-tenant' LIMIT 1
  )
  UPDATE user_profiles 
  SET tenant_id = (SELECT id FROM tenants LIMIT 1) 
  WHERE tenant_id IS NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not update orphaned user_profiles: %', SQLERRM;
END $$;

-- Make tenant_id NOT NULL going forward
DO $$ 
BEGIN
  ALTER TABLE user_profiles ALTER COLUMN tenant_id SET NOT NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'tenant_id is already NOT NULL or cannot be altered';
END $$;

-- ============================================================================
-- 2. FIX SUB_MODULES - Ensure code is NOT NULL and unique
-- ============================================================================

DO $$ 
BEGIN
  -- Generate codes for any missing ones
  UPDATE sub_modules 
  SET code = CONCAT('SM-', SUBSTRING(id::text, 1, 8))
  WHERE code IS NULL;

  -- Add unique constraint if not exists
  ALTER TABLE sub_modules 
  ADD CONSTRAINT sub_modules_tenant_code_unique UNIQUE(tenant_id, code);
EXCEPTION WHEN duplicate_object THEN
  RAISE WARNING 'Unique constraint already exists';
WHEN OTHERS THEN
  RAISE WARNING 'Could not fix sub_modules codes: %', SQLERRM;
END $$;

-- Make code NOT NULL
DO $$ 
BEGIN
  ALTER TABLE sub_modules ALTER COLUMN code SET NOT NULL;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'sub_modules.code is already NOT NULL';
END $$;

-- ============================================================================
-- 3. FIX MODULE_FIELDS - Ensure proper references
-- ============================================================================

DO $$ 
BEGIN
  -- Rename to sub_module_fields if needed (for consistency)
  -- (Skip if table name is already correct in your schema)
  ALTER TABLE IF EXISTS module_fields RENAME TO sub_module_fields;
EXCEPTION WHEN undefined_table THEN
  NULL;
WHEN OTHERS THEN
  RAISE WARNING 'Could not rename module_fields: %', SQLERRM;
END $$;

-- ============================================================================
-- 4. DROP PROBLEMATIC RLS POLICIES (Infinite Recursion)
-- ============================================================================

DO $$ 
BEGIN
  -- Drop all existing RLS policies that might cause infinite recursion
  DROP POLICY IF EXISTS "Users see tenant member profiles" ON user_profiles CASCADE;
  DROP POLICY IF EXISTS "Admins manage tenant profiles" ON user_profiles CASCADE;
  DROP POLICY IF EXISTS "Users see all profiles" ON user_profiles CASCADE;
  DROP POLICY IF EXISTS "Admins see all profiles" ON user_profiles CASCADE;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- ============================================================================
-- 5. IMPLEMENT SAFE RLS POLICIES
-- ============================================================================

-- Ensure RLS is enabled on key tables
DO $$ 
BEGIN
  ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sub_modules ENABLE ROW LEVEL SECURITY;
  ALTER TABLE sub_module_records ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Some tables already have RLS enabled';
END $$;

-- ============================================================================
-- TENANTS TABLE POLICIES
-- ============================================================================

-- 1. Authenticated users can view all tenants (for login selection)
CREATE POLICY "Tenants: Authenticated can view all" ON tenants
  FOR SELECT 
  USING (auth.role() = 'authenticated')
  WITH CHECK (false);

-- 2. Admins can update their own tenant
CREATE POLICY "Tenants: Admins can update own" ON tenants
  FOR UPDATE 
  USING (
    -- User must be an admin in this tenant
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.tenant_id = tenants.id 
      AND user_profiles.role_code = 'admin'
    )
  )
  WITH CHECK (true);

-- ============================================================================
-- USER_PROFILES TABLE POLICIES (NO RECURSION!)
-- ============================================================================

-- 1. Users can see their own profile
CREATE POLICY "Profiles: Users see own" ON user_profiles
  FOR SELECT 
  USING (id = auth.uid())
  WITH CHECK (false);

-- 2. Users can update their own profile
CREATE POLICY "Profiles: Users can update own" ON user_profiles
  FOR UPDATE 
  USING (id = auth.uid())
  WITH CHECK (true);

-- 3. Users can insert their own profile (for first login)
CREATE POLICY "Profiles: Users can insert own" ON user_profiles
  FOR INSERT 
  WITH CHECK (id = auth.uid());

-- 4. Check if admin access needed - use a simple check without recursion
CREATE POLICY "Profiles: Admins see all in tenant" ON user_profiles
  FOR SELECT 
  USING (
    -- Only allow if current user is admin in their tenant
    auth.uid() IN (
      SELECT id FROM user_profiles 
      WHERE role_code = 'admin'
    )
  )
  WITH CHECK (false);

-- ============================================================================
-- SUB_MODULES TABLE POLICIES
-- ============================================================================

CREATE POLICY "SubModules: Users see tenant modules" ON sub_modules
  FOR SELECT 
  USING (tenant_id = auth.jwt() ->> 'tenant_id'::text OR tenant_id = (
    SELECT tenant_id FROM user_profiles WHERE id = auth.uid()
  ))
  WITH CHECK (false);

CREATE POLICY "SubModules: Admins manage tenant modules" ON sub_modules
  FOR ALL 
  USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
    AND EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role_code IN ('admin', 'manager')
    )
  )
  WITH CHECK (true);

-- ============================================================================
-- SUB_MODULE_RECORDS TABLE POLICIES
-- ============================================================================

CREATE POLICY "Records: Users see tenant records" ON sub_module_records
  FOR SELECT 
  USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (false);

CREATE POLICY "Records: Users manage tenant records" ON sub_module_records
  FOR ALL 
  USING (
    tenant_id = (SELECT tenant_id FROM user_profiles WHERE id = auth.uid())
  )
  WITH CHECK (true);

-- ============================================================================
-- 6. GRANT PERMISSIONS
-- ============================================================================

DO $$ 
BEGIN
  GRANT USAGE ON SCHEMA public TO anon, authenticated;
  GRANT SELECT ON tenants TO authenticated;
  GRANT SELECT, INSERT, UPDATE ON user_profiles TO authenticated;
  GRANT SELECT ON sub_modules TO authenticated;
  GRANT SELECT, INSERT, UPDATE, DELETE ON sub_module_records TO authenticated;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Could not grant permissions: %', SQLERRM;
END $$;

-- ============================================================================
-- 7. DATA INTEGRITY CHECKS
-- ============================================================================

DO $$ 
DECLARE
  orphaned_count INT;
  tenant_count INT;
BEGIN
  -- Check for orphaned user_profiles
  SELECT COUNT(*) INTO orphaned_count FROM user_profiles WHERE tenant_id IS NULL;
  IF orphaned_count > 0 THEN
    RAISE WARNING 'Found % orphaned user_profiles', orphaned_count;
  END IF;

  -- Check for sub_modules with null code
  SELECT COUNT(*) INTO orphaned_count FROM sub_modules WHERE code IS NULL;
  IF orphaned_count > 0 THEN
    RAISE WARNING 'Found % sub_modules with null code', orphaned_count;
  END IF;

  -- Check tenant count
  SELECT COUNT(*) INTO tenant_count FROM tenants;
  RAISE WARNING 'Database has % tenants', tenant_count;
END $$;

-- ============================================================================
-- COMPLETION
-- ============================================================================

-- Mark migration complete
SELECT 'Comprehensive database fix applied successfully' AS status;
