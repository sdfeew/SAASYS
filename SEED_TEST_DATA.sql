-- ============================================================================
-- SEED TEST DATA SCRIPT
-- Populate database with sample test data for development
-- Author: Database Migration Script
-- Date: 2026-01-31
-- ============================================================================
-- This script will create:
-- 1. Test tenant
-- 2. Test users (admin, manager, user)
-- 3. Sub-modules for each main module
-- 4. Fields for each sub-module
-- 5. Sample records for testing
-- 6. Sample relationships
-- ============================================================================

-- NOTE: First, you need to create auth users manually in Supabase
-- OR use the signup/register flow to create users
-- Then come back and run this script to seed additional test data

DO $$
DECLARE
    v_test_tenant_id UUID;
    v_test_admin_id UUID;
    v_test_manager_id UUID;
    v_test_user_id UUID;
    
    -- Main Module IDs
    v_hr_module_id UUID;
    v_crm_module_id UUID;
    v_inventory_module_id UUID;
    v_logistics_module_id UUID;
    v_suppliers_module_id UUID;
    
    -- Sub Module IDs
    v_employees_sub_module_id UUID;
    v_customers_sub_module_id UUID;
    v_products_sub_module_id UUID;
    v_orders_sub_module_id UUID;
    v_supplier_accounts_sub_module_id UUID;
    
    -- Field IDs
    v_field_id UUID;
    
    -- Record IDs
    v_employee1_id UUID;
    v_employee2_id UUID;
    v_customer1_id UUID;
    v_product1_id UUID;
    v_product2_id UUID;
    v_supplier1_id UUID;

