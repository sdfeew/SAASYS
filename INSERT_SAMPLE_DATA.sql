-- ============================================================================
-- FIX: INSERT SAMPLE DATA WITH AUTO-DETECTED MODULE ID
-- ============================================================================
-- This script will automatically find your module and insert sample data

-- Step 1: First, verify your modules exist by running this query alone:
-- SELECT id, name, main_module_id FROM public.sub_modules LIMIT 10;

-- Step 2: Copy the ID from above and use it in the script below

-- Method 1: Auto-detect (recommended)
-- This will use the first module found in your tenant
DO $$
DECLARE
  v_tenant_id UUID;
  v_module_id UUID;
BEGIN
  -- Get your tenant ID
  SELECT id INTO v_tenant_id FROM public.tenants LIMIT 1;
  
  -- Get the first module ID
  SELECT id INTO v_module_id FROM public.sub_modules LIMIT 1;
  
  IF v_tenant_id IS NULL THEN
    RAISE EXCEPTION 'No tenant found! Please create a tenant first.';
  END IF;
  
  IF v_module_id IS NULL THEN
    RAISE EXCEPTION 'No module found! Please create a module first.';
  END IF;
  
  RAISE NOTICE 'Using Tenant ID: %', v_tenant_id;
  RAISE NOTICE 'Using Module ID: %', v_module_id;
  
  -- Insert sample data
  INSERT INTO public.records (sub_module_id, tenant_id, data, created_by, created_at)
  VALUES
    (v_module_id, v_tenant_id, '{"region": "North", "sales": 15000, "date": "2025-01-15", "status": "completed", "product": "Product A", "quantity": 50}'::jsonb, auth.uid(), NOW() - INTERVAL '7 days'),
    (v_module_id, v_tenant_id, '{"region": "South", "sales": 12000, "date": "2025-01-15", "status": "pending", "product": "Product B", "quantity": 40}'::jsonb, auth.uid(), NOW() - INTERVAL '7 days'),
    (v_module_id, v_tenant_id, '{"region": "East", "sales": 18000, "date": "2025-01-16", "status": "completed", "product": "Product A", "quantity": 60}'::jsonb, auth.uid(), NOW() - INTERVAL '6 days'),
    (v_module_id, v_tenant_id, '{"region": "West", "sales": 14000, "date": "2025-01-16", "status": "completed", "product": "Product C", "quantity": 70}'::jsonb, auth.uid(), NOW() - INTERVAL '6 days'),
    (v_module_id, v_tenant_id, '{"region": "North", "sales": 16000, "date": "2025-01-17", "status": "pending", "product": "Product B", "quantity": 55}'::jsonb, auth.uid(), NOW() - INTERVAL '5 days'),
    (v_module_id, v_tenant_id, '{"region": "South", "sales": 13000, "date": "2025-01-17", "status": "completed", "product": "Product A", "quantity": 45}'::jsonb, auth.uid(), NOW() - INTERVAL '5 days'),
    (v_module_id, v_tenant_id, '{"region": "East", "sales": 17000, "date": "2025-01-18", "status": "completed", "product": "Product C", "quantity": 65}'::jsonb, auth.uid(), NOW() - INTERVAL '4 days'),
    (v_module_id, v_tenant_id, '{"region": "West", "sales": 15000, "date": "2025-01-18", "status": "pending", "product": "Product B", "quantity": 50}'::jsonb, auth.uid(), NOW() - INTERVAL '4 days'),
    (v_module_id, v_tenant_id, '{"region": "North", "sales": 18000, "date": "2025-01-19", "status": "completed", "product": "Product C", "quantity": 60}'::jsonb, auth.uid(), NOW() - INTERVAL '3 days'),
    (v_module_id, v_tenant_id, '{"region": "South", "sales": 14000, "date": "2025-01-19", "status": "completed", "product": "Product A", "quantity": 47}'::jsonb, auth.uid(), NOW() - INTERVAL '3 days'),
    (v_module_id, v_tenant_id, '{"region": "East", "sales": 19000, "date": "2025-01-20", "status": "pending", "product": "Product B", "quantity": 63}'::jsonb, auth.uid(), NOW() - INTERVAL '2 days'),
    (v_module_id, v_tenant_id, '{"region": "West", "sales": 16000, "date": "2025-01-20", "status": "completed", "product": "Product A", "quantity": 53}'::jsonb, auth.uid(), NOW() - INTERVAL '2 days'),
    (v_module_id, v_tenant_id, '{"region": "North", "sales": 17000, "date": "2025-01-21", "status": "completed", "product": "Product B", "quantity": 57}'::jsonb, auth.uid(), NOW() - INTERVAL '1 day'),
    (v_module_id, v_tenant_id, '{"region": "South", "sales": 15000, "date": "2025-01-21", "status": "pending", "product": "Product C", "quantity": 50}'::jsonb, auth.uid(), NOW() - INTERVAL '1 day'),
    (v_module_id, v_tenant_id, '{"region": "East", "sales": 16000, "date": "2025-01-22", "status": "completed", "product": "Product A", "quantity": 53}'::jsonb, auth.uid(), NOW()),
    (v_module_id, v_tenant_id, '{"region": "West", "sales": 14000, "date": "2025-01-22", "status": "completed", "product": "Product B", "quantity": 47}'::jsonb, auth.uid(), NOW());
  
  RAISE NOTICE 'Successfully inserted 16 sample records!';
END $$;

-- Verify the data was inserted:
SELECT COUNT(*) as total_records FROM public.records;
SELECT data FROM public.records ORDER BY created_at DESC LIMIT 5;
