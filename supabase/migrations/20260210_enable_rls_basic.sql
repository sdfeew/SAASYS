-- Simpler RLS migration - only for tables that exist with tenant_id
-- Disable this if you face errors and run it manually with correct table structure

-- Enable RLS on tenants table
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

-- Enable RLS on user_profiles table
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

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.tenants TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
