-- Add Test Users for TenantFlow SaaS

-- Test Users to be created in Supabase Auth:
-- 1. admin@test.com / password: Admin@123456
-- 2. manager@test.com / password: Manager@123456
-- 3. user1@test.com / password: User@123456
-- 4. user2@test.com / password: User@123456
-- 5. viewer@test.com / password: Viewer@123456

-- Note: These UUIDs should be replaced with actual Supabase auth IDs after user creation
-- Run this script after creating users in Supabase Auth console or via SQL

-- Test User Profiles (Update UUIDs based on actual auth user IDs)
INSERT INTO user_profiles (id, full_name, avatar_url, phone_number, role_code, status) VALUES
-- Admin User
('550e8400-e29b-41d4-a716-446655440000', 'Admin User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', '+1-555-2001', 'admin', 'active'),
-- Manager Users
('550e8400-e29b-41d4-a716-446655440001', 'Manager User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager', '+1-555-2002', 'manager', 'active'),
-- Standard Users
('550e8400-e29b-41d4-a716-446655440002', 'Staff User 1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff1', '+1-555-2003', 'user', 'active'),
('550e8400-e29b-41d4-a716-446655440003', 'Staff User 2', 'https://api.dicebear.com/7.x/avataaars/svg?seed=staff2', '+1-555-2004', 'user', 'active'),
-- Viewer User
('550e8400-e29b-41d4-a716-446655440004', 'Viewer User', 'https://api.dicebear.com/7.x/avataaars/svg?seed=viewer', '+1-555-2005', 'viewer', 'active')
ON CONFLICT (id) DO NOTHING;

-- Assign test users to first tenant
-- Admin gets full access
INSERT INTO tenant_users (tenant_id, user_id, role) VALUES
((SELECT id FROM tenants LIMIT 1), '550e8400-e29b-41d4-a716-446655440000', 'admin')
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- Manager gets manager role
INSERT INTO tenant_users (tenant_id, user_id, role) VALUES
((SELECT id FROM tenants LIMIT 1), '550e8400-e29b-41d4-a716-446655440001', 'manager')
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- Staff users get user role
INSERT INTO tenant_users (tenant_id, user_id, role) VALUES
((SELECT id FROM tenants LIMIT 1), '550e8400-e29b-41d4-a716-446655440002', 'user'),
((SELECT id FROM tenants LIMIT 1), '550e8400-e29b-41d4-a716-446655440003', 'user'),
((SELECT id FROM tenants LIMIT 1), '550e8400-e29b-41d4-a716-446655440004', 'viewer')
ON CONFLICT (tenant_id, user_id) DO NOTHING;
