-- Add Test Users for TenantFlow SaaS
-- IMPORTANT: This migration should be run AFTER creating auth users via Supabase Dashboard or Admin API
-- See: scripts/create-test-users.js for automated creation

-- Test Users to be created in Supabase Auth:
-- 1. admin@test.com / password: Admin@123456
-- 2. manager@test.com / password: Manager@123456
-- 3. user1@test.com / password: User@123456
-- 4. user2@test.com / password: User@123456
-- 5. viewer@test.com / password: Viewer@123456

-- This script is for MANUAL use only after users are created in auth
-- Replace the UUID values below with actual user IDs from auth.users table

-- Step 1: Ensure test tenant exists
INSERT INTO tenants (name, code, status, subscription_plan)
VALUES ('Test Tenant', 'test-tenant', 'active', 'professional')
ON CONFLICT (code) DO NOTHING;

-- Step 2: Create user profiles for existing auth users
-- Replace these UUIDs with actual auth user IDs from your Supabase Auth
INSERT INTO user_profiles (id, tenant_id, full_name, email, avatar_url, role_code) 
SELECT 
  auth_user.id,
  tenants.id,
  CASE auth_user.email
    WHEN 'admin@test.com' THEN 'Admin User'
    WHEN 'manager@test.com' THEN 'Manager User'
    WHEN 'user1@test.com' THEN 'Staff User 1'
    WHEN 'user2@test.com' THEN 'Staff User 2'
    WHEN 'viewer@test.com' THEN 'Viewer User'
    ELSE 'Test User'
  END as full_name,
  auth_user.email,
  'https://api.dicebear.com/7.x/avataaars/svg?seed=' || REPLACE(auth_user.email, '@test.com', ''),
  CASE auth_user.email
    WHEN 'admin@test.com' THEN 'admin'
    WHEN 'manager@test.com' THEN 'manager'
    WHEN 'user1@test.com' THEN 'user'
    WHEN 'user2@test.com' THEN 'user'
    WHEN 'viewer@test.com' THEN 'viewer'
    ELSE 'user'
  END as role_code
FROM auth.users auth_user
CROSS JOIN tenants
WHERE auth_user.email IN ('admin@test.com', 'manager@test.com', 'user1@test.com', 'user2@test.com', 'viewer@test.com')
  AND tenants.code = 'test-tenant'
ON CONFLICT (id) DO NOTHING;
