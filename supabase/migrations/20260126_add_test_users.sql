-- Add Test Users for TenantFlow SaaS

-- Test Users to be created in Supabase Auth:
-- 1. admin@test.com / password: Admin@123456
-- 2. manager@test.com / password: Manager@123456
-- 3. user1@test.com / password: User@123456
-- 4. user2@test.com / password: User@123456
-- 5. viewer@test.com / password: Viewer@123456

-- Note: These UUIDs should be replaced with actual Supabase auth IDs after user creation
-- Run this script after creating users in Supabase Auth console or via SQL

-- First, get the first tenant ID (or create one if needed)
DO $$ 
DECLARE
    v_tenant_id UUID;
BEGIN
    -- Get first tenant ID
    SELECT id INTO v_tenant_id FROM tenants LIMIT 1;
    
    IF v_tenant_id IS NULL THEN
        INSERT INTO tenants (name, code, status, subscription_plan)
        VALUES ('Test Tenant', 'test-tenant', 'active', 'professional')
        RETURNING id INTO v_tenant_id;
    END IF;

    -- Test User Profiles (Update UUIDs based on actual auth user IDs)
    INSERT INTO user_profiles (id, tenant_id, full_name, email, avatar_url, role_code) VALUES
    -- Admin User
    ('550e8400-e29b-41d4-a716-446655440000', v_tenant_id, 'Admin User', 'admin@test.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 'admin'),
    -- Manager Users
    ('550e8400-e29b-41d4-a716-446655440001', v_tenant_id, 'Manager User', 'manager@test.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager', 'manager'),
    -- Standard Users
    ('550e8400-e29b-41d4-a716-446655440002', v_tenant_id, 'Staff User 1', 'user1@test.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff1', 'user'),
    ('550e8400-e29b-41d4-a716-446655440003', v_tenant_id, 'Staff User 2', 'user2@test.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff2', 'user'),
    -- Viewer User
    ('550e8400-e29b-41d4-a716-446655440004', v_tenant_id, 'Viewer User', 'viewer@test.com', 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer', 'viewer')
    ON CONFLICT (id) DO NOTHING;

END $$;
