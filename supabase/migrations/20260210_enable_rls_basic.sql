-- Simpler RLS migration - only for tables that exist with tenant_id
-- Idempotent: Safe to run multiple times

-- Enable RLS on tenants table
DO $$ 
BEGIN
  ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authenticated users see all tenants" ON tenants CASCADE;
  DROP POLICY IF EXISTS "Admins update own tenant" ON tenants CASCADE;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Authenticated users can see all tenants (for login/selection)
CREATE POLICY "Authenticated users see all tenants" ON tenants
  FOR SELECT USING (
    auth.role() = 'authenticated'
  );

-- Users can update their own tenant if they're admin
CREATE POLICY "Admins update own tenant" ON tenants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.tenant_id = tenants.id
      AND user_profiles.role_code = 'admin'
    )
  );

-- Enable RLS on user_profiles table
DO $$ 
BEGIN
  ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users see own profile" ON user_profiles CASCADE;
  DROP POLICY IF EXISTS "Users see tenant member profiles" ON user_profiles CASCADE;
  DROP POLICY IF EXISTS "Users insert own profile" ON user_profiles CASCADE;
  DROP POLICY IF EXISTS "Users update own profile" ON user_profiles CASCADE;
  DROP POLICY IF EXISTS "Admins manage tenant profiles" ON user_profiles CASCADE;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Users can see their own profile
CREATE POLICY "Users see own profile" ON user_profiles
  FOR SELECT USING (
    id = auth.uid()
  );

-- Users can insert their own profile (first login)
CREATE POLICY "Users insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (
    id = auth.uid()
  );

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (
    id = auth.uid()
  );

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.tenants TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
