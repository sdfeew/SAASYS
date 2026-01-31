-- ============================================================================
-- ADVANCED DASHBOARD BUILDER - COMPLETE DATABASE SETUP
-- Execute this entire script in your Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. ENSURE sub_modules TABLE IS PROPERLY SET UP
-- ============================================================================
ALTER TABLE IF EXISTS public.sub_modules 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'Grid';

-- ============================================================================
-- 2. CREATE records TABLE (Dynamic Records Storage)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_module_id UUID NOT NULL REFERENCES public.sub_modules(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  CONSTRAINT records_tenant_fk FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_records_module_id ON public.records(sub_module_id);
CREATE INDEX IF NOT EXISTS idx_records_tenant_id ON public.records(tenant_id);
CREATE INDEX IF NOT EXISTS idx_records_created_at ON public.records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_updated_at ON public.records(updated_at DESC);

-- ============================================================================
-- 3. RLS POLICIES FOR records TABLE
-- ============================================================================
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view records in their tenant" ON public.records;
DROP POLICY IF EXISTS "Users can insert records in their tenant" ON public.records;
DROP POLICY IF EXISTS "Users can update own records" ON public.records;
DROP POLICY IF EXISTS "Users can delete own records" ON public.records;

CREATE POLICY "Users can view records in their tenant"
  ON public.records FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert records in their tenant"
  ON public.records FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can update own records"
  ON public.records FOR UPDATE
  USING (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ))
  WITH CHECK (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete own records"
  ON public.records FOR DELETE
  USING (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ));

-- ============================================================================
-- 4. CREATE FUNCTION TO UPDATE updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_records_updated_at ON public.records;
CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON public.records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 5. CREATE dashboards TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  widgets JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_dashboards_tenant_id ON public.dashboards(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dashboards_created_at ON public.dashboards(created_at DESC);

ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view dashboards in their tenant" ON public.dashboards;
DROP POLICY IF EXISTS "Users can create dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can update own dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Users can delete own dashboards" ON public.dashboards;

CREATE POLICY "Users can view dashboards in their tenant"
  ON public.dashboards FOR SELECT
  USING (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can create dashboards"
  ON public.dashboards FOR INSERT
  WITH CHECK (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can update own dashboards"
  ON public.dashboards FOR UPDATE
  USING (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ))
  WITH CHECK (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can delete own dashboards"
  ON public.dashboards FOR DELETE
  USING (tenant_id IN (
    SELECT id FROM public.tenants WHERE id IN (
      SELECT tenant_id FROM public.user_profiles WHERE id = auth.uid()
    )
  ));

DROP TRIGGER IF EXISTS update_dashboards_updated_at ON public.dashboards;
CREATE TRIGGER update_dashboards_updated_at BEFORE UPDATE ON public.dashboards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- 6. SAMPLE DATA FOR TESTING - SALES MODULE
-- ============================================================================
-- First, get your actual values by running these queries:
-- SELECT id FROM public.tenants LIMIT 1;
-- SELECT id FROM public.sub_modules LIMIT 1;

-- Then replace YOUR_TENANT_ID and YOUR_MODULE_ID below and uncomment:

/*
DO $$
DECLARE
  v_tenant_id UUID := 'e9a58396-5696-42b9-b14b-bad4cedcabaa';
  v_module_id UUID := '971835d2-8216-4e85-a31d-3d56b1fdd2d9';
BEGIN
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
END $$;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Uncomment to verify:
-- SELECT COUNT(*) as total_records FROM public.records;
-- SELECT COUNT(*) as total_modules FROM public.sub_modules;
-- SELECT COUNT(*) as total_dashboards FROM public.dashboards;
-- SELECT * FROM public.records LIMIT 5;

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- All tables, indexes, RLS policies, and triggers are now ready.
-- The application can now display real data in all charts and components!
