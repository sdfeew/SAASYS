-- ============================================================================
-- SEED SUB_MODULE FIELDS FOR DASHBOARD DATA VISUALIZATION
-- Execute this script in Supabase SQL Editor after running COMPLETE_DATABASE_SETUP.sql
-- ============================================================================

DO $$
DECLARE
  v_tenant_id UUID := 'e9a58396-5696-42b9-b14b-bad4cedcabaa';
  v_module_id UUID := '971835d2-8216-4e85-a31d-3d56b1fdd2d9';
BEGIN
  -- Insert field definitions for the Sales module
  
  -- 1. Region field (TEXT)
  INSERT INTO public.sub_module_fields (
    tenant_id, sub_module_id, name, label, data_type, required, 
    is_filter, is_indexed, is_visible_in_list, order_index, status
  ) VALUES (
    v_tenant_id, v_module_id, 'region', '{"en": "Region"}'::jsonb, 'TEXT', 
    false, true, true, true, 1, 'active'
  ) ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET status = 'active';
  
  -- 2. Sales field (CURRENCY)
  INSERT INTO public.sub_module_fields (
    tenant_id, sub_module_id, name, label, data_type, required, 
    is_filter, is_indexed, is_visible_in_list, order_index, status
  ) VALUES (
    v_tenant_id, v_module_id, 'sales', '{"en": "Sales"}'::jsonb, 'CURRENCY', 
    false, true, true, true, 2, 'active'
  ) ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET status = 'active';
  
  -- 3. Date field (DATE)
  INSERT INTO public.sub_module_fields (
    tenant_id, sub_module_id, name, label, data_type, required, 
    is_filter, is_indexed, is_visible_in_list, order_index, status
  ) VALUES (
    v_tenant_id, v_module_id, 'date', '{"en": "Date"}'::jsonb, 'DATE', 
    false, true, true, true, 3, 'active'
  ) ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET status = 'active';
  
  -- 4. Status field (SELECT)
  INSERT INTO public.sub_module_fields (
    tenant_id, sub_module_id, name, label, data_type, required, 
    is_filter, is_indexed, is_visible_in_list, order_index, status,
    ui_config
  ) VALUES (
    v_tenant_id, v_module_id, 'status', '{"en": "Status"}'::jsonb, 'SELECT', 
    false, true, true, true, 4, 'active',
    '{"options": [{"value": "completed", "label": "Completed"}, {"value": "pending", "label": "Pending"}]}'::jsonb
  ) ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET status = 'active';
  
  -- 5. Product field (TEXT)
  INSERT INTO public.sub_module_fields (
    tenant_id, sub_module_id, name, label, data_type, required, 
    is_filter, is_indexed, is_visible_in_list, order_index, status
  ) VALUES (
    v_tenant_id, v_module_id, 'product', '{"en": "Product"}'::jsonb, 'TEXT', 
    false, true, true, true, 5, 'active'
  ) ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET status = 'active';
  
  -- 6. Quantity field (NUMBER)
  INSERT INTO public.sub_module_fields (
    tenant_id, sub_module_id, name, label, data_type, required, 
    is_filter, is_indexed, is_visible_in_list, order_index, status
  ) VALUES (
    v_tenant_id, v_module_id, 'quantity', '{"en": "Quantity"}'::jsonb, 'NUMBER', 
    false, true, true, true, 6, 'active'
  ) ON CONFLICT (tenant_id, sub_module_id, name) DO UPDATE SET status = 'active';

  RAISE NOTICE 'Successfully seeded 6 module fields for module: %', v_module_id;
END $$;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Uncomment to verify the fields were created:
-- SELECT name, label, data_type, order_index FROM public.sub_module_fields 
-- WHERE sub_module_id = '971835d2-8216-4e85-a31d-3d56b1fdd2d9' 
-- ORDER BY order_index;