BEGIN
    RAISE NOTICE 'Starting to seed test data...';

    -- ========================================================================
    -- STEP 1: GET THE FIRST USER'S TENANT (who has a profile)
    -- ========================================================================
    
    SELECT up.tenant_id INTO v_test_tenant_id
    FROM public.user_profiles up
    ORDER BY up.created_at ASC
    LIMIT 1;
    
    IF v_test_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No user profiles found. Please sign up first before seeding data.';
    END IF;
    
    RAISE NOTICE 'Using tenant: %', v_test_tenant_id;

    -- ========================================================================
    -- STEP 2: GET MAIN MODULE IDS
    -- ========================================================================
    
    SELECT id INTO v_hr_module_id FROM public.main_modules WHERE code = 'HR' LIMIT 1;
    SELECT id INTO v_crm_module_id FROM public.main_modules WHERE code = 'CRM' LIMIT 1;
    SELECT id INTO v_inventory_module_id FROM public.main_modules WHERE code = 'INVENTORY' LIMIT 1;
    SELECT id INTO v_logistics_module_id FROM public.main_modules WHERE code = 'LOGISTICS' LIMIT 1;
    SELECT id INTO v_suppliers_module_id FROM public.main_modules WHERE code = 'SUPPLIERS' LIMIT 1;

    RAISE NOTICE 'Main modules retrieved - HR: %, CRM: %, INVENTORY: %, LOGISTICS: %, SUPPLIERS: %',
        v_hr_module_id, v_crm_module_id, v_inventory_module_id, v_logistics_module_id, v_suppliers_module_id;

    -- ========================================================================
    -- STEP 3: CREATE SUB-MODULES FOR EACH MAIN MODULE
    -- ========================================================================
    
    -- 3.1 HR Module - Employees Sub-Module
    INSERT INTO public.sub_modules (
        tenant_id, main_module_id, code, name, description, icon, order_index, status
    ) VALUES (
        v_test_tenant_id, v_hr_module_id, 'EMPLOYEES', 
        '{"en": "Employees", "ar": "الموظفون"}'::jsonb,
        '{"en": "Manage employee records and information", "ar": "إدارة سجلات الموظفين"}'::jsonb,
        'Users', 1, 'active'
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_employees_sub_module_id;
    
    -- 3.2 CRM Module - Customers Sub-Module
    INSERT INTO public.sub_modules (
        tenant_id, main_module_id, code, name, description, icon, order_index, status
    ) VALUES (
        v_test_tenant_id, v_crm_module_id, 'CUSTOMERS',
        '{"en": "Customers", "ar": "العملاء"}'::jsonb,
        '{"en": "Manage customer information and interactions", "ar": "إدارة معلومات العملاء"}'::jsonb,
        'Users', 1, 'active'
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_customers_sub_module_id;
    
    -- 3.3 Inventory Module - Products Sub-Module
    INSERT INTO public.sub_modules (
        tenant_id, main_module_id, code, name, description, icon, order_index, status
    ) VALUES (
        v_test_tenant_id, v_inventory_module_id, 'PRODUCTS',
        '{"en": "Products", "ar": "المنتجات"}'::jsonb,
        '{"en": "Manage product catalog and inventory levels", "ar": "إدارة الكتالوج والمخزون"}'::jsonb,
        'Package', 1, 'active'
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_products_sub_module_id;
    
    -- 3.4 Logistics Module - Orders Sub-Module
    INSERT INTO public.sub_modules (
        tenant_id, main_module_id, code, name, description, icon, order_index, status
    ) VALUES (
        v_test_tenant_id, v_logistics_module_id, 'ORDERS',
        '{"en": "Orders", "ar": "الطلبات"}'::jsonb,
        '{"en": "Track and manage orders", "ar": "تتبع وإدارة الطلبات"}'::jsonb,
        'Truck', 1, 'active'
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_orders_sub_module_id;
    
    -- 3.5 Suppliers Module - Supplier Accounts Sub-Module
    INSERT INTO public.sub_modules (
        tenant_id, main_module_id, code, name, description, icon, order_index, status
    ) VALUES (
        v_test_tenant_id, v_suppliers_module_id, 'SUPPLIER_ACCOUNTS',
        '{"en": "Supplier Accounts", "ar": "حسابات الموردين"}'::jsonb,
        '{"en": "Manage supplier relationships and accounts", "ar": "إدارة علاقات الموردين"}'::jsonb,
        'Building', 1, 'active'
    )
    ON CONFLICT (tenant_id, code) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO v_supplier_accounts_sub_module_id;

    RAISE NOTICE 'Sub-modules created - Employees: %, Customers: %, Products: %, Orders: %, Suppliers: %',
        v_employees_sub_module_id, v_customers_sub_module_id, v_products_sub_module_id, 
        v_orders_sub_module_id, v_supplier_accounts_sub_module_id;

    -- ========================================================================
    -- STEP 4: CREATE FIELDS FOR EMPLOYEES SUB-MODULE
    -- ========================================================================
    
    -- Employee ID field
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_employees_sub_module_id, 'employee_id', '{"en": "Employee ID", "ar": "رقم الموظف"}'::jsonb, 'TEXT', true, true, 1, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    -- Employee Name field
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_employees_sub_module_id, 'full_name', '{"en": "Full Name", "ar": "الاسم الكامل"}'::jsonb, 'TEXT', true, true, 2, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    -- Employee Email field
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_employees_sub_module_id, 'email', '{"en": "Email", "ar": "البريد الإلكتروني"}'::jsonb, 'EMAIL', true, true, 3, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    -- Department field
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status,
        ui_config
    ) VALUES (v_test_tenant_id, v_employees_sub_module_id, 'department', '{"en": "Department", "ar": "القسم"}'::jsonb, 'SELECT', false, true, 4, 'active',
        '{"options": [{"value": "IT", "label": "IT"}, {"value": "HR", "label": "HR"}, {"value": "Sales", "label": "Sales"}, {"value": "Operations", "label": "Operations"}]}'::jsonb)
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    -- Salary field
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_employees_sub_module_id, 'salary', '{"en": "Salary", "ar": "الراتب"}'::jsonb, 'CURRENCY', false, true, 5, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    -- Hire Date field
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_employees_sub_module_id, 'hire_date', '{"en": "Hire Date", "ar": "تاريخ التعيين"}'::jsonb, 'DATE', false, true, 6, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE 'Employee fields created successfully';

    -- ========================================================================
    -- STEP 5: CREATE FIELDS FOR CUSTOMERS SUB-MODULE
    -- ========================================================================
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_customers_sub_module_id, 'customer_name', '{"en": "Customer Name", "ar": "اسم العميل"}'::jsonb, 'TEXT', true, true, 1, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_customers_sub_module_id, 'email', '{"en": "Email", "ar": "البريد الإلكتروني"}'::jsonb, 'EMAIL', true, true, 2, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_customers_sub_module_id, 'phone', '{"en": "Phone", "ar": "الهاتف"}'::jsonb, 'PHONE', false, true, 3, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status,
        ui_config
    ) VALUES (v_test_tenant_id, v_customers_sub_module_id, 'industry', '{"en": "Industry", "ar": "الصناعة"}'::jsonb, 'SELECT', false, true, 4, 'active',
        '{"options": [{"value": "Technology", "label": "Technology"}, {"value": "Retail", "label": "Retail"}, {"value": "Finance", "label": "Finance"}]}'::jsonb)
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_customers_sub_module_id, 'annual_revenue', '{"en": "Annual Revenue", "ar": "الإيرادات السنوية"}'::jsonb, 'CURRENCY', false, true, 5, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE 'Customer fields created successfully';

    -- ========================================================================
    -- STEP 6: CREATE FIELDS FOR PRODUCTS SUB-MODULE
    -- ========================================================================
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_products_sub_module_id, 'product_code', '{"en": "Product Code", "ar": "رمز المنتج"}'::jsonb, 'TEXT', true, true, 1, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_products_sub_module_id, 'product_name', '{"en": "Product Name", "ar": "اسم المنتج"}'::jsonb, 'TEXT', true, true, 2, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_products_sub_module_id, 'unit_price', '{"en": "Unit Price", "ar": "سعر الوحدة"}'::jsonb, 'CURRENCY', true, true, 3, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status
    ) VALUES (v_test_tenant_id, v_products_sub_module_id, 'quantity_in_stock', '{"en": "Quantity in Stock", "ar": "الكمية في المخزون"}'::jsonb, 'NUMBER', true, true, 4, 'active')
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;
    
    INSERT INTO public.sub_module_fields (
        tenant_id, sub_module_id, name, label, data_type, required, is_visible_in_list, order_index, status,
        ui_config
    ) VALUES (v_test_tenant_id, v_products_sub_module_id, 'category', '{"en": "Category", "ar": "الفئة"}'::jsonb, 'SELECT', false, true, 5, 'active',
        '{"options": [{"value": "Electronics", "label": "Electronics"}, {"value": "Clothing", "label": "Clothing"}, {"value": "Books", "label": "Books"}]}'::jsonb)
    ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE 'Product fields created successfully';

    -- ========================================================================
    -- STEP 7: CREATE SAMPLE RECORDS (WITHOUT USING TEST AUTH USERS)
    -- ========================================================================
    -- For simplicity, we'll use a placeholder user ID that exists in auth.users
    -- In production, you should have real test user IDs here
    
    -- Create sample employees
    v_employee1_id := gen_random_uuid();
    INSERT INTO public.sub_module_records (
        id, tenant_id, sub_module_id, data, status, created_by, created_at
    ) VALUES (
        v_employee1_id,
        v_test_tenant_id,
        v_employees_sub_module_id,
        '{
            "employee_id": "EMP001",
            "full_name": "Ahmed Hassan",
            "email": "ahmed@testcompany.com",
            "department": "IT",
            "salary": 5000,
            "hire_date": "2023-01-15"
        }'::jsonb,
        'active',
        (SELECT id FROM auth.users LIMIT 1), -- Use first auth user
        CURRENT_TIMESTAMP
    );
    
    v_employee2_id := gen_random_uuid();
    INSERT INTO public.sub_module_records (
        id, tenant_id, sub_module_id, data, status, created_by, created_at
    ) VALUES (
        v_employee2_id,
        v_test_tenant_id,
        v_employees_sub_module_id,
        '{
            "employee_id": "EMP002",
            "full_name": "Fatima Ahmed",
            "email": "fatima@testcompany.com",
            "department": "HR",
            "salary": 4500,
            "hire_date": "2022-06-01"
        }'::jsonb,
        'active',
        (SELECT id FROM auth.users LIMIT 1),
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Employee records created: % and %', v_employee1_id, v_employee2_id;

    -- Create sample customers
    v_customer1_id := gen_random_uuid();
    INSERT INTO public.sub_module_records (
        id, tenant_id, sub_module_id, data, status, created_by, created_at
    ) VALUES (
        v_customer1_id,
        v_test_tenant_id,
        v_customers_sub_module_id,
        '{
            "customer_name": "Tech Solutions LLC",
            "email": "info@techsolutions.com",
            "phone": "+1-555-0101",
            "industry": "Technology",
            "annual_revenue": 2500000
        }'::jsonb,
        'active',
        (SELECT id FROM auth.users LIMIT 1),
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Customer records created: %', v_customer1_id;

    -- Create sample products
    v_product1_id := gen_random_uuid();
    INSERT INTO public.sub_module_records (
        id, tenant_id, sub_module_id, data, status, created_by, created_at
    ) VALUES (
        v_product1_id,
        v_test_tenant_id,
        v_products_sub_module_id,
        '{
            "product_code": "PROD001",
            "product_name": "Laptop Computer",
            "unit_price": 999.99,
            "quantity_in_stock": 50,
            "category": "Electronics"
        }'::jsonb,
        'active',
        (SELECT id FROM auth.users LIMIT 1),
        CURRENT_TIMESTAMP
    );
    
    v_product2_id := gen_random_uuid();
    INSERT INTO public.sub_module_records (
        id, tenant_id, sub_module_id, data, status, created_by, created_at
    ) VALUES (
        v_product2_id,
        v_test_tenant_id,
        v_products_sub_module_id,
        '{
            "product_code": "PROD002",
            "product_name": "Office Chair",
            "unit_price": 299.99,
            "quantity_in_stock": 120,
            "category": "Electronics"
        }'::jsonb,
        'active',
        (SELECT id FROM auth.users LIMIT 1),
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Product records created: % and %', v_product1_id, v_product2_id;

    -- ========================================================================
    -- STEP 8: CREATE SAMPLE RELATIONSHIPS
    -- ========================================================================
    
    INSERT INTO public.record_relationships (
        tenant_id, source_record_id, target_record_id, source_module_id, target_module_id,
        relationship_type, description, created_by, created_at
    ) VALUES (
        v_test_tenant_id,
        v_customer1_id, v_employee1_id,
        v_customers_sub_module_id, v_employees_sub_module_id,
        'ACCOUNT_MANAGER',
        'Ahmed is the account manager for Tech Solutions',
        (SELECT id FROM auth.users LIMIT 1),
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Sample relationships created';

    -- ========================================================================
    -- STEP 9: CREATE ACTIVITY LOG ENTRIES
    -- ========================================================================
    
    INSERT INTO public.record_activity (
        tenant_id, record_id, module_id, activity_type, user_id, user_name, 
        user_email, description, created_at
    ) VALUES (
        v_test_tenant_id, v_employee1_id, v_employees_sub_module_id, 'created',
        (SELECT id FROM auth.users LIMIT 1), 'Test User', 'test@example.com',
        'Created employee record for Ahmed Hassan',
        CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Activity logs created';

    -- ========================================================================
    -- STEP 10: DISPLAY SUMMARY
    -- ========================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'TEST DATA SEEDING COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE 'Test Tenant ID: %', v_test_tenant_id;
    RAISE NOTICE 'Sub-Modules Created: 5 (Employees, Customers, Products, Orders, Suppliers)';
    RAISE NOTICE 'Fields Created: 16 total across all modules';
    RAISE NOTICE 'Sample Records Created: 5 (2 Employees, 1 Customer, 2 Products)';
    RAISE NOTICE 'Relationships Created: 1';
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '1. Use your Frontend to register test users';
    RAISE NOTICE '2. After users are created, they can view the test data';
    RAISE NOTICE '3. Create more sub-modules and fields as needed';
    RAISE NOTICE '========================================================================';

END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to check the data)
-- ============================================================================

-- View all tenants
-- SELECT id, name, code, status FROM public.tenants;

-- View all sub-modules
-- SELECT id, code, name FROM public.sub_modules ORDER BY created_at DESC;

-- View all fields
-- SELECT f.name, f.label, f.data_type, m.code as module_code 
-- FROM public.sub_module_fields f
-- JOIN public.sub_modules m ON f.sub_module_id = m.id
-- ORDER BY f.created_at DESC;

-- View all records
-- SELECT r.id, r.data, m.code as module_code 
-- FROM public.sub_module_records r
-- JOIN public.sub_modules m ON r.sub_module_id = m.id
-- ORDER BY r.created_at DESC;

-- View relationships
-- SELECT * FROM public.record_relationships ORDER BY created_at DESC;

-- ============================================================================
-- END OF SEED TEST DATA SCRIPT
-- ============================================================================
