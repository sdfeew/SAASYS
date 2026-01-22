-- Seed Sample Data for TenantFlow SaaS

-- 1. Create a test tenant
INSERT INTO tenants (name, description, phone, website, status) VALUES
('Acme Corporation', 'Leading global enterprise for innovative solutions', '+1-555-0100', 'https://acmecorp.com', 'active'),
('TechStart Inc', 'Digital transformation and consulting services', '+1-555-0101', 'https://techstart.com', 'active'),
('Global Trading Co', 'International commerce and logistics', '+1-555-0102', 'https://globaltrading.com', 'active');

-- 2. Get tenant IDs for reference
-- Save these to use in the next queries

-- 3. Create sample user profiles (linked to Supabase auth users)
-- Note: These user_ids should be replaced with actual Supabase auth IDs
INSERT INTO user_profiles (id, full_name, avatar_url, phone_number, role_code, status) VALUES
('user-admin-001', 'John Administrator', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John', '+1-555-1001', 'admin', 'active'),
('user-manager-001', 'Sarah Manager', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', '+1-555-1002', 'manager', 'active'),
('user-staff-001', 'Mike Staff', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', '+1-555-1003', 'user', 'active'),
('user-staff-002', 'Emma Staff', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', '+1-555-1004', 'user', 'active'),
('user-viewer-001', 'Robert Viewer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert', '+1-555-1005', 'viewer', 'active');

-- 4. Create sample sub-modules under main modules
-- HR Module
INSERT INTO sub_modules (main_module_id, tenant_id, name, description, color) 
SELECT id, (SELECT id FROM tenants LIMIT 1), 'Employees', 'Employee information and management', '#3B82F6'
FROM main_modules WHERE name = 'HR' LIMIT 1;

INSERT INTO sub_modules (main_module_id, tenant_id, name, description, color) 
SELECT id, (SELECT id FROM tenants LIMIT 1), 'Departments', 'Organizational departments', '#8B5CF6'
FROM main_modules WHERE name = 'HR' LIMIT 1;

INSERT INTO sub_modules (main_module_id, tenant_id, name, description, color) 
SELECT id, (SELECT id FROM tenants LIMIT 1), 'Payroll', 'Salary and compensation management', '#EC4899'
FROM main_modules WHERE name = 'HR' LIMIT 1;

-- CRM Module
INSERT INTO sub_modules (main_module_id, tenant_id, name, description, color) 
SELECT id, (SELECT id FROM tenants LIMIT 1), 'Contacts', 'Customer and contact information', '#06B6D4'
FROM main_modules WHERE name = 'CRM' LIMIT 1;

INSERT INTO sub_modules (main_module_id, tenant_id, name, description, color) 
SELECT id, (SELECT id FROM tenants LIMIT 1), 'Deals', 'Sales opportunities and pipeline', '#10B981'
FROM main_modules WHERE name = 'CRM' LIMIT 1;

-- INVENTORY Module
INSERT INTO sub_modules (main_module_id, tenant_id, name, description, color) 
SELECT id, (SELECT id FROM tenants LIMIT 1), 'Products', 'Product catalog and information', '#F59E0B'
FROM main_modules WHERE name = 'INVENTORY' LIMIT 1;

INSERT INTO sub_modules (main_module_id, tenant_id, name, description, color) 
SELECT id, (SELECT id FROM tenants LIMIT 1), 'Stock', 'Inventory and stock management', '#EF4444'
FROM main_modules WHERE name = 'INVENTORY' LIMIT 1;

-- SUPPLIERS Module
INSERT INTO sub_modules (main_module_id, tenant_id, name, description, color) 
SELECT id, (SELECT id FROM tenants LIMIT 1), 'Suppliers', 'Supplier information and management', '#6366F1'
FROM main_modules WHERE name = 'SUPPLIERS' LIMIT 1;

-- 5. Create sample fields for Employees module
INSERT INTO sub_module_fields (sub_module_id, name, description, data_type, is_required, is_unique) VALUES
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'employee_id', 'Unique employee identifier', 'TEXT', true, true),
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'first_name', 'First name of employee', 'TEXT', true, false),
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'last_name', 'Last name of employee', 'TEXT', true, false),
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'email', 'Corporate email address', 'EMAIL', true, true),
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'phone', 'Contact phone number', 'PHONE', false, false),
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'position', 'Job title/position', 'TEXT', true, false),
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'department', 'Department name', 'TEXT', true, false),
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'hire_date', 'Employee hire date', 'DATE', true, false),
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'salary', 'Annual salary', 'CURRENCY', false, false),
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 'is_active', 'Employment status', 'BOOLEAN', true, false);

