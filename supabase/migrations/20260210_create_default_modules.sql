-- Create default modules for all tenants
-- This migration adds standard HR, CRM, Inventory, Logistics, and Suppliers modules

-- First, let's create the modules using a PL/pgSQL function
DO $$
DECLARE
  tenant_record RECORD;
  module_names TEXT[] := ARRAY['HR', 'CRM', 'Inventory', 'Logistics', 'Suppliers'];
  module_name TEXT;
  module_config JSONB;
BEGIN
  -- Iterate through all active tenants
  FOR tenant_record IN 
    SELECT id, name, code FROM tenants WHERE status = 'active'
  LOOP
    -- Create each module for this tenant
    FOREACH module_name IN ARRAY module_names
    LOOP
      -- Set up default configuration for each module
      CASE module_name
        WHEN 'HR' THEN
          module_config := jsonb_build_object(
            'tables', jsonb_build_array('employees', 'departments', 'positions'),
            'features', jsonb_build_array('performance', 'attendance', 'payroll'),
            'color', '#3B82F6'
          );
        WHEN 'CRM' THEN
          module_config := jsonb_build_object(
            'tables', jsonb_build_array('contacts', 'companies', 'deals'),
            'features', jsonb_build_array('leads', 'pipeline', 'reporting'),
            'color', '#10B981'
          );
        WHEN 'Inventory' THEN
          module_config := jsonb_build_object(
            'tables', jsonb_build_array('products', 'warehouses', 'stock_levels'),
            'features', jsonb_build_array('tracking', 'reorder', 'valuation'),
            'color', '#F59E0B'
          );
        WHEN 'Logistics' THEN
          module_config := jsonb_build_object(
            'tables', jsonb_build_array('shipments', 'vehicles', 'routes'),
            'features', jsonb_build_array('tracking', 'optimization', 'reporting'),
            'color', '#EF4444'
          );
        WHEN 'Suppliers' THEN
          module_config := jsonb_build_object(
            'tables', jsonb_build_array('suppliers', 'contacts', 'agreements'),
            'features', jsonb_build_array('sourcing', 'contracts', 'performance'),
            'color', '#8B5CF6'
          );
      END CASE;

      -- Check if module already exists
      IF NOT EXISTS (
        SELECT 1 FROM sub_modules 
        WHERE tenant_id = tenant_record.id 
        AND name ->> 'en' = module_name
      ) THEN
        -- Insert the module
        INSERT INTO sub_modules (
          id,
          tenant_id,
          name,
          description,
          config,
          status,
          created_at,
          updated_at
        ) VALUES (
          gen_random_uuid(),
          tenant_record.id,
          jsonb_build_object('en', module_name, 'ar', CASE 
            WHEN module_name = 'HR' THEN 'الموارد البشرية'
            WHEN module_name = 'CRM' THEN 'إدارة علاقات العملاء'
            WHEN module_name = 'Inventory' THEN 'الجرد'
            WHEN module_name = 'Logistics' THEN 'الخدمات اللوجستية'
            WHEN module_name = 'Suppliers' THEN 'الموردين'
            ELSE module_name
          END),
          jsonb_build_object('en', CASE 
            WHEN module_name = 'HR' THEN 'Human Resources Management'
            WHEN module_name = 'CRM' THEN 'Customer Relationship Management'
            WHEN module_name = 'Inventory' THEN 'Inventory and Stock Management'
            WHEN module_name = 'Logistics' THEN 'Logistics and Shipping'
            WHEN module_name = 'Suppliers' THEN 'Supplier Management'
            ELSE module_name
          END),
          module_config,
          'active',
          NOW(),
          NOW()
        );
      END IF;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Default modules created/verified for all tenants';
END $$;
