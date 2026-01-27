-- Create user profiles for existing auth users
-- This migration automatically creates user_profiles entries for any auth.users
-- that don't already have profiles

-- First, ensure the test tenant exists
INSERT INTO tenants (name, code, status, subscription_plan)
VALUES ('Default Tenant', 'default-tenant', 'active', 'professional')
ON CONFLICT (code) DO NOTHING;

-- Get the default tenant ID for use in the next step
-- Now create user profiles for all auth users that don't have profiles yet
INSERT INTO user_profiles (id, tenant_id, full_name, email, avatar_url, role_code, permissions, notification_preferences)
SELECT 
    u.id,
    (SELECT id FROM tenants WHERE code = 'default-tenant' LIMIT 1),
    SPLIT_PART(u.email, '@', 1),
    u.email,
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || SPLIT_PART(u.email, '@', 1),
    CASE 
        WHEN u.email = 'admin@test.com' THEN 'admin'
        WHEN u.email = 'manager@test.com' THEN 'manager'
        WHEN u.email = 'viewer@test.com' THEN 'viewer'
        ELSE 'user'
    END as role_code,
    '[]'::jsonb,
    '{}'::jsonb
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.id = u.id
);

-- Verify profiles were created
-- Run this query to check: SELECT id, full_name, email, role_code FROM user_profiles;