-- 6. Create sample fields for Contacts module (CRM)
INSERT INTO sub_module_fields (sub_module_id, name, description, data_type, is_required, is_unique) VALUES
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 'company_name', 'Company name', 'TEXT', true, false),
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 'contact_name', 'Full name of contact', 'TEXT', true, false),
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 'email', 'Email address', 'EMAIL', true, true),
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 'phone', 'Phone number', 'PHONE', false, false),
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 'position', 'Job title', 'TEXT', false, false),
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 'industry', 'Industry type', 'TEXT', false, false),
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 'website', 'Company website', 'URL', false, false),
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 'revenue', 'Company revenue', 'CURRENCY', false, false);

-- 7. Create sample fields for Products module (INVENTORY)
INSERT INTO sub_module_fields (sub_module_id, name, description, data_type, is_required, is_unique) VALUES
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 'sku', 'Product SKU', 'TEXT', true, true),
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 'product_name', 'Product name', 'TEXT', true, false),
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 'category', 'Product category', 'TEXT', true, false),
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 'description', 'Product description', 'TEXT', false, false),
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 'unit_price', 'Price per unit', 'CURRENCY', true, false),
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 'quantity_in_stock', 'Current stock level', 'NUMBER', true, false),
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 'reorder_level', 'Minimum stock level', 'NUMBER', false, false),
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 'supplier_id', 'Supplier reference', 'REFERENCE', false, false);

-- 8. Create sample Employee records
INSERT INTO sub_module_records (sub_module_id, tenant_id, created_by, data) VALUES
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 
 (SELECT id FROM tenants LIMIT 1),
 'user-admin-001',
 '{"employee_id": "EMP001", "first_name": "John", "last_name": "Doe", "email": "john.doe@acme.com", "phone": "+1-555-2001", "position": "Software Engineer", "department": "Engineering", "hire_date": "2022-03-15", "salary": 95000, "is_active": true}'::jsonb);

INSERT INTO sub_module_records (sub_module_id, tenant_id, created_by, data) VALUES
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 
 (SELECT id FROM tenants LIMIT 1),
 'user-admin-001',
 '{"employee_id": "EMP002", "first_name": "Jane", "last_name": "Smith", "email": "jane.smith@acme.com", "phone": "+1-555-2002", "position": "Product Manager", "department": "Product", "hire_date": "2021-06-01", "salary": 105000, "is_active": true}'::jsonb);

INSERT INTO sub_module_records (sub_module_id, tenant_id, created_by, data) VALUES
((SELECT id FROM sub_modules WHERE name = 'Employees' LIMIT 1), 
 (SELECT id FROM tenants LIMIT 1),
 'user-admin-001',
 '{"employee_id": "EMP003", "first_name": "Michael", "last_name": "Johnson", "email": "michael.j@acme.com", "phone": "+1-555-2003", "position": "Sales Director", "department": "Sales", "hire_date": "2020-01-10", "salary": 120000, "is_active": true}'::jsonb);

-- 9. Create sample Contact records
INSERT INTO sub_module_records (sub_module_id, tenant_id, created_by, data) VALUES
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 
 (SELECT id FROM tenants LIMIT 1),
 'user-manager-001',
 '{"company_name": "TechCorp Industries", "contact_name": "Alex Rodriguez", "email": "alex@techcorp.com", "phone": "+1-555-3001", "position": "CTO", "industry": "Technology", "website": "https://techcorp.com", "revenue": 5000000}'::jsonb);

INSERT INTO sub_module_records (sub_module_id, tenant_id, created_by, data) VALUES
((SELECT id FROM sub_modules WHERE name = 'Contacts' LIMIT 1), 
 (SELECT id FROM tenants LIMIT 1),
 'user-manager-001',
 '{"company_name": "Global Solutions Ltd", "contact_name": "Lisa Chen", "email": "lisa@globalsolutions.com", "phone": "+1-555-3002", "position": "CEO", "industry": "Consulting", "website": "https://globalsolutions.com", "revenue": 8500000}'::jsonb);

-- 10. Create sample Product records
INSERT INTO sub_module_records (sub_module_id, tenant_id, created_by, data) VALUES
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 
 (SELECT id FROM tenants LIMIT 1),
 'user-manager-001',
 '{"sku": "PROD-001", "product_name": "Professional Laptop", "category": "Electronics", "description": "High-performance business laptop", "unit_price": 1299.99, "quantity_in_stock": 45, "reorder_level": 10}'::jsonb);

INSERT INTO sub_module_records (sub_module_id, tenant_id, created_by, data) VALUES
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 
 (SELECT id FROM tenants LIMIT 1),
 'user-manager-001',
 '{"sku": "PROD-002", "product_name": "Wireless Mouse", "category": "Accessories", "description": "Ergonomic wireless mouse", "unit_price": 49.99, "quantity_in_stock": 150, "reorder_level": 50}'::jsonb);

INSERT INTO sub_module_records (sub_module_id, tenant_id, created_by, data) VALUES
((SELECT id FROM sub_modules WHERE name = 'Products' LIMIT 1), 
 (SELECT id FROM tenants LIMIT 1),
 'user-manager-001',
 '{"sku": "PROD-003", "product_name": "USB-C Cable", "category": "Accessories", "description": "6ft USB-C charging cable", "unit_price": 19.99, "quantity_in_stock": 300, "reorder_level": 100}'::jsonb);

-- 11. Create sample Dashboard
INSERT INTO dashboards (tenant_id, created_by, name, description, is_published, config) VALUES
((SELECT id FROM tenants LIMIT 1),
 'user-admin-001',
 'Executive Overview',
 'Real-time company metrics and KPIs',
 true,
 '{"layout": "grid", "columns": 4, "refresh_interval": 60}'::jsonb);

-- 12. Create sample Suppliers
INSERT INTO suppliers (tenant_id, name, contact_person, email, phone, address, city, country) VALUES
((SELECT id FROM tenants LIMIT 1), 'Premium Electronics Co', 'David Kumar', 'david@premiumelec.com', '+1-555-4001', '123 Tech Street', 'San Francisco', 'USA'),
((SELECT id FROM tenants LIMIT 1), 'Global Parts Distributor', 'Maria Gonzalez', 'maria@globalparts.com', '+1-555-4002', '456 Supply Ave', 'Los Angeles', 'USA'),
((SELECT id FROM tenants LIMIT 1), 'Asia Tech Supplies', 'Wei Zhang', 'wei@asiatech.com', '+86-10-5000-1001', '789 Trade Road', 'Shanghai', 'China');

-- 13. Create sample Supplier Ratings
INSERT INTO supplier_ratings (supplier_id, quality_score, delivery_score, price_score, communication_score, review) VALUES
((SELECT id FROM suppliers LIMIT 1), 4.5, 4.8, 4.2, 4.6, 'Excellent quality products and reliable delivery'),
((SELECT suppliers.id FROM suppliers ORDER BY suppliers.id DESC LIMIT 1 OFFSET 1), 4.2, 4.0, 4.5, 4.1, 'Good pricing but occasional delays'),
((SELECT suppliers.id FROM suppliers ORDER BY suppliers.id DESC LIMIT 1 OFFSET 2), 4.3, 4.4, 4.7, 4.2, 'Competitive pricing with good quality');

-- 14. Create sample Activities
INSERT INTO activity_logs (tenant_id, user_id, action, entity_type, entity_id, changes) VALUES
((SELECT id FROM tenants LIMIT 1), 'user-admin-001', 'CREATE', 'sub_module_records', 'EMP001', '{"event": "Employee record created"}'::jsonb),
((SELECT id FROM tenants LIMIT 1), 'user-manager-001', 'UPDATE', 'sub_module_records', 'PROD-001', '{"event": "Product stock updated", "quantity": 45}'::jsonb),
((SELECT id FROM tenants LIMIT 1), 'user-staff-001', 'VIEW', 'sub_module_records', 'CONT-001', '{"event": "Contact record viewed"}'::jsonb);

-- 15. Create sample Notifications
INSERT INTO notifications (tenant_id, user_id, title, message, type, read) VALUES
((SELECT id FROM tenants LIMIT 1), 'user-admin-001', 'New Employee Added', 'John Doe has been added to the system', 'info', false),
((SELECT id FROM tenants LIMIT 1), 'user-manager-001', 'Low Stock Alert', 'Product PROD-001 stock is below reorder level', 'warning', false),
((SELECT id FROM tenants LIMIT 1), 'user-staff-001', 'Comment Mention', 'You were mentioned in a comment by Jane Smith', 'mention', false);

-- 16. Create sample Comments
INSERT INTO comments (tenant_id, sub_module_record_id, user_id, content) VALUES
((SELECT id FROM tenants LIMIT 1), 
 (SELECT id FROM sub_module_records WHERE data->>'employee_id' = 'EMP001' LIMIT 1),
 'user-manager-001',
 'Great performance this quarter! Keep up the excellent work. @user-admin-001');

INSERT INTO comments (tenant_id, sub_module_record_id, user_id, content) VALUES
((SELECT id FROM tenants LIMIT 1), 
 (SELECT id FROM sub_module_records WHERE data->>'company_name' = 'TechCorp Industries' LIMIT 1),
 'user-staff-001',
 'Following up on the proposal we discussed last week.');

COMMIT;
